import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// This page is public: no login required
export default function PublicViewPage() {
  const [diplomaInput, setDiplomaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    document.title = "Sertifikat Ma'lumotlari";

    // URL parametrlarini tekshirish
    const params = new URLSearchParams(window.location.search);
    const certNumber = params.get('c') || params.get('cert');
    const regNumber = params.get('r') || params.get('reg');
    const encodedData = params.get('d');
    const oldFormatData = params.get('data');

    // Agar URL parametrlari bo'lsa, ularni ko'rsatish (eski format)
    if (certNumber || regNumber || encodedData || oldFormatData) {
      handleOldFormat(certNumber, regNumber, encodedData, oldFormatData);
    }
  }, []);

  const handleOldFormat = (certNumber, regNumber, encodedData, oldFormatData) => {
    let display = '';

    if (certNumber) {
      display = `SERTIFIKAT RAQAMI: ${certNumber}\n\nBu sertifikat haqida to'liq ma'lumot olish uchun diplom raqamini quyidagi qatorga kiriting.`;
    } else if (regNumber) {
      display = `QAYD RAQAMI: ${regNumber}\n\nBu sertifikat haqida to'liq ma'lumot olish uchun diplom raqamini quyidagi qatorga kiriting.`;
    } else if (encodedData) {
      try {
        const decodedStr = decodeURIComponent(encodedData);
        const parsed = JSON.parse(decodedStr);

        const lines = [];
        if (parsed.n) lines.push(`1. F.I.SH: ${parsed.n.toUpperCase()}`);
        if (parsed.c) lines.push(`2. SERTIFIKAT RAQAMI: ${parsed.c}`);
        if (parsed.q) lines.push(`3. QAYD RAQAMI: ${parsed.q}`);
        if (parsed.d) lines.push(`4. DIPLOM RAQAMI: ${parsed.d}`);
        if (parsed.t) lines.push(`5. YO'NALISH NOMI: ${parsed.t}`);
        if (parsed.f && parsed.e) {
          lines.push(`6. MUDDATI: ${parsed.f} - ${parsed.e}`);
        }

        display = lines.join('\n');
      } catch (e) {
        console.error('JSON parse error:', e);
        display = 'Ma\'lumotni o\'qishda xatolik yuz berdi.';
      }
    } else if (oldFormatData) {
      try {
        display = decodeURIComponent(oldFormatData);
      } catch {
        display = oldFormatData;
      }
    }

    if (display) {
      setError(display);
    }
  };

  const handleSearch = async () => {
    if (!diplomaInput.trim()) {
      setError('Iltimos, diplom raqamini kiriting');
      return;
    }

    setLoading(true);
    setError('');
    setCertificateData(null);

    try {
      // Supabase'dan diplom raqami bo'yicha qidirish
      const { data, error: dbError } = await supabase
        .from('process')
        .select('*')
        .eq('diplom_number', diplomaInput.trim())
        .single();

      if (dbError) {
        if (dbError.code === 'PGRST116') {
          setError('Bunday diplom raqami bilan sertifikat topilmadi. Iltimos, raqamni tekshiring.');
        } else {
          setError('Ma\'lumot olishda xatolik yuz berdi: ' + dbError.message);
        }
        console.error('Supabase error:', dbError);
        return;
      }

      if (data && data.qr_text) {
        // qr_text'dan to'liq ma'lumotlarni parse qilish
        try {
          let parsedData;

          if (typeof data.qr_text === 'object') {
            // Agar object bo'lsa, to'g'ridan-to'g'ri ishlatamiz
            parsedData = data.qr_text;
          } else if (typeof data.qr_text === 'string') {
            // Agar string bo'lsa, JSON parse qilishga harakat qilamiz
            try {
              parsedData = JSON.parse(data.qr_text);
            } catch (jsonError) {
              // Agar JSON parse bo'lmasa, bu eski text format bo'lishi mumkin
              // Text formatdan object yasaymiz
              const lines = data.qr_text.split('\n');
              parsedData = {};

              lines.forEach(line => {
                if (line.includes('F.I.SH:')) {
                  parsedData.fullName = line.split(':')[1].trim();
                } else if (line.includes('SERTIFIKAT RAQAMI:')) {
                  parsedData.certificateNumber = line.split(':')[1].trim();
                } else if (line.includes('QAYD RAQAMI:')) {
                  parsedData.registrationNumber = line.split(':')[1].trim();
                } else if (line.includes('DIPLOM RAQAMI:')) {
                  parsedData.diplomaNumber = line.split(':')[1].trim();
                } else if (line.includes('YO\'NALISH NOMI:')) {
                  parsedData.organizationName = line.split(':')[1].trim();
                } else if (line.includes('MUDDATI:')) {
                  const dates = line.split(':')[1].trim().split(' - ');
                  if (dates.length === 2) {
                    parsedData.validFrom = dates[0];
                    parsedData.validTo = dates[1];
                  }
                }
              });
            }
          }

          setCertificateData(parsedData);
        } catch (e) {
          setError('Sertifikat ma\'lumotlarini o\'qishda xatolik yuz berdi.');
          console.error('Parse error:', e);
          console.error('qr_text value:', data.qr_text);
        }
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  return (
    <>
      <style>{`
        .public-view-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 15px;
        }
        .public-view-card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          width: 100%;
        }
        .search-flex {
          display: flex;
          gap: 10px;
        }
        .search-input {
          flex: 1;
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          border-color: #006670;
        }
        .search-button {
          padding: 14px 30px;
          background: linear-gradient(135deg, #006670 0%, #004d54 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(0, 102, 112, 0.3);
        }
        .search-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          box-shadow: none;
        }
        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .data-card {
          background: #fff;
          padding: 14px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .data-card-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .data-card-value {
          font-size: 15px;
          color: #222;
          font-weight: 600;
          word-break: break-word;
        }
        .data-card-value-primary {
          font-size: 15px;
          color: #006670;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .public-view-card {
            padding: 20px;
          }
          .search-input {
            padding: 12px 14px;
            font-size: 14px;
          }
          .search-button {
            padding: 12px 24px;
            font-size: 14px;
          }
          .data-card-value, .data-card-value-primary {
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .search-flex {
            flex-direction: column;
          }
          .grid-2-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="public-view-container">
        <div className="public-view-card">
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={{ margin: 0, marginBottom: 10, color: '#006670', fontSize: '28px', fontWeight: '700' }}>
              Sertifikat Tekshirish
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
              Diplom raqamini kiritib, sertifikat ma'lumotlarini ko'ring
            </p>
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '600', color: '#333', fontSize: '14px' }}>
              Diplom Raqami
            </label>
            <div className="search-flex">
              <input
                type="text"
                className="search-input"
                value={diplomaInput}
                onChange={(e) => setDiplomaInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Masalan: K 0993176"
                disabled={loading}
              />
              <button
                className="search-button"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Qidirilmoqda...' : 'Qidirish'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: 16,
              marginBottom: 20,
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: 8,
              color: '#856404',
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {error}
            </div>
          )}

          {/* Certificate Data Display */}
          {certificateData && (
            <div style={{
              padding: 24,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 12,
              border: '2px solid #006670',
            }}>
              <h3 style={{ margin: 0, marginBottom: 20, color: '#006670', fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
                Sertifikat Ma'lumotlari
              </h3>

              <div style={{ display: 'grid', gap: 16 }}>
                {certificateData.fullName && (
                  <div className="data-card">
                    <div className="data-card-label">F.I.SH</div>
                    <div style={{ fontSize: 18, color: '#222', fontWeight: '700', wordBreak: 'break-word' }}>
                      {certificateData.fullName.toUpperCase()}
                    </div>
                  </div>
                )}

                <div className="grid-2-col">
                  {certificateData.certificateNumber && (
                    <div className="data-card">
                      <div className="data-card-label">SERTIFIKAT RAQAMI</div>
                      <div className="data-card-value-primary">{certificateData.certificateNumber}</div>
                    </div>
                  )}

                  {certificateData.registrationNumber && (
                    <div className="data-card">
                      <div className="data-card-label">QAYD RAQAMI</div>
                      <div className="data-card-value-primary">{certificateData.registrationNumber}</div>
                    </div>
                  )}
                </div>

                {certificateData.diplomaNumber && (
                  <div className="data-card">
                    <div className="data-card-label">DIPLOM RAQAMI</div>
                    <div className="data-card-value">{certificateData.diplomaNumber}</div>
                  </div>
                )}

                {certificateData.organizationName && (
                  <div className="data-card">
                    <div className="data-card-label">YO'NALISH NOMI</div>
                    <div className="data-card-value">{certificateData.organizationName}</div>
                  </div>
                )}

                <div className="grid-2-col">
                  {certificateData.validFrom && certificateData.validTo && (
                    <div className="data-card">
                      <div className="data-card-label">AMAL QILISH MUDDATI</div>
                      <div style={{ fontSize: 13, color: '#222', fontWeight: '600' }}>
                        {formatDate(certificateData.validFrom)} - {formatDate(certificateData.validTo)}
                      </div>
                    </div>
                  )}

                  {certificateData.durationYears && (
                    <div className="data-card">
                      <div className="data-card-label">DAVOMIYLIGI</div>
                      <div className="data-card-value">{certificateData.durationYears} yil</div>
                    </div>
                  )}
                </div>

                {certificateData.hours && (
                  <div className="data-card">
                    <div className="data-card-label">SOAT</div>
                    <div className="data-card-value">{certificateData.hours} soat</div>
                  </div>
                )}

                {certificateData.issueDate && (
                  <div className="data-card">
                    <div className="data-card-label">BERILGAN SANA</div>
                    <div className="data-card-value">{formatDate(certificateData.issueDate)}</div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20, padding: 16, background: 'rgba(0, 102, 112, 0.1)', borderRadius: 8, borderLeft: '4px solid #006670' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#004d54', lineHeight: 1.6 }}>
                  <strong>✓ Tasdiqlangan sertifikat</strong><br />
                  Bu sertifikat IMH-TRADE tomonidan rasmiy ro'yxatga olingan va tasdiqlangan.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 30, textAlign: 'center', paddingTop: 20, borderTop: '1px solid #e0e0e0' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#999' }}>
              © 2025 IMH-TRADE | Barcha huquqlar himoyalangan
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
