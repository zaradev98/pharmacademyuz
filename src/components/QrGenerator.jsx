import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import QRCode from 'qrcode'
import { supabase } from '../supabaseClient'

export default function QrGenerator() {
  const { user, logout, canManageUsers } = useAuth()
  const navigate = useNavigate()
  const [fields, setFields] = useState([{ key: '', value: '' }])
  const [qrImageUrl, setQrImageUrl] = useState(null)
  const [qrCodeId, setQrCodeId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const addField = () => setFields([...fields, { key: '', value: '' }])

  const removeField = (index) => {
    if (fields.length === 1) return
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index, prop, val) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], [prop]: val }
    setFields(updated)
  }

  const handleClear = () => {
    setFields([{ key: '', value: '' }])
    setQrImageUrl(null)
    setQrCodeId(null)
    setMessage('')
  }

  const handleGenerate = async () => {
    const valid = fields.filter(f => f.key.trim() && f.value.trim())
    if (valid.length === 0) {
      setMessage('Kamida bitta maydon to\'ldiring')
      return
    }
    setLoading(true)
    setMessage('')
    setQrImageUrl(null)
    try {
      const qrcode_data = {}
      valid.forEach(f => { qrcode_data[f.key.trim()] = f.value.trim() })

      const { data, error } = await supabase
        .from('qr_codes')
        .insert({ qrcode_data })
        .select('qr_code_id')
        .single()

      if (error) throw error

      const id = data.qr_code_id
      setQrCodeId(id)

      const dataUrl = await QRCode.toDataURL(`https://imhone.uz/${id}`, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' }
      })
      setQrImageUrl(dataUrl)
    } catch (error) {
      setMessage('Xatolik: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrImageUrl) return
    const link = document.createElement('a')
    link.href = qrImageUrl
    link.download = `qr_${qrCodeId}.png`
    link.click()
  }

  const filledCount = fields.filter(f => f.key.trim() || f.value.trim()).length

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navLogo}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span style={s.navTitle}>QR Generator</span>
        </div>
        <div style={s.navRight}>
          <button onClick={() => navigate('/dashboard')} style={s.navBtn} title="Orqaga">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          {canManageUsers && canManageUsers(user?.role) && (
            <a href="/users" style={s.navBtn} title="Foydalanuvchilar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </a>
          )}
          <button onClick={logout} style={s.navBtn} title="Chiqish">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      <div style={s.content}>
        {/* Hero */}
        <div style={s.hero}>
          <h1 style={s.heroTitle}>QR Code</h1>
        </div>

        {/* Alert */}
        {message && (
          <div style={{
            ...s.alert,
            background: message.includes('Xatolik') ? '#fee2e2' : '#d1fae5',
            color: message.includes('Xatolik') ? '#991b1b' : '#065f46',
            border: `1px solid ${message.includes('Xatolik') ? '#fca5a5' : '#6ee7b7'}`
          }}>
            {message}
          </div>
        )}

        {/* Main */}
        <div style={s.main}>
          {/* Left card */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardLabel}>MA'LUMOTLAR</span>
              <span style={s.counter}>{filledCount}/{fields.length}</span>
            </div>

            <div style={s.fieldsList}>
              {fields.map((field, index) => (
                <div key={index} style={s.fieldRow}>
                  <textarea
                    rows={1}
                    placeholder="Kalit"
                    value={field.key}
                    onChange={e => updateField(index, 'key', e.target.value)}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                    style={s.textarea}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                  <textarea
                    rows={1}
                    placeholder="Qiymat"
                    value={field.value}
                    onChange={e => updateField(index, 'value', e.target.value)}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                    style={s.textarea}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                  {fields.length > 1 && (
                    <button onClick={() => removeField(index)} style={s.removeBtn}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addField} style={s.addBtn}>+ Qator qo'shish</button>

            <div style={s.actions}>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{ ...s.generateBtn, opacity: loading ? 0.7 : 1 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                {loading ? 'Yaratilmoqda...' : 'QR Code yaratish'}
              </button>
              <button onClick={handleClear} style={s.clearBtn}>Tozalash</button>
            </div>
          </div>

          {/* Right card — Preview */}
          <div style={s.previewCard}>
            <span style={s.cardLabel}>PREVIEW</span>
            <div style={s.previewArea}>
              {qrImageUrl ? (
                <>
                  <img src={qrImageUrl} alt="QR" style={s.qrImg} />
                  <button onClick={handleDownload} style={s.downloadBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                    Yuklab olish
                  </button>
                  <span style={{ fontSize: '11px', color: '#bbb', marginTop: '8px' }}>ID: {qrCodeId}</span>
                </>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  <span style={s.previewPlaceholder}>Natija shu yerda</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#f2f2f7',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  navbar: {
    background: 'white',
    padding: '14px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 0 #e5e7eb',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  navRight: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'background 0.15s',
  },
  content: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '28px 24px',
  },
  hero: {
    background: 'linear-gradient(135deg, #0f0f1e 0%, #1e1b4b 60%, #2d1b69 100%)',
    borderRadius: '20px',
    padding: '40px 36px',
    marginBottom: '24px',
  },
  heroTitle: {
    margin: 0,
    color: 'white',
    fontSize: '36px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  alert: {
    padding: '12px 18px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '16px',
  },
  main: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  card: {
    flex: 1,
    minWidth: '320px',
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  },
  counter: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  fieldsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '14px',
  },
  fieldRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  textarea: {
    flex: 1,
    padding: '10px 14px',
    border: '1.5px solid transparent',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    overflow: 'hidden',
    lineHeight: '1.5',
    fontFamily: 'inherit',
    minHeight: '42px',
    background: '#f3f4f6',
    color: '#1a1a2e',
    transition: 'border-color 0.15s',
  },
  removeBtn: {
    padding: '7px',
    border: 'none',
    background: '#fee2e2',
    color: '#ef4444',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    alignSelf: 'center',
  },
  addBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 0',
    marginBottom: '20px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  generateBtn: {
    flex: 1,
    padding: '13px 20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
  },
  clearBtn: {
    padding: '13px 20px',
    background: 'white',
    color: '#374151',
    border: '1.5px solid #e5e7eb',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  previewCard: {
    width: '280px',
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    flexShrink: 0,
  },
  previewArea: {
    marginTop: '16px',
    minHeight: '260px',
    background: '#f9fafb',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '20px',
  },
  previewPlaceholder: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  qrImg: {
    width: '180px',
    height: '180px',
    borderRadius: '10px',
  },
  downloadBtn: {
    marginTop: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  },
}
