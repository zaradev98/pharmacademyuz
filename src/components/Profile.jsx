import { useAuth } from '../AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }

  const cardStyle = {
    maxWidth: '700px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'fadeIn 0.5s ease-out'
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px'
  }

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
    letterSpacing: '-0.5px'
  }

  const subtitleStyle = {
    color: '#64748b',
    fontSize: '15px',
    fontWeight: '500'
  }

  const infoCardStyle = {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '24px',
    borderRadius: '16px',
    marginBottom: '20px',
    border: '2px solid #bae6fd'
  }

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  }

  const valueStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0c4a6e'
  }

  const buttonContainerStyle = {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
    flexWrap: 'wrap'
  }

  const buttonStyle = {
    flex: 1,
    minWidth: '150px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    letterSpacing: '0.3px'
  }

  const logoutButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>👤</div>
          <h2 style={titleStyle}>Profil Ma'lumotlari</h2>
          <p style={subtitleStyle}>Shaxsiy ma'lumotlaringiz</p>
        </div>

        <div style={infoCardStyle}>
          <div style={labelStyle}>Foydalanuvchi nomi</div>
          <div style={valueStyle}>{user?.username}</div>
        </div>

        <div style={infoCardStyle}>
          <div style={labelStyle}>To'liq ism</div>
          <div style={valueStyle}>{user?.full_name || 'Kiritilmagan'}</div>
        </div>

        <div style={infoCardStyle}>
          <div style={labelStyle}>Rol</div>
          <div style={valueStyle}>
            <span style={{
              padding: '6px 16px',
              background: user?.role === 'admin' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {user?.role || 'user'}
            </span>
          </div>
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)'
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
            style={logoutButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.5)'
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
      `}</style>
    </div>
  )
}
