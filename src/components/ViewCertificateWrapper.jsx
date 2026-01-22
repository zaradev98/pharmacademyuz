import { useLocation, useNavigate } from 'react-router-dom';
import ViewCertificate from './ViewCertificate';

export default function ViewCertificateWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  let data = location.state?.data;
  if (!data) {
    // Try to get from sessionStorage (for new tab)
    const stored = sessionStorage.getItem('viewCertificateData');
    if (stored) {
      data = JSON.parse(stored);
    }
  }
  if (!data) return <div>Ma'lumot topilmadi</div>;
  return <ViewCertificate data={data} onClose={() => navigate(-1)} />;
}
