import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function QrPublicView() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const { data: row, error } = await supabase
        .from('qr_codes')
        .select('qrcode_data, is_active')
        .eq('qr_code_id', id)
        .single()

      if (error || !row || !row.is_active) {
        setNotFound(true)
        return
      }
      setData(row.qrcode_data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.center}>
          <div style={s.spinner} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={s.page}>
        <div style={s.center}>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50' }}>Ma'lumot topilmadi</p>
          <p style={{ color: '#8a9ab0', fontSize: '13px', marginTop: '6px' }}>ID: {id}</p>
        </div>
      </div>
    )
  }

  const entries = Object.entries(data || {})

  return (
    <div style={s.page}>
      <p style={s.pageTitle}>Ma'lumotlar</p>

      <div style={s.card}>
        <p style={s.cardTitle}>Ma'lumotlar</p>
        <div style={s.divider} />

        <div style={s.fieldsList}>
          {entries.map(([key, value], i) => (
            <div key={i} style={s.fieldItem}>
              <span style={s.fieldKey}>{key}</span>
              <span style={s.fieldValue}>{value}</span>
            </div>
          ))}
        </div>

        <div style={s.verifiedBox}>
          <p style={s.verifiedTitle}>✓ Tasdiqlangan</p>
          <p style={s.verifiedText}>
            Bu ma'lumotlar IMH-TRADE tomonidan rasmiy ro'yxatga olingan va tasdiqlangan.
          </p>
        </div>
      </div>

      <p style={s.footer}>© 2025 | Barcha huquqlar himoyalangan</p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#d8e4ef',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #c5d5e8',
    borderTop: '3px solid #4a7fa5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e2d3d',
    marginBottom: '20px',
    textAlign: 'center',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    border: '1.5px solid #b8cfe0',
    padding: '28px 24px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1e2d3d',
    textAlign: 'center',
    margin: '0 0 16px 0',
  },
  divider: {
    height: '1px',
    background: '#e8eef5',
    marginBottom: '20px',
  },
  fieldsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  fieldItem: {
    background: '#eef2f8',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldKey: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#7a8fa6',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  fieldValue: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e2d3d',
    wordBreak: 'break-word',
  },
  verifiedBox: {
    background: '#eaf5f0',
    borderRadius: '12px',
    borderLeft: '4px solid #3a9e7e',
    padding: '14px 16px',
    marginTop: '4px',
  },
  verifiedTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#1e3a2f',
    margin: '0 0 6px 0',
  },
  verifiedText: {
    fontSize: '13px',
    color: '#4a6e5e',
    margin: 0,
    lineHeight: '1.5',
  },
  footer: {
    marginTop: '28px',
    fontSize: '13px',
    color: '#8a9ab0',
    textAlign: 'center',
  },
}
