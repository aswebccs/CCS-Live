import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, X, Flag, Send, AlertCircle, Clock } from 'lucide-react';

const SkillTestModular = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [visitedQuestions, setVisitedQuestions] = useState({});
  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIndex]?.id) {
      const qId = questions[currentQuestionIndex].id;

      setVisitedQuestions((prev) => ({
        ...prev,
        [qId]: true
      }));
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    fetchTestData();
  }, [testId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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
  }, [currentModuleIndex, modules, allQuestions]);

  const fetchTestData = async () => {
    try {
      const [examsRes, modulesRes, questionsRes, attemptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/exam-management/exams?page=1&limit=1000&status=active'),
        axios.get(`http://localhost:5000/api/exam-management/exams/${testId}/modules`),
        axios.get(`http://localhost:5000/api/exam-management/exams/${testId}/questions`),
        axios.get(`http://localhost:5000/api/exam-management/exams/${testId}/attempt-status`, {
          headers: getAuthHeaders(),
        }),
      ]);

      const exam = (examsRes.data?.data || []).find((e) => String(e.id) === String(testId));
      if (!exam) {
        navigate('/student/skill-test');
        return;
      }

      if (attemptRes?.data?.data?.has_attempted) {
        navigate('/student/skill-test');
        return;
      }

      const modulesData = modulesRes.data?.data || [];
      const mappedModules = modulesData.map((m) => ({
        id: m.id,
        name: m.title || m.module_type,
        module_type: m.module_type
      }));

      const rawQuestions = questionsRes.data?.data || [];
      const mappedQuestions = rawQuestions.map((q) => {
        const qd = q.question_data || {};
        const options = qd.options || [];
        const typeCode = qd.question_type_code || 'MSA';
        let uiType = 'MCQ';
        if (['FIB', 'SAQ'].includes(typeCode)) uiType = 'FILL_BLANK';
        if (typeCode === 'PRG') uiType = 'PROGRAMMING';

        return {
          id: q.id,
          module_id: q.module_id,
          question: q.question_text,
          question_type: uiType,
          option_a: options[0] || '',
          option_b: options[1] || '',
          option_c: options[2] || '',
          option_d: options[3] || '',
          starter_code: qd.reference_solution || '',
          _question_data: qd
        };
      });

      setTest({
        id: exam.id,
        title: exam.title,
        duration_minutes: exam.duration_minutes || 60,
        passing_percentage: Number(exam.passing_score || 70)
      });
      setModules(mappedModules);
      setAllQuestions(mappedQuestions);
      setQuestions([]);
      setAnswers({});
      setMarkedForReview({});
      setTimeRemaining((exam.duration_minutes || 60) * 60);
      setQuestions(mappedQuestions.filter((x) => String(x.module_id) === String(mappedModules[0]?.id)));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch test:', err);
      navigate('/student/skill-test');
    }
  };

  const fetchQuestionsForModule = async (moduleId) => {
    try {
      const all = allQuestions || [];
      const filtered = all.filter((q) => String(q.module_id) === String(moduleId));
      setQuestions(filtered);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  };

  const saveAnswer = async (questionId, answerText) => {
    return;
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
      const all = allQuestions || [];
      let score = 0;

      all.forEach((q) => {
        const qd = q._question_data || {};
        const typeCode = qd.question_type_code || 'MSA';
        const userAns = answers[q.id];

        if (typeCode === 'MSA' || typeCode === 'TOF') {
          if (String(userAns || '').trim().toLowerCase() === String(qd.correct_answer || '').trim().toLowerCase()) score += 1;
          return;
        }

        if (typeCode === 'MMA') {
          const expected = (qd.correct_indexes || []).map(Number).sort();
          const user = Array.isArray(userAns) ? userAns.map(Number).sort() : [];
          if (expected.length === user.length && expected.every((v, i) => v === user[i])) score += 1;
          return;
        }

        if (['FIB', 'SAQ'].includes(typeCode)) {
          const expectedAnswers = (qd.answers || []).map((a) => String(a).trim().toLowerCase());
          if (expectedAnswers.includes(String(userAns || '').trim().toLowerCase())) score += 1;
          return;
        }

        if (typeCode === 'ORD') {
          const expected = (qd.sequence || []).map((a) => String(a).trim().toLowerCase());
          const user = String(userAns || '').split(',').map((a) => a.trim().toLowerCase()).filter(Boolean);
          if (expected.length === user.length && expected.every((v, i) => v === user[i])) score += 1;
          return;
        }
      });

      const totalQuestions = all.length || 0;
      const percentage = totalQuestions ? ((score / totalQuestions) * 100).toFixed(2) : '0.00';
      const passed = Number(percentage) >= Number(test.passing_percentage || 70);

      await axios.post(
        `http://localhost:5000/api/exam-management/exams/${testId}/attempts/submit`,
        {
          score,
          total_questions: totalQuestions,
          percentage: Number(percentage),
          passed,
        },
        { headers: getAuthHeaders() }
      );

      navigate('/student/skill-test/result', {
        state: {
          score,
          totalQuestions,
          percentage,
          passed,
          testTitle: test.title
        }
      });
    } catch (err) {
      console.error('Failed to submit test:', err);
      if (err?.response?.status === 409) {
        alert('You have already attempted this exam.');
        navigate('/student/skill-test');
      } else {
        alert('Failed to submit test. Please try again.');
      }
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
    if (answers[questionId] && markedForReview[questionId]) {
      return 'answered-marked';
    }

    if (answers[questionId]) {
      return 'answered';
    }

    if (markedForReview[questionId]) {
      return 'marked';
    }

    if (visitedQuestions[questionId]) {
      return 'not-answered';
    }

    return 'not-visited';
  };

  const getStatusCounts = () => {
    const allQuestionIds = questions.map((q) => q.id);
    const answered = allQuestionIds.filter((id) => answers[id] && !markedForReview[id]).length;
    const marked = allQuestionIds.filter((id) => markedForReview[id] && !answers[id]).length;
    const answeredMarked = allQuestionIds.filter((id) => answers[id] && markedForReview[id]).length;
    const notAnswered = allQuestionIds.filter((id) => !answers[id] && !markedForReview[id]).length;
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{test.title}</h1>
              <p className="text-xs text-blue-100">Skill Assessment Test</p>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                  timeRemaining < 300
                    ? 'bg-red-100 text-red-700'
                    : 'bg-white text-blue-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
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

              <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold">{currentModule?.name}</span> | {currentModule?.module_type.replace('_', ' ')}
              </div>

              <div className="mb-6">
                <p className="text-base text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

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
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                            answers[currentQuestion.id] === option
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Question Palette</h3>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 border rounded-md relative">
                      <span className="absolute bottom-0 w-full h-1 bg-green-500"></span>
                    </span>
                    <span>Answered</span>
                  </div>
                  <span className="font-semibold">{stats.answered}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 border rounded-md relative">
                      <span className="absolute bottom-0 w-full h-1 bg-red-500"></span>
                    </span>
                    <span>Not Answered</span>
                  </div>
                  <span className="font-semibold">{stats.notAnswered}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 border rounded-md relative">
                      <span className="absolute bottom-0 w-full h-1 bg-yellow-500"></span>
                    </span>
                    <span>Marked for Review</span>
                  </div>
                  <span className="font-semibold">{stats.marked}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 border rounded-md relative">
                      <span className="absolute bottom-0 w-full h-1 bg-purple-500"></span>
                    </span>
                    <span>Answered & Marked</span>
                  </div>
                  <span className="font-semibold">{stats.answeredMarked}</span>
                </div>

                <div className="flex items-center justify-between col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 border rounded-md relative">
                      <span className="absolute bottom-0 w-full h-1 bg-gray-400"></span>
                    </span>
                    <span>Not Visited</span>
                  </div>
                  <span className="font-semibold">{stats.notVisited}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {questions.map((q, index) => {
                  const status = getQuestionStatus(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionJump(index)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                        index === currentQuestionIndex
                          ? 'ring-1 ring-blue-500 ring-offset-2'
                          : ''
                      } ${
                        status === 'answered-marked'
                          ? ' ring-1 ring-purple-500 '
                          : status === 'answered'
                          ? 'ring-1 ring-green-500 '
                          : status === 'marked'
                          ? 'ring-1 ring-yellow-500 '
                          : status === 'not-answered'
                          ? 'ring-1 ring-red-500 '
                          : ' ring-1 ring-gray-500 '
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

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
                <p className="text-red-600 font-bold mt-3">This test can only be taken once!</p>
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
