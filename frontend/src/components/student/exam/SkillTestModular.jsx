import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, X, Flag, Send, AlertCircle, Clock } from 'lucide-react';

const SKILL_TEST_LOCK_KEY = 'skill_test_lock';

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
  const [showBackWarningModal, setShowBackWarningModal] = useState(false);
  const [showFullscreenWarningModal, setShowFullscreenWarningModal] = useState(false);
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

  useEffect(() => {
    const lockData = sessionStorage.getItem(SKILL_TEST_LOCK_KEY);
    if (!lockData) {
      navigate(`/student/skill-test/${testId}`, { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(lockData);
      if (String(parsed?.testId) !== String(testId) || parsed?.status !== 'in_progress') {
        navigate(`/student/skill-test/${testId}`, { replace: true });
      }
    } catch (e) {
      sessionStorage.removeItem(SKILL_TEST_LOCK_KEY);
      navigate(`/student/skill-test/${testId}`, { replace: true });
    }
  }, [testId, navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const isFullscreenActive = () =>
    Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

  const requestExamFullscreen = async () => {
    if (isFullscreenActive()) return true;
    const elem = document.documentElement;
    const request =
      elem.requestFullscreen ||
      elem.webkitRequestFullscreen ||
      elem.mozRequestFullScreen ||
      elem.msRequestFullscreen;
    if (!request) return false;
    try {
      await request.call(elem);
      return true;
    } catch (err) {
      return false;
    }
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

  useEffect(() => {
    if (!test) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Exam is in progress. Leaving now may submit or lose progress.';
      return event.returnValue;
    };

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setShowBackWarningModal(true);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [test]);

  useEffect(() => {
    if (!test) return;
    let mounted = true;

    const ensureFullscreen = async () => {
      const ok = await requestExamFullscreen();
      if (mounted) setShowFullscreenWarningModal(!ok);
    };

    const handleFullscreenChange = async () => {
      if (isFullscreenActive()) {
        setShowFullscreenWarningModal(false);
        return;
      }
      const ok = await requestExamFullscreen();
      setShowFullscreenWarningModal(!ok);
    };

    ensureFullscreen();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      mounted = false;
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [test]);

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
          question_type_code: typeCode,
          options: Array.isArray(options) && options.length
            ? options
            : (typeCode === 'TOF' ? ['True', 'False'] : []),
          starter_code: qd.reference_solution || '',
          _question_data: qd
        };
      });

      const modulesWithQuestions = mappedModules.filter((m) =>
        mappedQuestions.some((q) => String(q.module_id) === String(m.id))
      );
      const safeModules = modulesWithQuestions.length
        ? modulesWithQuestions
        : [{ id: 'all', name: 'Questions', module_type: 'GENERAL' }];

      setTest({
        id: exam.id,
        title: exam.title,
        duration_minutes: exam.duration_minutes || 60,
        passing_percentage: Number(exam.passing_score || 70)
      });
      setModules(safeModules);
      setAllQuestions(mappedQuestions);
      setQuestions([]);
      setAnswers({});
      setMarkedForReview({});
      setTimeRemaining((exam.duration_minutes || 60) * 60);
      sessionStorage.setItem(
        SKILL_TEST_LOCK_KEY,
        JSON.stringify({
          testId: String(testId),
          status: 'in_progress',
          startedAt: Date.now()
        })
      );
      setQuestions(
        safeModules[0]?.id === 'all'
          ? mappedQuestions
          : mappedQuestions.filter((x) => String(x.module_id) === String(safeModules[0]?.id))
      );
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch test:', err);
      navigate('/student/skill-test');
    }
  };

  const fetchQuestionsForModule = async (moduleId) => {
    try {
      const all = allQuestions || [];
      const filtered =
        moduleId === 'all'
          ? all
          : all.filter((q) => String(q.module_id) === String(moduleId));
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

  const handleMmaToggle = (questionId, optionIndex) => {
    setAnswers((prev) => {
      const prevValue = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const hasOption = prevValue.includes(optionIndex);
      const nextValue = hasOption
        ? prevValue.filter((i) => i !== optionIndex)
        : [...prevValue, optionIndex];

      if (nextValue.length === 0) {
        const clone = { ...prev };
        delete clone[questionId];
        return clone;
      }

      return {
        ...prev,
        [questionId]: nextValue,
      };
    });
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
          const normalizedUser = String(userAns || '').trim().toLowerCase();
          const normalizedCorrect = String(qd.correct_answer || '').trim().toLowerCase();
          if (normalizedUser === normalizedCorrect) {
            score += 1;
            return;
          }
          if (Number.isInteger(qd.correct_index) && normalizedUser === String(qd.correct_index)) {
            score += 1;
          }
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

      sessionStorage.removeItem(SKILL_TEST_LOCK_KEY);

      navigate('/student/skill-test/result', {
        state: {
          examId: Number(testId),
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
        sessionStorage.removeItem(SKILL_TEST_LOCK_KEY);
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
        <p>No questions found for this exam.</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white truncate">{test.title}</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <span className="font-semibold">{currentModule?.name}</span>
              </div>

              <div className="mb-6">
                <p className="text-base text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {currentQuestion.question_type === 'MCQ' && (
                  (currentQuestion.options || []).map((optionText, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    const isMma = currentQuestion.question_type_code === 'MMA';
                    const isChecked = isMma
                      ? (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(idx))
                      : answers[currentQuestion.id] === optionText;

                    if (isMma) {
                      return (
                        <label
                          key={`${label}-${idx}`}
                          className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(isChecked)}
                            onChange={() => handleMmaToggle(currentQuestion.id, idx)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center font-semibold text-sm flex-shrink-0 border-gray-300 text-gray-600">
                            {label}
                          </div>
                          <span className="text-sm text-gray-800 flex-1">{optionText}</span>
                        </label>
                      );
                    }

                    return (
                      <button
                        key={`${label}-${idx}`}
                        onClick={() => handleAnswerSelect(optionText)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-300 text-gray-600'
                            }`}
                          >
                            {label}
                          </div>
                          <span className="text-sm text-gray-800 flex-1">{optionText}</span>
                        </div>
                      </button>
                    );
                  })
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

      {showBackWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="p-6 bg-red-50 border-b border-red-100">
              <h3 className="text-lg font-bold text-red-900">Warning</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                Exam is in progress. You cannot go back until you submit the test.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowBackWarningModal(false)}
                className="px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm bg-red-500 hover:bg-red-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showFullscreenWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 bg-yellow-50 border-b border-yellow-100">
              <h3 className="text-lg font-bold text-yellow-900">Fullscreen Required</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                This exam must be taken in fullscreen mode. Click below to continue.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={async () => {
                  const ok = await requestExamFullscreen();
                  setShowFullscreenWarningModal(!ok);
                }}
                className="px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm bg-blue-600 hover:bg-blue-700"
              >
                Enter Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTestModular;




