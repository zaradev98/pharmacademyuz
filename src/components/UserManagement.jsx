import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

export default function UserManagement() {
  const { user, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Foydalanuvchilarni yuklashda xatolik:', error)
      setMessage('Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      setMessage('Status o\'zgartirildi!')
      loadUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Xatolik:', error)
      setMessage('Status o\'zgartirishda xatolik')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Foydalanuvchilar boshqaruvi</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '10px 20px',
                background: '#006670',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              style={{
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Chiqish
            </button>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '5px',
            background: message.includes('Xatolik') ? '#f8d7da' : '#d4edda',
            color: message.includes('Xatolik') ? '#721c24' : '#155724'
          }}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Yuklanmoqda...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9f9f9', borderBottom: '2px solid #006670' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Foydalanuvchi</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>To'liq ism</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Rol</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px' }}>{u.username}</td>
                    <td style={{ padding: '15px' }}>{u.full_name || '-'}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: u.role?.name === 'admin' ? '#667eea' : '#6c757d',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {u.role?.name || 'user'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: u.is_active ? '#28a745' : '#dc3545',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {u.is_active ? 'Aktiv' : 'Nofaol'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                        disabled={u.id === user?.id}
                        style={{
                          padding: '6px 12px',
                          background: u.id === user?.id ? '#ccc' : '#006670',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: u.id === user?.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        {u.is_active ? 'Nofaol qilish' : 'Faollashtirish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
