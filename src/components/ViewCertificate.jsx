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


  const directorName = source.director || source.directorName || "M.Z.NURULLAYEVA";
  const formData = {
    fullName: source.fullName || '',
    certNumber: source.certificateNumber || '',
    diplomNumber: source.diplomaNumber || '',
    qaydNumber: source.registrationNumber || '',
    courseTitle: source.organizationName+"(GPP)" || '',
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
  
  const formatQRText = () => {
    // Diplom raqamini encode qilib, qisqa URL yasaymiz
    if (formData.diplomNumber) {
      const encodedDiplom = encodeURIComponent(formData.diplomNumber);
      return `https://imh-trade.uz/?d=${encodedDiplom}`;
    }

    // Agar diplom raqami bo'lmasa, fallback URL
    return 'https://imhone.uz/view';
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
    <div>
      {/* Download Buttons */}
        <div style={{
          marginTop: '5px',
          marginBottom: '-15px',
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '5px 15px',
                fontSize: '16px',
                fontWeight: '700',
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
              padding: '5px 15px',
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
              padding: '5px 15px',
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
              fontFamily: "'Times New Roman', serif",
              fontWeight: '800'
            }}
          >
            {/* Logo/Emblem */}
            <div style={{
              position: 'absolute',
              top: '40%',
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
              left: '400px',
              width: '1000px',
              textAlign: 'center',
              textTransform: 'uppercase',
              lineHeight: '1.4'
            }}>
              <div style={{
                fontSize: '62px',
                fontWeight: '900',
                color: '#000',
                marginBottom: '8px',
                letterSpacing: '0px'
              }}>
                O'ZBEKISTON RESPUBLIKASI
              </div>
              <div style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#000',
                letterSpacing: '0px'
              }}>
                OLIY TA'LIM FAN VA
              </div>
              <div style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#000',
                letterSpacing: '0px'
              }}>
                INNOVATSIYA VAZIRLIGI
              </div>
            </div>

            {/* Top Right Text - English */}
            <div style={{
              position: 'absolute',
              top: '300px',
              right: '400px',
              width: '1200px',
              textAlign: 'center',
              textTransform: 'uppercase',
              lineHeight: '1.4'
            }}>
              <div style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#000',
                letterSpacing: '0px'
              }}>
                MINISTRY OF HIGHER EDUCATION,
              </div>
              <div style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#000',
                letterSpacing: '0px'
              }}>
                SCIENCE AND INNOVATION OF THE
              </div>
              <div style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#000',
                letterSpacing: '0px'
              }}>
                REPUBLIC OF UZBEKISTAN
              </div>
            </div>

            {/* Main Title - SERTIFIKAT */}
            <div style={{
              position: 'absolute',
              top: '650px',
              left: '500px',
              right: '500px',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '350px',
                fontWeight: '900',
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '10px',
                lineHeight: '1.0'
              }}>
                SERTIFIKAT
              </h1>
            </div>

            {/* Certificate Number and Diploma Number */}
            <div style={{
              position: 'absolute',
              lineHeight:'0.95',
              top: '910px',
              left: '900px',
              right: '900px',
              textAlign: 'center'
            }}>
              <div style={{
                marginTop: '90px',
                fontSize: '82px',
                fontWeight: '800',
                color: '#000',
                marginBottom: '24px',
                letterSpacing: '0px'
              }}>
                {formData.certNumber.toUpperCase()}
              </div>
              <div style={{
                fontSize: '58px',
                fontWeight: '800',
                marginBottom: '100px',
                color: '#000',
                letterSpacing: '0px'
              }}>
                {formData.diplomNumber} - ushbu sertifikat egasining diplom raqami
              </div>
            </div>

            {/* Full Name */}
            <div style={{
              position: 'absolute',
              top: '1200px',
              left: '700px',
              right: '700px',
              textAlign: 'center',
              borderBottom: '10px solid #000',
            }}>
              <h2 style={{
                fontSize: '105px',
                fontWeight: '900',
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '1'
              }}>
                {formData.fullName}
              </h2>
            </div>

            {/* Main Description Text */}
            <div style={{
              position: 'absolute',
              top: '1350px',
              left: '650px',
              right: '650px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '54px',
                fontWeight: '800',
                color: '#000',
                lineHeight: '1.1',
                letterSpacing: '0px'
              }}>
                {formData.studyPeriod
                  ? `${formData.studyPeriod} oralig'ida`
                  : (formData.startDate && formData.endDate)
                    ? `${formData.startDate} dan ${formData.endDate} gacha`
                    : ''
                } IMH-TRADE tomonidan<br/>
                 

                {formData.hours} soatga mo'ljallangan "<span style={{ fontWeight: '900', color: '#000' }}>{formData.courseTitle}</span>"<br/>
                milliy standarti asosida farmatsevt mutaxassislar uchun tashkil etilgan<br/>
                online-treningni muvaffaqiyatli tugatganligi haqida berilgan.
              </p>
            </div>

            {/* Director Signature Line - Left */}
            <div style={{
              position: 'absolute',
              top: '1780px',
              left: '700px',
              width: '750px'
            }}>
             
              <div style={{
                fontSize: '60px',
                fontWeight: '800',
                color: '#000',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0px'
              }}>
                DIREKTOR
              </div>
               <div style={{
                width: '100%',
                height: '5px',
                background: '#000',
                marginBottom: '18px'
              }} />
            </div>

            {/* Director Name - Right */}
            <div style={{
              position: 'absolute',
              top: '1780px',
              left: '2050px',
              width: '950px'
            }}>
              <div style={{
                fontSize: '60px',
                fontWeight: '800',
                color: '#000',
                textAlign: 'center',
                letterSpacing: '0px'
              }}>
                {formData.directorName.toUpperCase()}
              </div>

              <div style={{
                width: '100%',
                height: '5px',
                background: '#000',
                marginBottom: '18px'
              }} />
            </div>

            {/* Registration Date - Bottom Left */}
            <div style={{
              position: 'absolute',
              bottom: '330px',
              left: '330px',
              fontSize: '56px',
              fontWeight: '800',
              color: '#000',
              letterSpacing: '0px'
            }}>
              Ro'yxatga olingan sana {formData.registerDate}
            </div>

            {/* Certificate Info - Bottom Right */}
            <div style={{
              position: 'absolute',
              bottom: '340px',
              right: '350px',
              textAlign: 'right'
            }}>
              <div style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#000',
                textAlign:'center',
                marginBottom: '12px',
                letterSpacing: '0px'
              }}>
                Qayd raqami: {formData.qaydNumber}
              </div>
              <div style={{
                fontSize: '54px',
                fontWeight: '800',
                color: '#000',
                letterSpacing: '0px'
              }}>
                Sertifikat amal qilish muddati {formData.durationYears || ''} yil
              </div>
            </div>

            {/* QR Code - Bottom Left */}
            <div style={{
              position: 'absolute',
              bottom: '430px',
              left: '310px',
              width: '340px',
              height: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              padding: '20px'
            }}>
              {formData.qrImageUrl && formData.qrImageUrl !== 'local' && formData.qrImageUrl.startsWith('http') ? (
                <img
                  src={formData.qrImageUrl}
                  alt="QR Code"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <QRCodeCanvas
                  value={formatQRText()}
                  size={300}
                  bgColor="#ffffff"
                  level="L"
                  marginSize={2}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          </div>
        </div>

        
      </div>
    </div>
    </div>
  );
}
