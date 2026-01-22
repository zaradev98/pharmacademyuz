import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Props: data = {
//   fullName, certificateNumber, diplomaNumber, registrationNumber, organizationName,
//   validFrom, validTo, durationYears, studyPeriod, hours, issueDate, directorName, qrImageUrl
// }
export default function ViewCertificate({ data = {}, onClose }) {
  const certificateRef = useRef(null);

  // Agar data prop bo'sh bo'lsa, localStorage'dan o'qib olamiz
  let localData = {};
  if (!data || Object.keys(data).length === 0) {
    try {
      const stored = localStorage.getItem('certificateData');
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch {
      localData = {};
    }
  }
  const source = Object.keys(data).length > 0 ? data : localData;


  const directorName = source.directorName || "I.M. Fayzullo o'g'li";
  const formData = {
    fullName: source.fullName || '',
    certNumber: source.certificateNumber || '',
    diplomNumber: source.diplomaNumber || '',
    qaydNumber: source.registrationNumber || '',
    courseTitle: source.organizationName || '',
    durationYears: source.durationYears || '',
    startDate: source.validFrom || '',
    endDate: source.validTo || '',
    studyPeriod: source.studyPeriod || '',
    hours: source.hours || '',
    registerDate: source.issueDate || '',
    directorName,
    verificationPhone: source.verificationPhone || '',
    qrImageUrl: source.qr_image_url || source.qrImageUrl || '',
  };

  // QR code text formatting (pretty multiline)
  const formatQRText = () => {
    
    const lines = [];
    if (formData.fullName) lines.push(`1. F.I.SH: ${formData.fullName.toUpperCase()}`);
    if (formData.certNumber) lines.push(`2. SERTIFIKAT RAQAMI: ${formData.certNumber}`);
    if (formData.qaydNumber) lines.push(`3. QAYD RAQAMI: ${formData.qaydNumber}`);
    if (formData.diplomNumber) lines.push(`4. DIPLOM RAQAMI: ${formData.diplomNumber}`);
    if (formData.courseTitle) lines.push(`5. YO'NALISH NOMI: ${formData.courseTitle}`);
    if (formData.startDate && formData.endDate) {
      lines.push(`6. MUDDATI: ${formData.startDate} - ${formData.endDate}`);
    }
    // Phone number is intentionally omitted from QR code text
    return lines.join('\n');
  };

  const downloadAsPNG = async () => {
    if (!certificateRef.current) return;

    // Vaqtincha scale ni olib tashlaymiz
    const originalTransform = certificateRef.current.style.transform;
    certificateRef.current.style.transform = 'scale(1)';

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      width: 3543,
      height: 2480
    });

    // Scale ni qaytaramiz
    certificateRef.current.style.transform = originalTransform;

    const link = document.createElement('a');
    link.download = `sertifikat_${formData.certNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

  };

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;

    // Vaqtincha scale ni olib tashlaymiz
    const originalTransform = certificateRef.current.style.transform;
    certificateRef.current.style.transform = 'scale(1)';

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      width: 3543,
      height: 2480
    });

    // Scale ni qaytaramiz
    certificateRef.current.style.transform = originalTransform;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [3543, 2480]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 3543, 2480);
    pdf.save(`sertifikat_${formData.certNumber}.pdf`);
  };


  return (
    <div style={{
      minHeight: '100vh',
      padding: '30px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
      }}>
        {/* Certificate Preview */}
        <div style={{
          background: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          marginBottom: '20px'
        }}>
          {/* Certificate Design */}
          <div
            ref={certificateRef}
            style={{
              width: '3543px',
              height: '2480px',
              background: 'url("/Ramka.svg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              transformOrigin: 'top left',
              transform: 'scale(0.38)',
              fontFamily: "'Times New Roman', serif"
            }}
          >
            {/* Logo/Emblem */}
            <div style={{
              position: 'absolute',
              top: '42%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '3000px',
              height: '2000px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
            }}>
              <img
                src="/LogoSert.svg"
                alt="Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: 0.9
                }}
              />
            </div>

            {/* Top Left Text - O'zbekiston Respublikasi */}
            <div style={{
              position: 'absolute',
              top: '300px',
              left: '300px',
              width: '1000px',
              textAlign: 'center',
              textTransform: 'uppercase',
              lineHeight: '1.4'
            }}>
              <div style={{
                fontSize: '52px',
                fontWeight: '700',
                color: '#000',
                marginBottom: '12px',
                letterSpacing: '2px'
              }}>
                O'ZBEKISTON RESPUBLIKASI
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: '600',
                color: '#000',
                letterSpacing: '1px'
              }}>
                OLIY TA'LIM FAN VA
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: '600',
                color: '#000',
                letterSpacing: '1px'
              }}>
                INNOVATSIYA VAZIRLIGI
              </div>
            </div>

            {/* Top Right Text - English */}
            <div style={{
              position: 'absolute',
              top: '300px',
              right: '300px',
              width: '1200px',
              textAlign: 'center',
              textTransform: 'uppercase',
              lineHeight: '1.4'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '600',
                color: '#000',
                letterSpacing: '1px'
              }}>
                MINISTRY OF HIGHER EDUCATION,
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: '600',
                color: '#000',
                letterSpacing: '1px'
              }}>
                SCIENCE AND INNOVATION OF THE
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: '600',
                color: '#000',
                letterSpacing: '1px'
              }}>
                REPUBLIC OF UZBEKISTAN
              </div>
            </div>

            {/* Main Title - SERTIFIKAT */}
            <div style={{
              position: 'absolute',
              top: '600px',
              left: '500px',
              right: '500px',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '320px',
                fontWeight: '900',
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '20px'
              }}>
                SERTIFIKAT
              </h1>
            </div>

            {/* Certificate Number and Diploma Number */}
            <div style={{
              position: 'absolute',
              top: '900px',
              left: '900px',
              right: '900px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '72px',
                fontWeight: '700',
                color: '#000',
                marginBottom: '18px',
              }}>
                {formData.certNumber.toUpperCase()}
              </div>
              <div style={{
                fontSize: '50px',
                fontWeight: '600',
                color: '#000',
              }}>
                {formData.diplomNumber} - ushbu sertifikat egasining diplom raqami
              </div>
            </div>

            {/* Full Name */}
            <div style={{
              position: 'absolute',
              top: '1150px',
              left: '700px',
              right: '700px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '90px',
                fontWeight: '800',
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '5px',
                lineHeight: '1.3'
              }}>
                {formData.fullName}
              </h2>
            </div>

            {/* Main Description Text */}
            <div style={{
              position: 'absolute',
              top: '1330px',
              left: '650px',
              right: '650px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '54px',
                fontWeight: '500',
                color: '#000',
                lineHeight: '1.6',
                letterSpacing: '1px'
              }}>
                {formData.studyPeriod
                  ? `${formData.studyPeriod} oralig'ida`
                  : (formData.startDate && formData.endDate)
                    ? `${formData.startDate} dan ${formData.endDate} gacha`
                    : ''
                } IMH-TRADE tomonidan<br/>
                {formData.hours} soatga mo'ljallangan "<span style={{ fontWeight: '700', color: '#000' }}>{formData.courseTitle}</span>"<br/>
                yo'nalishi farmatsevt mutaxassisligi bo'yicha uzluksiz<br/>
                kasbiy ta'lim tizimida malaka oshirish vebinar-treningni muvaffaqiyatli tugatganligi haqida berilgan.
              </p>
            </div>

            {/* Director Signature Line - Left */}
            <div style={{
              position: 'absolute',
              top: '1850px',
              left: '700px',
              width: '750px'
            }}>
              <div style={{
                width: '100%',
                height: '5px',
                background: '#000',
                marginBottom: '18px'
              }} />
              <div style={{
                fontSize: '46px',
                fontWeight: '600',
                color: '#000',
                textAlign: 'center',
                textTransform: 'lowercase',
                letterSpacing: '2px'
              }}>
                direktor
              </div>
            </div>

            {/* Director Name - Right */}
            <div style={{
              position: 'absolute',
              top: '1850px',
              left: '2050px',
              width: '950px'
            }}>
              <div style={{
                width: '100%',
                height: '5px',
                background: '#000',
                marginBottom: '18px'
              }} />
              <div style={{
                fontSize: '46px',
                fontWeight: '600',
                color: '#000',
                textAlign: 'center',
                letterSpacing: '1px'
              }}>
                {formData.directorName}
              </div>
            </div>

            {/* Registration Date - Bottom Left */}
            <div style={{
              position: 'absolute',
              bottom: '330px',
              left: '330px',
              fontSize: '48px',
              fontWeight: '600',
              color: '#000',
              letterSpacing: '1px'
            }}>
              Ro'yxatga olingan sana {formData.registerDate}
            </div>

            {/* Certificate Info - Bottom Right */}
            <div style={{
              position: 'absolute',
              bottom: '340px',
              right: '340px',
              textAlign: 'right'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '600',
                color: '#000',
                marginBottom: '12px',
                letterSpacing: '1px'
              }}>
                Qayd raqami: {formData.qaydNumber}
              </div>
              <div style={{
                fontSize: '46px',
                fontWeight: '500',
                color: '#000',
                letterSpacing: '1px'
              }}>
                Sertifikat amal qilish muddati {formData.durationYears || ''} yil
              </div>
            </div>

            {/* QR Code - Bottom Left */}
            <div style={{
              position: 'absolute',
              bottom: '450px',
              left: '330px',
              width: '300px',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              border: '2px solid #000',
            }}>
              {formData.qrImageUrl ? (
                <img
                  src={formData.qrImageUrl}
                  alt="QR Code"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  onLoad={() => setQrReady(true)}
                />
              ) : (
                <QRCodeCanvas
                  value={formatQRText()}
                  size={300}
                  bgColor="#fff"
                  fgColor="#000"
                  level="H"
                  style={{ width: '100%', height: '100%' }}
                  onRendered={() => setQrReady(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '15px 35px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#666',
                background: '#fff',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Yopish
            </button>
          )}
          <button
            onClick={downloadAsPNG}
            style={{
              padding: '15px 35px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              background: 'linear-gradient(135deg, #006670 0%, #004d54 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            PNG yuklab olish
          </button>
          <button
            onClick={downloadAsPDF}
            style={{
              padding: '15px 35px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            PDF yuklab olish
          </button>
        </div>
      </div>
    </div>
  );
}
