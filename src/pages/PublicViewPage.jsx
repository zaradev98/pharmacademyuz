import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import ViewCertificate from '../components/ViewCertificate'

export default function PublicViewPage() {
  const [searchParams] = useSearchParams()
  const diplomNumber = searchParams.get('d')
  const [certData, setCertData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!diplomNumber) {
      setLoading(false)
      setError('Diplom raqami ko\'rsatilmagan.')
      return
    }
    fetchCertificate()
  }, [diplomNumber])

  const fetchCertificate = async () => {
    try {
      // process jadvalidan diplom raqami bo'yicha qidiramiz
      // qr_text JSON formatida saqlangan, shuning uchun ilike orqali qidiramiz
      const { data, error: dbError } = await supabase
        .from('process')
        .select('*')
        .ilike('qr_text', `%"diplomaNumber":"${diplomNumber}"%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (dbError || !data) {
        // diplom_number ustuni orqali ham tekshiramiz
        const { data: data2, error: dbError2 } = await supabase
          .from('process')
          .select('*')
          .eq('diplom_number', diplomNumber)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (dbError2 || !data2) {
          setError('Sertifikat topilmadi.')
          return
        }
        parseCertData(data2)
      } else {
        parseCertData(data)
      }
    } catch {
      setError('Ma\'lumot olishda xatolik yuz berdi.')
    } finally {
      setLoading(false)
    }
  }

  const parseCertData = (item) => {
    try {
      const parsed = JSON.parse(item.qr_text)
      parsed.qr_image_url = item.qr_image_url || ''
      setCertData(parsed)
    } catch {
      setError('Sertifikat ma\'lumotlari noto\'g\'ri formatda.')
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#006670'
      }}>
        Yuklanmoqda...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <div style={{ fontSize: '20px', color: '#c0392b', fontWeight: '600' }}>{error}</div>
        {diplomNumber && (
          <div style={{ color: '#888', fontSize: '15px' }}>Diplom raqami: {diplomNumber}</div>
        )}
      </div>
    )
  }

  return <ViewCertificate data={certData} />
}
