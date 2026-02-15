import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const SkillTestInstructions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const questionTypeMeta = {
    MSA: 'Multiple Choice Single Answer',
    MMA: 'Multiple Choice Multiple Answers',
    TOF: 'True / False',
    SAQ: 'Short Answer',
    MTF: 'Match the Following',
    ORD: 'Ordering / Sequence',
    FIB: 'Fill in the Blanks'
  };

  const formatQuestionTypeLabel = (code) => {
    const key = String(code || '').toUpperCase();
    return questionTypeMeta[key] || key || 'Other';
  };

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
const fetchTestDetails = async () => {
    try {
      const [examsRes, questionsRes, attemptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/exam-management/exams?page=1&limit=1000&status=active'),
        axios.get(`http://localhost:5000/api/exam-management/exams/${testId}/questions`),
        axios.get(`http://localhost:5000/api/exam-management/exams/${testId}/attempt-status`, {
          headers: getAuthHeaders(),
        })
      ]);

      const exam = (examsRes.data?.data || []).find((e) => String(e.id) === String(testId));
      if (!exam) throw new Error('Exam not found');

      const questions = questionsRes.data?.data || [];
      const typeCounts = questions.reduce((acc, q) => {
        const typeCode = String(q?.question_data?.question_type_code || 'OTHER').toUpperCase();
        acc[typeCode] = (acc[typeCode] || 0) + 1;
        return acc;
      }, {});

      const mappedTypes = Object.entries(typeCounts)
        .map(([code, count]) => ({ code, count, label: formatQuestionTypeLabel(code) }))
        .sort((a, b) => b.count - a.count);

      setQuestionTypes(mappedTypes);
      setTest({
        id: exam.id,
        title: exam.title,
        category_name: exam.category_name,
        duration_minutes: exam.duration_minutes || 60,
        total_questions: questions.length,
        passing_percentage: Number(exam.passing_score || 70),
        description: exam.description || exam.short_description || '',
        has_attempted: Boolean(attemptRes?.data?.data?.has_attempted)
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch test details:', err);
      setError('Failed to load test details');
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (test?.has_attempted) {
      setError('You have already attempted this exam');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the instructions by checking the box');
      return;
    }
    navigate(`/student/skill-test/${testId}/take`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600">Test not found</p>
          <button onClick={() => navigate('/student/skill-test')} className="mt-4 text-blue-600 hover:underline">
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/skill-test')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 font-semibold mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <h1 className="text-xl font-bold text-gray-900">Exam Instructions</h1>
        <br />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-semibold mb-3">
                {formatDisplayName(test.category_name)}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">{formatDisplayName(test.title)}</h2>
              <div className="flex items-center gap-2 text-orange-600 text-sm mb-6">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                <span className="font-medium">{formatDisplayName(test.category_name)}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <h4 className="text-xs text-blue-600 font-semibold mb-1">Total Duration</h4>
                  <p className="text-lg font-bold text-gray-900">{test.duration_minutes} Minutes</p>
                </div>
                <div>
                  <h4 className="text-xs text-blue-600 font-semibold mb-1">No. of Questions</h4>
                  <p className="text-lg font-bold text-gray-900">{test.total_questions} Questions</p>
                </div>
                <div>
                  <h4 className="text-xs text-blue-600 font-semibold mb-1">Total Marks</h4>
                  <p className="text-lg font-bold text-gray-900">{test.total_questions} Marks</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Question Types</h3>
                <div className="space-y-2">
                  {questionTypes.length > 0 ? (
                    questionTypes.map((qt) => (
                      <div key={qt.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{qt.label}</span>
                        <span className="text-sm text-gray-600">{qt.count} Questions</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-500 text-sm">
                      No questions added yet
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-6">{test.description}</p>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Exam Instructions</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span><span>Total duration of quiz is {test.duration_minutes} minutes.</span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span><span>The quiz contains {test.total_questions} questions.</span></li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span><span>Minimum Pass Percentage is {test.passing_percentage}%.</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      setError('');
                    }}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    I've read all the instructions carefully and have understood them.
                  </span>
                </label>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleStartTest}
                disabled={!acceptedTerms || test.has_attempted}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                  acceptedTerms && !test.has_attempted
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {test.has_attempted ? 'Already Attempted' : 'Start Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTestInstructions;

