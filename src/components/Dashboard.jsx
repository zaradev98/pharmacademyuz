import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import QRCode from 'qrcode'
import { supabase } from '../supabaseClient'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout, canManageUsers } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    certificateNumber: '',
    registrationNumber: '',
    diplomaNumber: '',
    organizationName: '',
    validFrom: '',
    validTo: '',
    verificationPhone: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [qrHistory, setQrHistory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

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
    // Kamida bitta maydon to'ldirilganligini tekshirish
    if (!formData.fullName || !formData.certificateNumber) {
      setMessage('Iltimos, kamida F.I.SH va Sertifikat raqamini kiriting')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // QR kod uchun formatlangan matnni yaratish
      const qrText = formatQRText()

      // QR kodni PNG sifatida generatsiya qilish
      const qrDataURL = await QRCode.toDataURL(qrText, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Data URL ni Blob ga o'zgartirish
      const response = await fetch(qrDataURL)
      const blob = await response.blob()

      // Fayl nomini yaratish
      const fileName = `qr_${Date.now()}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      // Supabase storage ga yuklash
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('qrcodes')
        .upload(`${user.id}/${fileName}`, file)

      if (uploadError) throw uploadError

      // Public URL olish
      const { data: urlData } = supabase.storage
        .from('qrcodes')
        .getPublicUrl(`${user.id}/${fileName}`)

      // Process jadvaliga ma'lumot yozish
      const { data: processData, error: processError } = await supabase
        .from('process')
        .insert([
          {
            user_id: user.id,
            qr_text: qrText,
            qr_image_url: urlData.publicUrl,
            title: formData.fullName || 'Sertifikat',
            description: `Sertifikat: ${formData.certificateNumber}`,
            file_path: uploadData.path
          }
        ])
        .select()
        .single()

      if (processError) throw processError

      setMessage('QR kod muvaffaqiyatli yaratildi!')
      // Formani tozalash
      setFormData({
        fullName: '',
        passport: '',
        certificateNumber: '',
        registrationNumber: '',
        diplomaNumber: '',
        organizationName: '',
        validFrom: '',
        validTo: '',
        verificationPhone: ''
      })

      // Modalni yopish va tarixni yangilash
      setShowModal(false)
      loadHistory()
      setTimeout(() => setMessage(''), 3000)

    } catch (error) {
      console.error('Xatolik:', error)
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
      console.error('Tarixni yuklashda xatolik:', error)
    }
  }

  const handleRowClick = (item, e) => {
    // Context menu'ni oldini olish
    e.preventDefault()
    setSelectedItem(item)
    setShowActionModal(true)
  }

  const closeActionModal = () => {
    setShowActionModal(false)
    setSelectedItem(null)
  }

  const handleDownloadClick = () => {
    if (selectedItem) {
      handleDownload(selectedItem.qr_image_url, selectedItem.title)
      closeActionModal()
    }
  }

  const handleDeleteClick = () => {
    if (selectedItem) {
      handleDelete(selectedItem)
      closeActionModal()
    }
  }

  const handleDownload = async (qrImageUrl, title) => {
    try {
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}_qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setMessage('QR kod yuklab olindi!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Yuklab olishda xatolik:', error)
      setMessage('Yuklab olishda xatolik yuz berdi')
    }
  }

  const handleDelete = async (item) => {
    try {
      // Storage dan faylni o'chirish
      const { error: storageError } = await supabase.storage
        .from('qrcodes')
        .remove([item.file_path])

      if (storageError) {
        console.error('Storage xatosi:', storageError)
      }

      // Database dan o'chirish
      const { error: dbError } = await supabase
        .from('process')
        .delete()
        .eq('id', item.id)

      if (dbError) throw dbError

      setMessage('QR kod o\'chirildi!')
      setTimeout(() => setMessage(''), 3000)
      loadHistory()
    } catch (error) {
      console.error('O\'chirishda xatolik:', error)
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
            <rect x="6" y="6" width="1" height="1"/>
            <rect x="17" y="6" width="1" height="1"/>
            <rect x="6" y="17" width="1" height="1"/>
            <rect x="17" y="17" width="1" height="1"/>
          </svg>
          <span>QR Generator</span>
        </div>
        <div className="nav-right">
          {canManageUsers(user.role) && (
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
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Yangi Sertifikat QR Kod</h2>
                <button onClick={() => setShowModal(false)} className="btn-close">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>F.I.SH (To'liq ism) *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Mamanazarov Saydulla Turayevich"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Pasport ma'lumotlari</label>
                    <input
                      type="text"
                      value={formData.passport}
                      onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                      placeholder="AD5690631"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sertifikat raqami *</label>
                    <input
                      type="text"
                      value={formData.certificateNumber}
                      onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value.toUpperCase() })}
                      placeholder="GPP/3-000050"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Qayd raqami</label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="00050"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Diplom raqami</label>
                    <input
                      type="text"
                      value={formData.diplomaNumber}
                      onChange={(e) => setFormData({ ...formData, diplomaNumber: e.target.value })}
                      placeholder="K № 0993176"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Yo'nalish nomi</label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      placeholder="ZARUR DORIXONA AMALIYOTI (GPP)"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amal qilish muddati (boshlanishi)</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Amal qilish muddati (tugashi)</label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tekshirish uchun telefon raqami</label>
                  <input
                    type="text"
                    value={formData.verificationPhone}
                    onChange={(e) => setFormData({ ...formData, verificationPhone: e.target.value })}
                    placeholder="+998883033416"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={generateQRCode}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Yaratilmoqda...' : 'QR Kod Yaratish'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <button onClick={() => setShowModal(true)} className="fab" title="Yangi QR kod yaratish">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="6" y="6" width="1" height="1"/>
            <rect x="17" y="6" width="1" height="1"/>
            <rect x="6" y="17" width="1" height="1"/>
            <rect x="17" y="17" width="1" height="1"/>
          </svg>
        </button>

        <div className="qr-history-card-full">
          <div className="history-header">
            <h2>QR Kodlar Tarixi ({qrHistory.length})</h2>
            <div className="history-actions">
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
                    <tr
                      key={item.id}
                      onClick={(e) => handleRowClick(item, e)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <div className="table-info-stack">
                          <div className="info-name">{item.title}</div>
                          <div className="info-certificate">{item.description.replace('Sertifikat: ', '')}</div>
                          <div className="info-date">
                            {new Date(item.created_at).toLocaleDateString('uz-UZ', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="action-buttons-desktop">
                        <div className="action-buttons">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload(item.qr_image_url, item.title)
                            }}
                            className="btn-icon btn-download-icon"
                            title="Yuklab olish"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(item)
                            }}
                            className="btn-icon btn-delete-icon"
                            title="O'chirish"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {showActionModal && selectedItem && (
          <div className="modal-overlay" onClick={closeActionModal}>
            <div className="action-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="action-modal-header">
                <h3>{selectedItem.title}</h3>
                <button onClick={closeActionModal} className="btn-close">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="action-modal-body">
                <button onClick={handleDownloadClick} className="action-modal-btn action-modal-btn-download">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  Yuklab olish
                </button>
                <button onClick={handleDeleteClick} className="action-modal-btn action-modal-btn-delete">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                  </svg>
                  O'chirish
                  
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
