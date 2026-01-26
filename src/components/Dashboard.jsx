import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { supabase } from '../supabaseClient'
import './Dashboard.css'
import './Certificate.css'

export default function Dashboard() {
  const { user, logout, canManageUsers } = useAuth()
  const certificateRef = useRef(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    certificateNumber: '',
    registrationNumber: '',
    diplomaNumber: '',
    organizationName: '',
    validFrom: '',
    validTo: '',
    verificationPhone: '',
    durationYears: '', // Amal qilish muddati (yil)
    hours: '',         // Soat
    issueDate: ''      // Berilgan sana
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [qrHistory, setQrHistory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [currentQrDataURL, setCurrentQrDataURL] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  const filteredHistory = qrHistory.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}.${month}.${year}`
  }

  const formatQRText = () => {
    const parts = []
    if (formData.fullName) parts.push(`1. F.I.SH: ${formData.fullName.toUpperCase()}`)
    if (formData.passport) parts.push(`2. PASPORT MA'LUMOTLARI: ${formData.passport}`)
    if (formData.certificateNumber) parts.push(`3. SERTIFIKAT RAQAMI: ${formData.certificateNumber}`)
    if (formData.registrationNumber) parts.push(`4. QAYD RAQAMI: ${formData.registrationNumber}`)
    if (formData.diplomaNumber) parts.push(`5. DIPLOM RAQAMI: ${formData.diplomaNumber}`)
    if (formData.organizationName) parts.push(`6. YO'NALISH NOMI: ${formData.organizationName.toUpperCase()}`)
    if (formData.validFrom && formData.validTo) {
      parts.push(`7. MUDDATI: ${formatDate(formData.validFrom)} - ${formatDate(formData.validTo)}`)
    }
    if (formData.verificationPhone) {
      parts.push(`8. SERTIFIKAT HAQIQIYLIGINI TEKSHIRISH UCHUN QUYIDAGI RAQAMGA MUROJAAT QILISHINGIZ MUMKIN: ${formData.verificationPhone}`)
    }
    return parts.join('\n')
  }

  const generateQRCode = async () => {
    if (!formData.fullName || !formData.certificateNumber) {
      setMessage('Iltimos, kamida F.I.SH va Sertifikat raqamini kiriting')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const qrText = formatQRText()
      const qrDataURL = await QRCode.toDataURL(qrText, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      })

      setCurrentQrDataURL(qrDataURL)
      await new Promise(resolve => setTimeout(resolve, 100))

      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          width: 3543,
          height: 2480,
          scale: 1,
          useCORS: true,
          allowTaint: true
        })
        const certificateBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))

        const certFileName = `cert_${Date.now()}.png`
        const certFile = new File([certificateBlob], certFileName, { type: 'image/png' })

        const { error: certUploadError } = await supabase.storage
          .from('qrcodes')
          .upload(`${user.id}/${certFileName}`, certFile)

        if (certUploadError) throw certUploadError

        const { data: certUrlData } = supabase.storage
          .from('qrcodes')
          .getPublicUrl(`${user.id}/${certFileName}`)

        const qrResponse = await fetch(qrDataURL)
        const qrBlob = await qrResponse.blob()
        const qrFileName = `qr_${Date.now()}.png`
        const qrFile = new File([qrBlob], qrFileName, { type: 'image/png' })

        const { data: qrUploadData, error: qrUploadError } = await supabase.storage
          .from('qrcodes')
          .upload(`${user.id}/${qrFileName}`, qrFile)

        if (qrUploadError) throw qrUploadError

        const { data: qrUrlData } = supabase.storage
          .from('qrcodes')
          .getPublicUrl(`${user.id}/${qrFileName}`)

        const { error: processError } = await supabase
          .from('process')
          .insert([{
            user_id: user.id,
            qr_text: qrText,
            qr_image_url: qrUrlData.publicUrl,
            certificate_image_url: certUrlData.publicUrl,
            title: formData.fullName || 'Sertifikat',
            description: `Sertifikat: ${formData.certificateNumber}`,
            file_path: qrUploadData.path
          }])
          .select()
          .single()

        if (processError) throw processError

        setMessage('QR kod va sertifikat muvaffaqiyatli yaratildi!')
      } else {
        throw new Error('Sertifikat komponenti topilmadi')
      }

      setFormData({
        fullName: '',
        passport: '',
        certificateNumber: '',
        registrationNumber: '',
        diplomaNumber: '',
        organizationName: '',
        validFrom: '',
        validTo: '',
        verificationPhone: '',
        durationYears: '',
        hours: '',
        issueDate: ''
      })

      setShowModal(false)
      loadHistory()
      setTimeout(() => setMessage(''), 3000)

    } catch (error) {
      setMessage('QR kod yaratishda xatolik: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('process')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setQrHistory(data || [])
    } catch (error) {
    }
  }


  // handleDownload now opens /view-certificate in a new tab and passes data via sessionStorage
  const handleDownload = (qrImageUrl, title, item) => {
    // Try to parse qr_text as JSON (new format)
    let certData = {};
    try {
      certData = JSON.parse(item.qr_text);
      // Add extra fields from item if not present in qr_text
      certData.qrImageUrl = item.qr_image_url || '';
      certData.directorName = certData.directorName || "M.Z.NURULLAYEVA";
      certData.certificateNumber = certData.certificateNumber || (item.description ? item.description.replace('Sertifikat: ', '') : '');
    } catch (e) {
      // Fallback: old text format
      let durationYears = '';
      let studyPeriod = '';
      let hours = '';
      let issueDate = '';
      if (item.qr_text) {
        const lines = item.qr_text.split('\n');
        lines.forEach(line => {
          if (line.includes('MUDDATI:')) {
            const dates = line.split('MUDDATI:')[1].trim().split('-');
            if (dates.length === 2) {
              studyPeriod = dates[0].trim() + ' - ' + dates[1].trim();
              const from = dates[0].trim().split('.').reverse().join('-');
              const to = dates[1].trim().split('.').reverse().join('-');
              durationYears = String(new Date(to).getFullYear() - new Date(from).getFullYear());
            }
          }
          if (line.match(/soat/gi)) {
            const match = line.match(/(\d+)\s*soat/);
            if (match) hours = match[1];
          }
          if (line.match(/Ro'yxatga olingan sana|Berilgan sana/gi)) {
            const match = line.match(/(\d{2}\.\d{2}\.\d{4})/);
            if (match) issueDate = match[1];
          }
        });
      }
      certData = {
        fullName: item.title,
        certificateNumber: item.certificateNumber || (item.description ? item.description.replace('Sertifikat: ', '') : ''),
        diplomaNumber: item.diplomaNumber || '',
        registrationNumber: item.registrationNumber || '',
        organizationName: item.organizationName || '',
        validFrom: item.validFrom || '',
        validTo: item.validTo || '',
        durationYears,
        studyPeriod,
        hours,
        issueDate,
        directorName: "I.M. Fayzullo o'g'li",
        qrImageUrl: item.qr_image_url || '',
      };
    }
    sessionStorage.setItem('viewCertificateData', JSON.stringify(certData));
    window.open('/view-certificate', '_blank');
  }

  const handleDelete = async (item) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('qrcodes')
        .remove([item.file_path])

      

      const { error: dbError } = await supabase
        .from('process')
        .delete()
        .eq('id', item.id)

      if (dbError) throw dbError

      setMessage('QR kod o\'chirildi!')
      setTimeout(() => setMessage(''), 3000)
      loadHistory()
    } catch (error) {
      setMessage('O\'chirishda xatolik yuz berdi')
    }
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006670" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
          <span>Pharmacademy UZ</span>
        </div>
        <div className="nav-right">
          {canManageUsers && canManageUsers(user?.role) && (
            <a href="/users" className="btn-icon-nav" title="Foydalanuvchilar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </a>
          )}
          <button onClick={logout} className="btn-icon-nav" title="Chiqish">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {message && (
        <div className={`alert-message ${message.includes('muvaffaqiyatli') || message.includes('yuklab') || message.includes('chirildi') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="dashboard-content">
        <div className="qr-history-card-full">
          <div className="history-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2>Tarix ({qrHistory.length})</h2>
            </div>
            <div className="history-actions">
              <button onClick={() => navigate('/certificate-generator')} className="btn-qr-create" >
               +YANGI SERTIFIKAT
              </button>
              <input
                type="text"
                className="search-input"
                placeholder="Qidirish (F.I.SH yoki sertifikat raqami)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={loadHistory} className="btn-secondary">Yangilash</button>
            </div>
          </div>

          {qrHistory.length === 0 ? (
            <p className="empty-message">Hozircha QR kodlar yo'q</p>
          ) : filteredHistory.length === 0 ? (
            <p className="empty-message">Qidiruv bo'yicha natija topilmadi</p>
          ) : (
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Ma'lumotlar</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <div className="table-info-stack">
                          <div className="info-name">{item.title}</div>
                          <div className="info-certificate">{item.description.replace('Sertifikat: ', '')}</div>
                          <div className="info-date">
                            {new Date(item.created_at).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="action-buttons-desktop">
                        <div className="action-buttons">
                         
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(item.qr_image_url, item.title, item); }}
                            className="btn-icon btn-download-icon"
                            title="QR kod yuklab olish"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                            </svg>
                          </button>
                          {user?.role === 'superadmin' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                              className="btn-icon btn-delete-icon"
                              title="O'chirish"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
