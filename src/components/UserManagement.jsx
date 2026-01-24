import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

export default function UserManagement() {
  const { user, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role_id: ''
  })

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (error) throw error
      setRoles(data || [])
      if (data && data.length > 0) {
        setNewUser(prev => ({ ...prev, role_id: data[0].id }))
      }
    } catch (error) {
      alert('Rollarni yuklashda xatolik:')
    }
  }

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
      console.error('Foydalanuvchilarni yuklashda xatolik:')
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

      setMessage('Status muvaffaqiyatli o\'zgartirildi!')
      loadUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Xatolik:')
      setMessage('Status o\'zgartirishda xatolik')
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', newUser.username)
        .single()

      if (existingUser) {
        setMessage('Xatolik: Bu foydalanuvchi nomi band!')
        setLoading(false)
        return
      }

      // Hash password (simple implementation - in production use proper hashing)
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: newUser.username,
          password_hash: newUser.password, // In production, hash this properly
          full_name: newUser.full_name,
          role_id: newUser.role_id,
          is_active: true
        }])
        .select()

      if (error) throw error

      setMessage('Foydalanuvchi muvaffaqiyatli qo\'shildi!')
      setShowAddModal(false)
      setNewUser({
        username: '',
        password: '',
        full_name: '',
        role_id: roles[0]?.id || ''
      })
      loadUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Xatolik:')
      setMessage('Foydalanuvchi qo\'shishda xatolik: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }

  const cardStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'fadeIn 0.5s ease-out'
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <h2 style={{
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.5px'
          }}>
            👥 Foydalanuvchilar Boshqaruvi
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <span>➕</span> Yangi Foydalanuvchi
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              📊 Dashboard
            </button>
            <button
              onClick={logout}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              🚪 Chiqish
            </button>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '16px 24px',
            marginBottom: '30px',
            borderRadius: '16px',
            background: message.includes('Xatolik') || message.includes('xatolik')
              ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
              : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            color: message.includes('Xatolik') || message.includes('xatolik') ? '#991b1b' : '#065f46',
            border: `2px solid ${message.includes('Xatolik') || message.includes('xatolik') ? '#fca5a5' : '#6ee7b7'}`,
            fontWeight: '700',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideDown 0.4s ease-out'
          }}>
            <span style={{ fontSize: '20px' }}>
              {message.includes('Xatolik') || message.includes('xatolik') ? '⚠️' : '✅'}
            </span>
            {message}
          </div>
        )}

        {loading && !showAddModal ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#667eea', fontSize: '18px', fontWeight: '600' }}>
            <div style={{ marginBottom: '15px', fontSize: '48px' }}>⏳</div>
            Yuklanmoqda...
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderBottom: '3px solid #667eea' }}>
                  <tr>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', color: '#667eea', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Foydalanuvchi</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', color: '#667eea', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>To'liq ism</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', color: '#667eea', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rol</th>
                    <th style={{ padding: '18px 20px', textAlign: 'center', fontWeight: '700', color: '#667eea', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '18px 20px', textAlign: 'center', fontWeight: '700', color: '#667eea', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <td style={{ padding: '18px 20px', fontWeight: '600', color: '#333' }}>{u.username}</td>
                      <td style={{ padding: '18px 20px', color: '#666' }}>{u.full_name || '-'}</td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          padding: '6px 16px',
                          background: u.role?.name === 'admin' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}>
                          {u.role?.name || 'user'}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                        <span style={{
                          padding: '6px 16px',
                          background: u.is_active ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '700'
                        }}>
                          {u.is_active ? '✓ Aktiv' : '✗ Nofaol'}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
                          disabled={u.id === user?.id}
                          style={{
                            padding: '10px 20px',
                            background: u.id === user?.id
                              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                              : u.is_active
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: u.id === user?.id ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '700',
                            transition: 'all 0.3s ease',
                            boxShadow: u.id === user?.id ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}
                          onMouseEnter={(e) => {
                            if (u.id !== user?.id) {
                              e.target.style.transform = 'translateY(-2px)'
                              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (u.id !== user?.id) {
                              e.target.style.transform = 'translateY(0)'
                              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
                            }
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
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }} onClick={() => setShowAddModal(false)}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              maxWidth: '550px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'modalSlideUp 0.4s ease-out',
              overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderBottom: '2px solid #bae6fd'
              }}>
                <h3 style={{
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '24px',
                  fontWeight: '800'
                }}>
                  ➕ Yangi Foydalanuvchi
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px',
                  borderRadius: '8px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddUser} style={{ padding: '30px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Foydalanuvchi nomi <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Parol <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    To'liq ism
                  </label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.3s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                    Rol <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={newUser.role_id}
                    onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.3s',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: loading
                        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }
                    }}
                  >
                    {loading ? 'Qo\'shilmoqda...' : '➕ Qo\'shish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
