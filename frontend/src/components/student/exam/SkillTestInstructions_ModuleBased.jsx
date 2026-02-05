import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, Award, FileText, Info } from 'lucide-react';

const SkillTestInstructions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
const response = await axios.get(`http://localhost:5000/api/skill-tests/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTest(response.data);
      setModules(response.data.modules || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch test details:', err);
      setError('Failed to load test details');
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!acceptedTerms) {
      setError('Please accept the instructions by checking the box');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/skill-tests/tests/${testId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate to test page with attemptId and token
      navigate(`/student/skill-test/${testId}/take?attemptId=${response.data.attemptId}&token=${response.data.token}`);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You have already attempted this test');
      } else {
        setError('Failed to start test. Please try again.');
      }
    }
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/skill-test')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Exam Schedule Instructions</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Test Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Category Badge */}
              <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-semibold mb-3">
                {test.category_name}
              </div>

              {/* Test Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{test.title}</h2>
              <div className="flex items-center gap-2 text-orange-600 text-sm mb-6">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                <span className="font-medium">{test.category_name}</span>
              </div>

            

              {/* Test Stats */}
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

              {/* Module Breakdown */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Test Modules</h3>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{module.name}</span>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          {module.module_type === 'MCQ' && test.mcq_count}
                          {module.module_type === 'FILL_BLANK' && test.fill_blank_count}
                          {module.module_type === 'PROGRAMMING' && test.programming_count}
                          {' Questions'}
                        </span>
                        <span>
                          {module.module_type === 'MCQ' && test.mcq_count}
                          {module.module_type === 'FILL_BLANK' && test.fill_blank_count}
                          {module.module_type === 'PROGRAMMING' && test.programming_count}
                          {' Marks'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-6">{test.description}</p>

              {/* Exam Instructions */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Exam Instructions</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Total duration of quiz is {test.duration_minutes} minutes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>The quiz contains {test.total_questions} questions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Minimum Pass Percentage is {test.passing_percentage}%.</span>
                  </li>
                </ul>
              </div>

              {/* Standard Instructions */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Standard Instructions</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the test. When the timer reaches zero, the test will end by itself.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does <strong>NOT</strong> save your answer to the current question.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      The Question Palette displayed on the right side of screen will show the status of each question.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Start Test */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              {/* Terms Checkbox */}
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

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Start Button */}
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

              {test.has_attempted && (
                <p className="mt-3 text-xs text-center text-red-600">
                  You have already attempted this test
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTestInstructions;