import { useAuth } from '../AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Profil</h2>

        <div style={{ marginBottom: '15px' }}>
          <strong>Foydalanuvchi nomi:</strong> {user?.username}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>To'liq ism:</strong> {user?.full_name || 'Kiritilmagan'}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>Rol:</strong> {user?.role || 'user'}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>Email:</strong> {user?.email || 'Kiritilmagan'}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
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
    </div>
  )
}
