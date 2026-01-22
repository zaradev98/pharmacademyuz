import React from 'react';

// This page is public: no login required
export default function PublicViewPage() {
  // Get ?data=... from URL
  const params = new URLSearchParams(window.location.search);
  const rawData = params.get('data');
  // Decode and format for display
  let display = '';
  if (rawData) {
    try {
      display = decodeURIComponent(rawData);
    } catch {
      display = rawData;
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f7f7f7' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px #0001', maxWidth: 600, width: '100%' }}>
        <h2 style={{ marginBottom: 24, color: '#006670', textAlign: 'center' }}>Sertifikat Ma'lumotlari</h2>
        <div style={{ fontSize: 18, whiteSpace: 'pre-wrap', color: '#222', wordBreak: 'break-word' }}>
          {display ? display : <span style={{ color: '#888' }}>Ma'lumot topilmadi yoki noto'g'ri QR code.</span>}
        </div>
      </div>
    </div>
  );
}
