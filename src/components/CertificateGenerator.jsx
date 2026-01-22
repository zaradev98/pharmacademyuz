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
      // Debug: log formData and processInsert
      console.log('DEBUG: formData', formData);
      const processInsert = {
        user_id: user.id,
        title: formData.fullName || 'Sertifikat',
        description: `Sertifikat: ${formData.certificateNumber}`,
        diplom_number: formData.diplomaNumber, // Diplom raqamini saqlash
        qr_text: JSON.stringify(formData),
        qr_image_url: 'local',
        file_path:'local' // Keyinroq yangilanadi
      };
      console.log('DEBUG: processInsert', processInsert);
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
      console.error('DEBUG: Supabase insert error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Sertifikat Yaratish</h2>

      {message && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '20px',
          borderRadius: '5px',
          backgroundColor: message.includes('muvaffaqiyatli') ? '#d4edda' : '#f8d7da',
          color: message.includes('muvaffaqiyatli') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('muvaffaqiyatli') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Amal qilish muddati (yil)</label>
                      <input
                        type="number"
                        value={formData.durationYears}
                        onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
                        placeholder="5"
                        disabled={loading}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Soat</label>
                      <input
                        type="number"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        placeholder="36"
                        disabled={loading}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Berilgan sana</label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      placeholder=""
                      disabled={loading}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>F.I.SH *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ism Familiya"
              disabled={loading}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Pasport</label>
            <input
              type="text"
              value={formData.passport}
              onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
              placeholder="AD1234567"
              disabled={loading}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Sertifikat raqami *</label>
            <input
              type="text"
              value={formData.certificateNumber}
              onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value.toUpperCase() })}
              placeholder="GPP/3-000050"
              disabled={loading}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Qayd raqami</label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              placeholder="0008"
              disabled={loading}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Diplom raqami</label>
            <input
              type="text"
              value={formData.diplomaNumber}
              onChange={(e) => setFormData({ ...formData, diplomaNumber: e.target.value })}
              placeholder="K № 0993176"
              disabled={loading}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Yo'nalish nomi</label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              placeholder="ZARUR DORIXONA AMALIYOTI (GPP)"
              disabled={loading}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Boshlanish sanasi</label>
            <input
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              disabled={loading}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tugash sanasi</label>
            <input
              type="date"
              value={formData.validTo}
              onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
              disabled={loading}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tekshirish telefoni</label>
          <input
            type="text"
            value={formData.verificationPhone}
            onChange={(e) => setFormData({ ...formData, verificationPhone: e.target.value })}
            placeholder="+998883033416"
            disabled={loading}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>

        <button
          onClick={generateCertificate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#006670',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Yaratilmoqda...' : 'Sertifikat Yaratish'}
        </button>
      </div>

      {/* Sertifikat preview endi ViewCertificate sahifasida ko'rsatiladi */}
    </div>
  );
}
