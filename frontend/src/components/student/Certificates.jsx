import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Award, Download, ExternalLink, CalendarDays, BadgeCheck } from 'lucide-react';
import { Header } from '../customreuse/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Certificates() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to view your certificates.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/certificates/student/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch certificates');
      const data = await res.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      console.error('FETCH CERTIFICATES ERROR:', err);
      setCertificates([]);
      setError('Unable to load certificates right now.');
    } finally {
      setLoading(false);
    }
  }

  async function downloadCertificate(certificateNumber) {
    try {
      window.open(`${API_URL}/certificates/download/${encodeURIComponent(certificateNumber)}`, '_blank');
    } catch (err) {
      console.error('DOWNLOAD CERTIFICATE ERROR:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-6">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-4 sm:p-6  ">
        <div className="mb-7 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-5 sm:p-6 text-white shadow-lg">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Certificates</h2>
              <p className="mt-1 text-blue-50 text-sm sm:text-base">View and download your earned certifications.</p>
            </div>
            <div className="hidden sm:flex items-center justify-center rounded-xl bg-white/15 p-3">
              <Award className="h-7 w-7" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {certificates.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Award className="h-6 w-6" />
            </div>
            <div className="text-gray-700 font-semibold">No certificates found</div>
            <div className="text-sm text-gray-500 mt-1">Complete a skill test to unlock your first certificate.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificates.map((c) => (
              <div
                key={c.id}
                className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />

                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified Certificate
                    </div>
                    <div className="text-xs text-gray-400">#{c.certificate_number}</div>
                  </div>

                  <div className="font-bold text-xl text-gray-900 leading-tight">
                    {c.data_json?.student_name || 'Certificate'}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 font-medium">
                    {c.data_json?.exam_title || 'Course Certification'}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                    Issued on {new Date(c.issued_at).toLocaleDateString()}
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Button
                      onClick={() => window.open(`${API_URL}/certificates/view/${encodeURIComponent(c.certificate_number)}`, '_blank')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Certificate
                    </Button>

                    <Button
                      onClick={() => downloadCertificate(c.certificate_number)}
                      variant="outline"
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>

                  <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-blue-100/50 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
