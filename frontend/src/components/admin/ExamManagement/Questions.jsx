import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Save, X } from 'lucide-react';

const Questions = ({ categoryName, subcategoryName, examId, examTitle, levelName, onComplete }) => {
  const [selectedExamId, setSelectedExamId] = useState(examId || '');
  const [selectedExamInfo, setSelectedExamInfo] = useState({ title: examTitle || '', levelName: levelName || '' });
  const [exams, setExams] = useState([]);
  const [questionModules, setQuestionModules] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedModuleTypes, setSelectedModuleTypes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState({
    moduleId: '',
    questionText: '',
    marks: 1,
    difficulty: 'Medium',
    explanation: '',
    mcqOptions: ['', '', '', ''],
    mcqCorrectIndex: 0,
    codingSolution: '',
    codingSampleInput: '',
    codingExpectedOutput: '',
    blankAnswers: ''
  });

  useEffect(() => {
    loadExams();
    loadExamTypes();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    loadExamModules(selectedExamId);
    loadExamQuestions(selectedExamId);
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/exam-management/exams?page=1&limit=200');
      const result = await response.json();
      if (result.success) {
        setExams(result.data);
        if (!selectedExamId && result.data.length > 0) {
          const first = result.data[0];
          setSelectedExamId(first.id);
          setSelectedExamInfo({ title: first.title, levelName: first.level_name || '' });
        }
      }
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const loadExamTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/exam-management/exam-types');
      const result = await response.json();
      if (result.success) setExamTypes(result.data);
    } catch (error) {
      console.error('Error loading exam types:', error);
    }
  };

  const loadExamModules = async (examIdParam) => {
    try {
      const response = await fetch(`http://localhost:5000/api/exam-management/exams/${examIdParam}/modules`);
      const result = await response.json();
      if (result.success) setQuestionModules(result.data);
    } catch (error) {
      console.error('Error loading exam modules:', error);
    }
  };

  const loadExamQuestions = async (examIdParam) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/exam-management/exams/${examIdParam}/questions`);
      const result = await response.json();
      if (result.success) setQuestions(result.data);
    } catch (error) {
      console.error('Error loading exam questions:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleModuleTypeToggle = (moduleType) => {
    if (selectedModuleTypes.includes(moduleType)) {
      setSelectedModuleTypes(selectedModuleTypes.filter(t => t !== moduleType));
    } else {
      setSelectedModuleTypes([...selectedModuleTypes, moduleType]);
    }
  };

  const handleCreateModules = async () => {
    if (selectedModuleTypes.length === 0) {
      alert('Please select at least one module type');
      return;
    }

    try {
      setSaving(true);
      const payload = selectedModuleTypes.map((type, idx) => ({
        module_type: type,
        title: type,
        display_order: idx + 1
      }));

      const response = await fetch(`http://localhost:5000/api/exam-management/exams/${selectedExamId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: payload })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Failed to create modules');
      setQuestionModules(result.data);
    } catch (error) {
      console.error('Error creating modules:', error);
      alert('Failed to create modules');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.moduleId || !currentQuestion.questionText.trim()) {
      alert('Please select a module and enter question text');
      return;
    }

    const module = questionModules.find(m => m.id === currentQuestion.moduleId);
    const moduleType = module?.module_type || module?.title || '';

    let questionData = {};
    if (moduleType === 'MCQs') {
      const options = currentQuestion.mcqOptions.map(o => o.trim()).filter(Boolean);
      if (options.length < 2) {
        alert('Please add at least 2 MCQ options');
        return;
      }
      questionData = {
        options,
        correct_index: currentQuestion.mcqCorrectIndex,
        correct_answer: options[currentQuestion.mcqCorrectIndex] || ''
      };
    } else if (moduleType === 'Programming') {
      questionData = {
        reference_solution: currentQuestion.codingSolution.trim(),
        sample_input: currentQuestion.codingSampleInput.trim(),
        expected_output: currentQuestion.codingExpectedOutput.trim()
      };
    } else if (moduleType === 'Fill in the Blanks') {
      const answers = currentQuestion.blankAnswers
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);
      if (answers.length === 0) {
        alert('Please add at least one blank answer');
        return;
      }
      questionData = { answers };
    }

    const newQuestion = {
      id: `temp_${Date.now()}`,
      moduleId: currentQuestion.moduleId,
      questionText: currentQuestion.questionText,
      marks: currentQuestion.marks,
      difficulty: currentQuestion.difficulty,
      explanation: currentQuestion.explanation,
      questionData,
      displayOrder: questions.length + 1
    };

    setQuestions([...questions, newQuestion]);

    setCurrentQuestion({
      moduleId: '',
      questionText: '',
      marks: 1,
      difficulty: 'Medium',
      explanation: '',
      mcqOptions: ['', '', '', ''],
      mcqCorrectIndex: 0,
      codingSolution: '',
      codingSampleInput: '',
      codingExpectedOutput: '',
      blankAnswers: ''
    });
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSaveExam = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch(`http://localhost:5000/api/exam-management/exams/${selectedExamId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questions.map((q, idx) => ({
            module_id: q.moduleId || q.module_id,
            question_text: q.questionText || q.question_text,
            marks: q.marks,
            difficulty: q.difficulty,
            explanation: q.explanation,
            question_data: q.questionData || q.question_data || {},
            display_order: q.displayOrder || q.display_order || idx + 1
          }))
        })
      });
      
      if (!response.ok) throw new Error('Failed to save questions');
      
      const result = await response.json();
      
      await fetch(`http://localhost:5000/api/exam-management/exams/${selectedExamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Published' })
      });
      
      alert(`Exam created successfully with ${questions.length} questions!`);
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const getModuleName = (moduleId) => {
    const module = questionModules.find(m => String(m.id) === String(moduleId));
    return module ? (module.title || module.module_type) : 'Unknown';
  };

  const getModuleType = (moduleId) => {
    const module = questionModules.find(m => String(m.id) === String(moduleId));
    return module?.module_type || '';
  };

  const parseInlineMcq = (text) => {
    if (!text) return null;
    const optionRegex = /(?:^|\n|\r)\s*([A-D])\)\s*(.+)/g;
    const options = [];
    let match;
    while ((match = optionRegex.exec(text)) !== null) {
      options.push({ key: match[1], value: match[2].trim() });
    }
    const answerMatch = text.match(/Answer:\s*([A-D])/i);
    const answer = answerMatch ? answerMatch[1].toUpperCase() : null;
    return options.length ? { options, answer } : null;
  };

  const renderQuestionText = (question) => {
    const rawText = question.questionText || question.question_text || '';
    const moduleId = question.moduleId || question.module_id;
    const moduleType = getModuleType(moduleId);
    if (moduleType !== 'MCQs') return <span className="text-gray-800">{rawText}</span>;

    const parsed = parseInlineMcq(rawText);
    if (!parsed) return <span className="text-gray-800">{rawText}</span>;

    return (
      <div className="text-gray-800">
        <div className="mb-2">{rawText.split(/\n\r?|\r\n?/)[0]}</div>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          {parsed.options.map((opt) => (
            <li key={opt.key}>
              <span className="font-semibold">{opt.key})</span> {opt.value}
            </li>
          ))}
        </ul>
        {parsed.answer && (
          <div className="text-xs text-gray-600 mt-2">
            <strong>Answer:</strong> {parsed.answer}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Exam <span className="text-red-500">*</span></label>
          <select
            value={selectedExamId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedExamId(id);
              const found = exams.find(x => String(x.id) === String(id));
              setSelectedExamInfo({ title: found?.title || '', levelName: found?.level_name || '' });
              setQuestionModules([]);
              setQuestions([]);
              setSelectedModuleTypes([]);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Exam</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.title} ({exam.level_name || 'Level'})</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Questions</h1>
            <p className="text-gray-500">
              {selectedExamInfo.title ? `${selectedExamInfo.title} (${selectedExamInfo.levelName || ''})` : 'Select an exam'}
            </p>
          </div>
          <button
            onClick={() => setShowQuestionModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            NEW QUESTION
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Modules for This Exam</h3>

          {!selectedExamId ? (
            <div className="text-sm text-gray-500">Select an exam to configure modules.</div>
          ) : questionModules.length === 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {examTypes.map((type) => {
                  const isSelected = selectedModuleTypes.includes(type.name);
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleModuleTypeToggle(type.name)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{type.name}</h3>
                        {isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-600">Module for {type.name} questions</p>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleCreateModules}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating...' : 'Create Modules'}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {questionModules.map((module) => (
                <div
                  key={module.id}
                  className="p-4 border-2 rounded-lg border-blue-200 bg-blue-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{module.title || module.module_type}</h3>
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-600">{module.module_type}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">MODULE</label></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">QUESTION</label></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">MARKS</label></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">DIFFICULTY</label></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">ACTIONS</label></div>
          </div>

          {!selectedExamId ? (
            <div className="p-8 text-center text-gray-500">Select an exam to view questions</div>
          ) : questions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No questions added yet</div>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} className="grid grid-cols-5 gap-4 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <div>
                  <span className="text-sm font-medium text-gray-700">{getModuleName(question.moduleId || question.module_id)}</span>
                </div>
                <div>
                  {renderQuestionText(question)}
                </div>
                <div>
                  <span className="text-gray-700">{question.marks}</span>
                </div>
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{question.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleSaveExam}
            disabled={questions.length === 0 || saving}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
              questions.length > 0 && !saving
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save & Complete Exam
              </>
            )}
          </button>
        </div>
      </div>

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">New Question</h2>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Module <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentQuestion.moduleId}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, moduleId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Module</option>
                    {questionModules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.title || module.module_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={currentQuestion.marks}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={currentQuestion.difficulty}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={currentQuestion.questionText}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                  placeholder="Enter your question here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {getModuleType(currentQuestion.moduleId) === 'MCQs' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.mcqOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const next = [...currentQuestion.mcqOptions];
                          next[idx] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, mcqOptions: next });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Option</label>
                    <select
                      value={currentQuestion.mcqCorrectIndex}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, mcqCorrectIndex: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {currentQuestion.mcqOptions.map((_, idx) => (
                        <option key={idx} value={idx}>{`Option ${idx + 1}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {getModuleType(currentQuestion.moduleId) === 'Programming' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Solution</label>
                  <textarea
                    rows={3}
                    value={currentQuestion.codingSolution}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, codingSolution: e.target.value })}
                    placeholder="Provide a reference solution (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <input
                      type="text"
                      placeholder="Sample Input (optional)"
                      value={currentQuestion.codingSampleInput}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, codingSampleInput: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Expected Output (optional)"
                      value={currentQuestion.codingExpectedOutput}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, codingExpectedOutput: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {getModuleType(currentQuestion.moduleId) === 'Fill in the Blanks' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blank Answers</label>
                  <input
                    type="text"
                    placeholder="Comma separated answers (e.g., React, JSX)"
                    value={currentQuestion.blankAnswers}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, blankAnswers: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  rows={3}
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                  placeholder="Explain the correct answer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { handleAddQuestion(); setShowQuestionModal(false); }}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
