
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Home, TrendingUp, Target } from 'lucide-react';
import { Header } from '../../customreuse/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SKILL_TEST_LOCK_KEY = 'skill_test_lock';

const SkillTestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, totalQuestions, percentage, passed, testTitle, examId } = location.state || {};
  const [certificate, setCertificate] = React.useState(null);
  const [certificateLoading, setCertificateLoading] = React.useState(false);
  const [certificateError, setCertificateError] = React.useState('');

  React.useEffect(() => {
    if (score === undefined || score === null) {
      navigate('/student/skill-test');
    }
    sessionStorage.removeItem(SKILL_TEST_LOCK_KEY);
  }, [score, navigate]);

  // Redirect if no data
  if (score === undefined || score === null) return null;

  const percentageNum = parseFloat(percentage);

  const formatDisplayName = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return raw
      .split(/\s+/)
      .map((word) => {
        if (word.length <= 3 && word === word.toUpperCase()) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const fetchCertificate = React.useCallback(async (showLoader = true) => {
    if (!passed) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    if (showLoader) setCertificateLoading(true);
    setCertificateError('');
    try {
      const res = await fetch(`${API_URL}/certificates/student/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch certificates');
      const data = await res.json();
      const all = data.certificates || [];

      let matched = null;
      if (examId !== undefined && examId !== null) {
        matched = all.find((c) => Number(c.exam_id) === Number(examId)) || null;
      }
      if (!matched && testTitle) {
        const normalizedTitle = String(testTitle).trim().toLowerCase();
        matched =
          all.find((c) => String(c?.data_json?.exam_title || '').trim().toLowerCase() === normalizedTitle) || null;
      }

      setCertificate(matched);
      return matched || null;
    } catch (err) {
      setCertificateError(err?.message || 'Unable to load certificate');
      setCertificate(null);
      return null;
    } finally {
      if (showLoader) setCertificateLoading(false);
    }
  }, [passed, examId, testTitle]);

  React.useEffect(() => {
    fetchCertificate(true);
  }, [fetchCertificate]);

  React.useEffect(() => {
    if (!passed || certificate?.certificate_number) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // ~60 seconds at 2s interval

    const intervalId = setInterval(async () => {
      if (cancelled) return;
      attempts += 1;
      const matched = await fetchCertificate(false);
      if (matched?.certificate_number || attempts >= maxAttempts) {
        clearInterval(intervalId);
        if (!matched?.certificate_number && !cancelled) {
          setCertificateError('Certificate is taking longer than expected. Please check again shortly.');
        }
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [passed, certificate?.certificate_number, fetchCertificate]);

  const downloadCertificate = async () => {
    if (!certificate?.certificate_number) return;
    try {
      window.open(`${API_URL}/certificates/download/${encodeURIComponent(certificate.certificate_number)}`, '_blank');
    } catch (err) {
      console.error('DOWNLOAD CERTIFICATE ERROR:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl w-full mx-auto flex items-center justify-center py-8 px-4">

        {/* Result Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Score */}
          <div className="bg-blue-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-1">{formatDisplayName(testTitle)}</h2>
            <p className="text-blue-100">Skill Test Results</p>
          </div>

          <div className="p-8">
            {/* Score Summary Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Answered</p>
                  <p className="text-2xl font-bold text-gray-900">{score}/{totalQuestions}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Percentage</p>
                  <p className="text-2xl font-bold text-gray-900">{percentageNum}%</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Score</p>
                  <p className="text-2xl font-bold text-gray-900">{score}/{totalQuestions}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Pass/Fail</p>
                  <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {passed ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pass Percentage Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Pass Percentage: 40%</strong>
              </p>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-sm text-gray-600 mt-1">Total Questions</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600 mt-1">Correct Answers</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{totalQuestions - score}</div>
                <div className="text-sm text-gray-600 mt-1">Wrong Answers</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className={`border-l-4 p-5 rounded-lg mb-8 ${
              percentageNum >= 80 
                ? 'bg-green-50 border-green-500' 
                : percentageNum >= 60 
                ? 'bg-blue-50 border-blue-500'
                : percentageNum >= 40
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start gap-3">
                <Award className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  percentageNum >= 80 
                    ? 'text-green-600' 
                    : percentageNum >= 60 
                    ? 'text-blue-600'
                    : percentageNum >= 40
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`} />
                <div className="flex-1">
                  <h3 className={`font-bold mb-1 ${
                    percentageNum >= 80 
                      ? 'text-green-800' 
                      : percentageNum >= 60 
                      ? 'text-blue-800'
                      : percentageNum >= 40
                      ? 'text-yellow-800'
                      : 'text-red-800'
                  }`}>
                    {percentageNum >= 80 ? 'Outstanding Performance!' : 
                     percentageNum >= 60 ? 'Good Job!' :
                     percentageNum >= 40 ? 'Passed!' :
                     'Needs Improvement'}
                  </h3>
                  <p className={`text-sm ${
                    percentageNum >= 80 
                      ? 'text-green-700' 
                      : percentageNum >= 60 
                      ? 'text-blue-700'
                      : percentageNum >= 40
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {percentageNum >= 80 ? 'Excellent work! You have a strong grasp of the material.' : 
                     percentageNum >= 60 ? 'Well done! You have a good understanding of most topics.' :
                     percentageNum >= 40 ? 'You passed the test. Consider reviewing the topics you missed.' :
                     'We recommend reviewing the material and strengthening your skills.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/student/skill-test')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Home className="w-5 h-5" />
                <span>Back to Skill Tests</span>
              </button>
              {passed && certificate?.certificate_number && (
                <>
                  <button
                    onClick={() => window.open(`${API_URL}/certificates/view/${encodeURIComponent(certificate.certificate_number)}`, '_blank')}
                    className="flex-1 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg font-semibold shadow-sm transition-all"
                  >
                    View Certificate
                  </button>
                  <button
                    onClick={downloadCertificate}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition-all"
                  >
                    Download Certificate
                  </button>
                </>
              )}
            </div>
            {passed && !certificate?.certificate_number && (
              <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                {certificateLoading
                  ? 'Generating your certificate, please wait...'
                  : 'Your certificate is being generated and will appear automatically.'}
              </div>
            )}
            {certificateError && (
              <div className="mt-3 text-sm text-red-600">{certificateError}</div>
            )}
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default SkillTestResult;
