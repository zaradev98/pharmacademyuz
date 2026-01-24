import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import './Certificate.css';

export default function CertificateGenerator() {
  const auth = useAuth();
  const user = auth?.user || { id: 'test-user-123' }; // Fallback user
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    passport: '',
    certificateNumber: '',
    registrationNumber: '',
    diplomaNumber: '',
    organizationName: '',
    validFrom: '',
    validTo: '',
    verificationPhone: '',
    durationYears: '', // Sertifikat amal qilish muddati (yil)
    hours: '',         // Soat
    issueDate: ''      // Berilgan sana
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const formatQRText = () => {
    // Endi QR text sifatida to'liq JSON saqlanadi
    return JSON.stringify(formData);
  };

  // Sertifikat yaratish tugmasi bosilganda preview sahifasiga yo'naltirish
  const generateCertificate = async () => {
    if (!formData.fullName || !formData.certificateNumber) {
      setMessage('Iltimos, kamida F.I.SH va Sertifikat raqamini kiriting');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const processInsert = {
        user_id: user.id,
        title: formData.fullName || 'Sertifikat',
        description: `Sertifikat: ${formData.certificateNumber}`,
        diplom_number: formData.diplomaNumber, // Diplom raqamini saqlash
        qr_text: JSON.stringify(formData),
        qr_image_url: 'local',
        file_path: 'local' // Keyinroq yangilanadi
      };
      const { error: processError } = await supabase
        .from('process')
        .insert([processInsert])
        .select()
        .single();
      if (processError) throw processError;

      // ViewCertificate uchun localStorage'ga yozishdan oldin eskisini o'chirish
      localStorage.removeItem('certificateData');
      localStorage.setItem('certificateData', JSON.stringify(formData));
      // AsyncStorage (Supabase insert) tugagandan keyin dashboard ochilsin
      window.location.href = '/dashboard';
    } catch (error) {
      setMessage('Saqlashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    color:'#2c3e50',
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    outline: 'none'
  };

  const dateInputStyle = {
    ...inputStyle,
    colorScheme: 'light',
    cursor: 'pointer',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    position: 'relative'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#2c3e50',
    letterSpacing: '0.3px'
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const cardStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: '40px',
    animation: 'fadeIn 0.5s ease-in'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px',
            letterSpacing: '-0.5px'
          }}>
            ✨ Sertifikat Yaratish
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '15px',
            fontWeight: '500'
          }}>
            Professional sertifikat yaratish uchun ma'lumotlarni kiriting
          </p>
        </div>

        {message && (
          <div style={{
            padding: '16px 24px',
            marginBottom: '30px',
            borderRadius: '12px',
            backgroundColor: message.includes('muvaffaqiyatli') ? '#d1fae5' : '#fee2e2',
            color: message.includes('muvaffaqiyatli') ? '#065f46' : '#991b1b',
            border: `2px solid ${message.includes('muvaffaqiyatli') ? '#6ee7b7' : '#fca5a5'}`,
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>
              {message.includes('muvaffaqiyatli') ? '✅' : '⚠️'}
            </span>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          {/* Section 1: Shaxsiy ma'lumotlar */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '2px solid #bae6fd'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0c4a6e',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>👤</span> Shaxsiy Ma'lumotlar
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>F.I.SH <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ism Familiya Sharif"
                  disabled={loading}
                  style={{
                    ...inputStyle,
                    borderColor: formData.fullName ? '#10b981' : '#e0e0e0'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = formData.fullName ? '#10b981' : '#e0e0e0'}
                />
              </div>

              <div>
                <label style={labelStyle}>Pasport</label>
                <input
                  type="text"
                  value={formData.passport}
                  onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                  placeholder="AD1234567"
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sertifikat ma'lumotlari */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '2px solid #fcd34d'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#92400e',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📜</span> Sertifikat Ma'lumotlari
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Sertifikat raqami <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value.toUpperCase() })}
                  placeholder="GPP/3-000050"
                  disabled={loading}
                  style={{
                    ...inputStyle,
                    borderColor: formData.certificateNumber ? '#10b981' : '#e0e0e0'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = formData.certificateNumber ? '#10b981' : '#e0e0e0'}
                />
              </div>

              <div>
                <label style={labelStyle}>Qayd raqami</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="0008"
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div>
                <label style={labelStyle}>Diplom raqami</label>
                <input
                  type="text"
                  value={formData.diplomaNumber}
                  onChange={(e) => setFormData({ ...formData, diplomaNumber: e.target.value })}
                  placeholder="K0993176"
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div>
                <label style={labelStyle}>Yo'nalish nomi</label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="ZARUR DORIXONA AMALIYOTI (GPP)"
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Amal qilish muddati (yil)</label>
                <input
                  type="number"
                  value={formData.durationYears}
                  onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
                  placeholder="5"
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              <div>
                <label style={labelStyle}>Dars soati</label>
                <input
                  type="number"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="36"
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sanalar */}
          <div style={{
            background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '2px solid #a78bfa'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#5b21b6',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📅</span> Sanalar
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Ta'lim olish boshlandi</label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  disabled={loading}
                  style={dateInputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div>
                <label style={labelStyle}>Ta'lim olish tugadi</label>
                <input
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  disabled={loading}
                  style={dateInputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Sertifikat berilgan sana</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                disabled={loading}
                style={dateInputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>

          {/* Section 4: Aloqa */}
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '30px',
            border: '2px solid #6ee7b7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#065f46',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📞</span> Aloqa Ma'lumotlari
            </h3>
            <div>
              <label style={labelStyle}>Tekshirish telefoni</label>
              <input
                type="text"
                value={formData.verificationPhone}
                onChange={(e) => setFormData({ ...formData, verificationPhone: e.target.value })}
                placeholder="+998 88 303 34 16"
                disabled={loading}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
          </div>

          <button
            onClick={generateCertificate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.4)',
              transform: loading ? 'scale(1)' : 'scale(1)',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></span>
                Yaratilmoqda...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span>🎓</span> Sertifikat Yaratish
              </span>
            )}
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        input:hover:not(:disabled) {
          border-color: #667eea !important;
        }

        input:focus {
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.5);
          font-size: 18px;
          padding: 5px;
          margin-left: 5px;
        }

        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          filter: invert(0.3);
        }

        input[type="date"]::-webkit-datetime-edit {
          padding: 0;
        }

        input[type="date"]::-webkit-datetime-edit-fields-wrapper {
          padding: 0;
        }
      `}</style>
    </div>
  );
}
