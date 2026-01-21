import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { generateUsername, generateSimplePassword } from '../utils/credentialGenerator'
import './UserManagement.css'

export default function UserManagement() {
  const { user, createUser, canCreateUser, canManageUsers, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Yangi user yaratish uchun form
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'user'
  })
  const [generatedCredentials, setGeneratedCredentials] = useState(null)

  useEffect(() => {
    if (!user || !canManageUsers(user.role)) {
      navigate('/dashboard')
      return
    }
    fetchUsers()
  }, [user, navigate])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          full_name,
          is_active,
          created_at,
          role:roles(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedUsers = data.map(u => ({
        ...u,
        role: u.role?.name || 'user'
      }))

      setUsers(formattedUsers)
    } catch (error) {
      setError('Foydalanuvchilarni yuklashda xatolik: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Roleni tekshirish
    if (!canCreateUser(user.role, formData.role)) {
      setError('Siz bu rolda foydalanuvchi yarata olmaysiz')
      return
    }

    // Username va password generatsiya qilish
    const username = generateUsername(formData.fullName)
    const password = generateSimplePassword()

    const result = await createUser(
      username,
      password,
      formData.fullName,
      formData.role,
      user.id
    )

    if (result.success) {
      setGeneratedCredentials({
        username,
        password,
        fullName: formData.fullName,
        role: formData.role
      })
      setSuccess('Foydalanuvchi muvaffaqiyatli yaratildi!')
      setFormData({ fullName: '', role: 'user' })
      setShowForm(false)
      fetchUsers()
    } else {
      setError(result.error)
    }
  }

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      setSuccess('Foydalanuvchi holati o\'zgartirildi')
      fetchUsers()
    } catch (error) {
      setError('Xatolik: ' + error.message)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSuccess('Nusxalandi!')
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="navbar">
          <h1>Foydalanuvchilar boshqaruvi</h1>
        </div>
        <div className="loading">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006670" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Foydalanuvchilar</span>
        </div>
        <div className="nav-right">
          <a href="/dashboard" className="btn-icon-nav" title="Dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          </a>
          <button onClick={logout} className="btn-icon-nav" title="Chiqish">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className="user-management-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Generated Credentials Display */}
        {generatedCredentials && (
          <div className="credentials-card">
            <h3>Yangi foydalanuvchi ma'lumotlari</h3>
            <div className="credential-item">
              <label>To'liq ism:</label>
              <div className="credential-value">
                <span>{generatedCredentials.fullName}</span>
              </div>
            </div>
            <div className="credential-item">
              <label>Role:</label>
              <div className="credential-value">
                <span>{generatedCredentials.role}</span>
              </div>
            </div>
            <div className="credential-item">
              <label>Login:</label>
              <div className="credential-value">
                <span>{generatedCredentials.username}</span>
                <button
                  onClick={() => copyToClipboard(generatedCredentials.username)}
                  className="btn-copy"
                >
                  Nusxalash
                </button>
              </div>
            </div>
            <div className="credential-item">
              <label>Parol:</label>
              <div className="credential-value">
                <span>{generatedCredentials.password}</span>
                <button
                  onClick={() => copyToClipboard(generatedCredentials.password)}
                  className="btn-copy"
                >
                  Nusxalash
                </button>
              </div>
            </div>
            <button
              onClick={() => setGeneratedCredentials(null)}
              className="btn-primary"
            >
              Yopish
            </button>
          </div>
        )}

        {/* Create User Button */}
        <div className="actions">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Bekor qilish' : '+ Yangi foydalanuvchi'}
          </button>
        </div>

        {/* Create User Form */}
        {showForm && (
          <div className="user-form-card">
            <h3>Yangi foydalanuvchi yaratish</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>To'liq ism</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  {user.role === 'superadmin' && (
                    <>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </>
                  )}
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Yaratish
              </button>
            </form>
            <p className="form-note">
              Login va parol avtomatik generatsiya qilinadi
            </p>
          </div>
        )}

        {/* Users Table */}
        <div className="users-table-card">
          <h2>Barcha foydalanuvchilar</h2>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>To'liq ism</th>
                  <th>Login</th>
                  <th>Role</th>
                  <th>Holat</th>
                  <th>Yaratilgan sana</th>
                  {user.role === 'superadmin' && <th>Amallar</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-info-stack">
                        <div className="user-name">{u.full_name}</div>
                        <div className="user-login">{u.username}</div>
                        <div className="user-meta">
                          <span className={`role-badge role-${u.role}`}>{u.role}</span>
                          <span className={`status-badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                            {u.is_active ? 'Faol' : 'Nofaol'}
                          </span>
                          <span className="user-date">{new Date(u.created_at).toLocaleDateString('uz-UZ')}</span>
                        </div>
                        {user.role === 'superadmin' && (
                          <div className="user-actions-inline">
                            <button
                              onClick={() => handleToggleActive(u.id, u.is_active)}
                              className="btn-action"
                              disabled={u.id === user.id}
                            >
                              {u.is_active ? 'O\'chirish' : 'Yoqish'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="desktop-only">{u.username}</td>
                    <td className="desktop-only">
                      <span className={`role-badge role-${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="desktop-only">
                      <span
                        className={`status-badge ${
                          u.is_active ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {u.is_active ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="desktop-only">{new Date(u.created_at).toLocaleDateString('uz-UZ')}</td>
                    {user.role === 'superadmin' && (
                      <td className="desktop-only">
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className="btn-action"
                          disabled={u.id === user.id}
                        >
                          {u.is_active ? 'O\'chirish' : 'Yoqish'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
