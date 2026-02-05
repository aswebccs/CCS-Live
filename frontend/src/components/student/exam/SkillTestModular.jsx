import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, X, Flag, Send, AlertCircle, Clock } from 'lucide-react';

const SkillTestModular = () => {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const attemptId = searchParams.get('attemptId');
  const token = searchParams.get('token');

  const [test, setTest] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!attemptId || !token) {
      navigate('/student/skill-test');
      return;
    }
    fetchTestData();
  }, [testId, attemptId, token]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitTest(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (modules.length > 0 && currentModuleIndex < modules.length) {
      fetchQuestionsForModule(modules[currentModuleIndex].id);
    }
  }, [currentModuleIndex, modules]);

  const fetchTestData = async () => {
    try {
      const authToken = localStorage.getItem('token');
      // FIXED: Added /tests/ prefix
      const response = await axios.get(`http://localhost:5000/api/skill-tests/tests/${testId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      setTest(response.data);
      setModules(response.data.modules || []);
      setTimeRemaining(response.data.duration_minutes * 60);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch test:', err);
      navigate('/student/skill-test');
    }
  };

  const fetchQuestionsForModule = async (moduleId) => {
    try {
      const authToken = localStorage.getItem('token');
      
      // FIXED: Added /tests/ prefix
      const response = await axios.get(
        `http://localhost:5000/api/skill-tests/tests/${testId}/modules/${moduleId}/questions`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      console.log('Questions:', response.data);
      setQuestions(response.data);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  };

  const saveAnswer = async (questionId, answerText) => {
    try {
      const authToken = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/skill-tests/answer`,
        {
          attemptId,
          questionId,
          answerText,
          isMarkedForReview: markedForReview[questionId] || false,
          token
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleAnswerSelect = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option
    }));
    saveAnswer(currentQuestion.id, option);
  };

  const handleMarkForReview = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  const handleClearAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex((prev) => prev - 1);
    }
  };

  const handleModuleChange = (index) => {
    setCurrentModuleIndex(index);
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = async (autoSubmit = false) => {
    if (!autoSubmit) {
      setShowSubmitModal(true);
      return;
    }
    setIsSubmitting(true);

    try {
      const authToken = localStorage.getItem('token');
      
      // FIXED: Added /attempts/ prefix
      const response = await axios.post(
        `http://localhost:5000/api/skill-tests/attempts/${attemptId}/submit`,
        { token },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      console.log('Submit response:', response.data);
      
      navigate('/student/skill-test/result', {
        state: { 
          score: response.data.score,
          totalQuestions: response.data.totalQuestions,
          percentage: response.data.percentage,
          passed: response.data.passed,
          testTitle: test.title
        }
      });
    } catch (err) {
      console.error('Failed to submit test:', err);
      alert('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId) => {
    if (answers[questionId] && markedForReview[questionId]) return 'answered-marked';
    if (answers[questionId]) return 'answered';
    if (markedForReview[questionId]) return 'marked';
    return 'not-visited';
  };

  const getStatusCounts = () => {
    const allQuestionIds = questions.map(q => q.id);
    const answered = allQuestionIds.filter(id => answers[id] && !markedForReview[id]).length;
    const marked = allQuestionIds.filter(id => markedForReview[id] && !answers[id]).length;
    const answeredMarked = allQuestionIds.filter(id => answers[id] && markedForReview[id]).length;
    const notAnswered = allQuestionIds.filter(id => !answers[id] && !markedForReview[id]).length;
    const notVisitedCount = questions.length - answered - marked - answeredMarked;

    return { answered, marked, answeredMarked, notAnswered, notVisited: notVisitedCount };
  };

  if (loading || !test) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentModule = modules[currentModuleIndex];
  const stats = getStatusCounts();
  const answeredCount = stats.answered + stats.answeredMarked;
  const markedCount = stats.marked + stats.answeredMarked;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header Bar */}
      <div className="bg-blue-600 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{test.title}</h1>
              <p className="text-xs text-blue-100">Skill Assessment Test</p>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                timeRemaining < 300 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-white text-blue-600'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Side - Question Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Question Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-semibold text-sm">
                    Q {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  {markedForReview[currentQuestion.id] && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-medium text-xs flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      Marked for Review
                    </span>
                  )}
                </div>
                <button
                  onClick={handleMarkForReview}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                    markedForReview[currentQuestion.id]
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {markedForReview[currentQuestion.id] ? 'Unmark' : 'Mark for Review'}
                </button>
              </div>

              {/* Module Info */}
              <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold">{currentModule?.name}</span> | {currentModule?.module_type.replace('_', ' ')}
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-base text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options / Question Content */}
              <div className="space-y-3 mb-6">
                {currentQuestion.question_type === 'MCQ' && (
                  ['A', 'B', 'C', 'D'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        answers[currentQuestion.id] === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                          answers[currentQuestion.id] === option
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 text-gray-600'
                        }`}>
                          {option}
                        </div>
                        <span className="text-sm text-gray-800 flex-1">
                          {currentQuestion[`option_${option.toLowerCase()}`]}
                        </span>
                      </div>
                    </button>
                  ))
                )}

                {currentQuestion.question_type === 'FILL_BLANK' && (
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                )}

                {currentQuestion.question_type === 'PROGRAMMING' && (
                  <textarea
                    value={answers[currentQuestion.id] || currentQuestion.starter_code || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    rows={15}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Write your code here..."
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={handleClearAnswer}
                  disabled={!answers[currentQuestion.id]}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <X className="w-4 h-4" />
                  Clear Answer
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 && currentModuleIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1 && currentModuleIndex === modules.length - 1}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Save & Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Question Palette */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Question Palette</h3>
              
              {/* Stats */}
              <div className="space-y-2 mb-5 pb-4 border-b">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-500 rounded"></span>
                    <span className="text-gray-700">Answered</span>
                  </span>
                  <span className="font-bold text-gray-900">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-yellow-500 rounded"></span>
                    <span className="text-gray-700">Marked</span>
                  </span>
                  <span className="font-bold text-gray-900">{markedCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-gray-300 rounded"></span>
                    <span className="text-gray-700">Not Answered</span>
                  </span>
                  <span className="font-bold text-gray-900">{questions.length - answeredCount}</span>
                </div>
              </div>

              {/* Question Numbers Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {questions.map((q, index) => {
                  const status = getQuestionStatus(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionJump(index)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                        index === currentQuestionIndex
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : ''
                      } ${
                        status === 'answered' || status === 'answered-marked'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : status === 'marked'
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Finish Test Button */}
              <button
                onClick={() => handleSubmitTest(false)}
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Finish Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-9 h-9 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Submit Skill Test?</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>You have answered <span className="font-semibold text-gray-900">{answeredCount}</span> out of <span className="font-semibold text-gray-900">{questions.length}</span> questions.</p>
                {markedCount > 0 && (
                  <p className="text-yellow-600 font-medium">{markedCount} questions are marked for review.</p>
                )}
                <p className="text-red-600 font-bold mt-3">⚠️ This test can only be taken once!</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Review Again
              </button>
              <button
                onClick={() => handleSubmitTest(true)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTestModular;