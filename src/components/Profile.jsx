import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import bcrypt from 'bcryptjs'
import { supabase } from '../supabaseClient'
import './Profile.css'

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      // Agar parol o'zgartirmoqchi bo'lsa
      if (formData.newPassword) {
        // Yangi parolni tasdiqlash
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Yangi parollar bir xil emas')
          setLoading(false)
          return
        }

        // Parol uzunligini tekshirish
        if (formData.newPassword.length < 6) {
          setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
          setLoading(false)
          return
        }

        // Joriy parolni tekshirish
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('password_hash')
          .eq('id', user.id)
          .single()

        if (fetchError) throw fetchError

        const isPasswordValid = await bcrypt.compare(
          formData.currentPassword,
          userData.password_hash
        )

        if (!isPasswordValid) {
          setError('Joriy parol noto\'g\'ri')
          setLoading(false)
          return
        }
      }

      // Profilni yangilash
      const updates = {
        username: formData.username,
        full_name: formData.full_name
      }

      if (formData.newPassword) {
        updates.newPassword = formData.newPassword
        updates.currentPassword = formData.currentPassword
      }

      const result = await updateProfile(updates)

      if (result.success) {
        setMessage('Profil muvaffaqiyatli yangilandi!')
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Xatolik yuz berdi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <nav className="navbar">
        <h1>Profil</h1>
        <div className="nav-right">
          <button onClick={() => navigate('/dashboard')} className="btn-link">
            Dashboard
          </button>
          <button onClick={logout} className="btn-secondary">Chiqish</button>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-card">
          <h2>Profil Ma'lumotlari</h2>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Asosiy Ma'lumotlar</h3>
              
              <div className="form-group">
                <label>To'liq ism</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Foydalanuvchi nomi</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Parolni O'zgartirish (ixtiyoriy)</h3>
              
              <div className="form-group">
                <label>Joriy parol</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Parolni o'zgartirish uchun kiriting"
                />
              </div>

              <div className="form-group">
                <label>Yangi parol</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={loading}
                  minLength={6}
                  placeholder="Kamida 6 ta belgi"
                />
              </div>

              <div className="form-group">
                <label>Yangi parolni tasdiqlash</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  minLength={6}
                  placeholder="Yangi parolni qayta kiriting"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
