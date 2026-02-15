
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const Exams = ({ onNext }) => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    level_id: '',
    category_id: '',
    subcategory_id: '',
    language: '',
    exam_type: '',
    duration_minutes: 60,
    passing_score: 70,
    total_marks: 100,
    description: '',
    isActive: true
  });

  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);
  const modalRef = useRef(null);
  const shownAlertsRef = useRef(new Set());

  const getAuthHeaders = (includeJson = false) => {
    const token = localStorage.getItem('token');
    return {
      ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    loadAllData();
    loadExams();
  }, [searchCode, searchTitle, filterStatus, page, rowsPerPage]);

  useEffect(() => {
    if (editingExam) {
      setFormData({
        title: editingExam.title || '',
        level_id: editingExam.level_id || '',
        category_id: editingExam.category_id || '',
        subcategory_id: editingExam.subcategory_id || '',
        language: editingExam.language || '',
        exam_type: editingExam.exam_type || '',
        duration_minutes: editingExam.duration_minutes || 60,
        passing_score: editingExam.passing_score || 70,
        total_marks: editingExam.total_marks || 100,
        description: editingExam.description || '',
        isActive: editingExam.is_active ?? true
      });
      if (editingExam.category_id) loadSubcategoriesForCategory(editingExam.category_id);
    } else {
      setFormData({
        title: '', level_id: '', category_id: '', subcategory_id: '', language: '', exam_type: '',
        duration_minutes: 60, passing_score: 70, total_marks: 100,
        description: '', isActive: true
      });
    }
  }, [editingExam]);

  useEffect(() => {
    if (showModal && editorRef.current) {
      editorRef.current.innerHTML = formData.description || '';
    }
  }, [showModal, editingExam]);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key !== 'Backspace') return;
      const target = document.activeElement;
      const isEditable = target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';
      const inModal = modalRef.current?.contains(target);
      if (isEditable && inModal) return;
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showModal]);

  const loadAllData = async () => {
    try {
      const [catRes, lvlRes, typeRes] = await Promise.all([
        fetch('http://localhost:5000/api/exam-management/categories'),
        fetch('http://localhost:5000/api/exam-management/levels'),
        fetch('http://localhost:5000/api/exam-management/exam-types')
      ]);

      const catData = await catRes.json();
      const lvlData = await lvlRes.json();
      const typeData = await typeRes.json();
      if (catData.success) setCategories(catData.data);
      if (lvlData.success) setLevels(lvlData.data);
      if (typeData.success) setExamTypes(typeData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSubcategoriesForCategory = async (categoryId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/exam-management/subcategories?category_id=${categoryId}`);
      const result = await res.json();
      if (result.success) setSubcategories(result.data);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: rowsPerPage,
        ...(searchCode && { search_code: searchCode }),
        ...(searchTitle && { search_title: searchTitle }),
        ...(filterStatus && { status: filterStatus })
      });

      const res = await fetch(`http://localhost:5000/api/exam-management/exams?${params}`);
      const result = await res.json();

      if (result.success) {
        setExams(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      showAlertOnce('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({ ...formData, category_id: categoryId, subcategory_id: '', language: '' });
    setSubcategories([]);
    if (categoryId) loadSubcategoriesForCategory(categoryId);
  };

  const handleSubcategoryChange = (subcategoryId) => {
    setFormData({ ...formData, subcategory_id: subcategoryId, language: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      showAlertOnce('Exam title is required');
      return;
    }
    if (!formData.category_id || !formData.subcategory_id || !formData.language || !formData.level_id || !formData.exam_type) {
      showAlertOnce('Please fill all required fields');
      return;
    }
    if (!Number.isFinite(Number(formData.duration_minutes)) || Number(formData.duration_minutes) <= 0) {
      showAlertOnce('Duration must be greater than 0');
      return;
    }
    if (!Number.isFinite(Number(formData.passing_score)) || Number(formData.passing_score) < 0 || Number(formData.passing_score) > 100) {
      showAlertOnce('Passing score must be between 0 and 100');
      return;
    }
    if (!Number.isFinite(Number(formData.total_marks)) || Number(formData.total_marks) <= 0) {
      showAlertOnce('Total marks must be greater than 0');
      return;
    }
    setSaving(true);

    try {
      const url = editingExam
        ? `http://localhost:5000/api/exam-management/exams/${editingExam.id}`
        : 'http://localhost:5000/api/exam-management/exams';

      const res = await fetch(url, {
        method: editingExam ? 'PUT' : 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          title: trimmedTitle,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id,
          language: formData.language,
          level_id: formData.level_id,
          exam_type: formData.exam_type,
          duration_minutes: formData.duration_minutes,
          passing_score: formData.passing_score,
          total_marks: formData.total_marks,
          description: formData.description,
          is_active: formData.isActive
        })
      });

      const result = await res.json();

      if (result.success) {
        setShowModal(false);
        setEditingExam(null);
        loadExams();
        showAlertOnce(result.message || (editingExam ? 'Exam updated' : 'Exam created'));
        if (!editingExam && onNext && result.data) {
          const levelName = levels.find(l => String(l.id) === String(result.data.level_id))?.name || '';
          onNext({ examId: result.data.id, examTitle: result.data.title, levelName });
        }
      } else {
        showAlertOnce(result.message);
      }
    } catch (error) {
      showAlertOnce('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
    const res = await fetch(`http://localhost:5000/api/exam-management/exams/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const result = await res.json();
      if (result.success) {
        loadExams();
        showAlertOnce(result.message);
      } else {
        showAlertOnce(result.message);
      }
    } catch (error) {
      showAlertOnce('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
    const res = await fetch(`http://localhost:5000/api/exam-management/exams/${id}/toggle`, { method: 'PATCH', headers: getAuthHeaders() });
      const result = await res.json();
      if (result.success) loadExams();
    } catch (error) {
      showAlertOnce('Toggle failed');
    }
  };

  const handleGoToQuestions = (exam) => {
    const levelName = levels.find(l => String(l.id) === String(exam.level_id))?.name || '';
    if (onNext) {
      onNext({ examId: exam.id, examTitle: exam.title, levelName });
      return;
    }
    const params = new URLSearchParams({
      examId: String(exam.id),
      examTitle: exam.title || '',
      levelName: levelName || '',
    });
    navigate(`/admin/exam-management/questions?${params.toString()}`);
  };

  const handleRowAction = (exam, action) => {
    if (action === 'manage_questions') {
      handleGoToQuestions(exam);
      return;
    }
    if (action === 'manage_question_types') {
      navigate('/admin/exam-management/question-types');
      return;
    }
    if (action === 'edit') {
      setEditingExam(exam);
      setShowModal(true);
      return;
    }
    if (action === 'toggle') {
      handleToggle(exam.id);
      return;
    }
    if (action === 'delete') {
      handleDelete(exam.id);
    }
  };

  const applyFormat = (command) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, null);
    setFormData((prev) => ({ ...prev, description: editorRef.current.innerHTML }));
  };

  const showAlertOnce = (message) => {
    if (shownAlertsRef.current.has(message)) return;
    shownAlertsRef.current.add(message);
    alert(message);
    setTimeout(() => shownAlertsRef.current.delete(message), 3000);
  };

  const getStatusBadgeClass = (isActive) => (
    isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Exams</h1>
          <button
            onClick={() => { setEditingExam(null); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            NEW EXAM
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="min-w-[1240px]">
          <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr_240px] gap-4 p-4 border-b border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">CODE</label>
              <input
                type="text"
                placeholder="Search Code"
                value={searchCode}
                onChange={(e) => { setSearchCode(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">TITLE</label>
              <input
                type="text"
                placeholder="Search Title"
                value={searchTitle}
                onChange={(e) => { setSearchTitle(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">CATEGORY</label></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">SUBCATEGORY</label></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">LEVEL</label></div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">STATUS</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">ACTIONS</label></div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No exams found</div>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr_240px] gap-4 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <div>
                  <button
                    onClick={() => handleGoToQuestions(exam)}
                    className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600"
                    title="Add questions for this exam"
                  >
                    {exam.code}
                  </button>
                </div>
                <div><span className="font-medium text-gray-800">{exam.title}</span></div>
                <div><span className="text-gray-700">{exam.category_name}</span></div>
                <div><span className="text-gray-700">{exam.subcategory_name}</span></div>
                <div><span className="text-gray-700">{exam.level_name}</span></div>
                <div>
                  <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium ${getStatusBadgeClass(exam.is_active)}`}>
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-end">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      handleRowAction(exam, e.target.value);
                      e.target.value = '';
                    }}
                    className="w-full max-w-[230px] px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Actions</option>
                    <option value="manage_questions">Manage Questions</option>
                    <option value="manage_question_types">Question Types</option>
                    <option value="edit">Edit</option>
                    <option value="toggle">{exam.is_active ? 'Make Inactive' : 'Make Active'}</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>
              </div>
            ))
          )}

          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">ROWS PER PAGE:</span>
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(1); }} className="px-3 py-1.5 border border-gray-300 rounded text-sm">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">PAGE</span>
              <input type="number" value={page} onChange={(e) => { const p = parseInt(e.target.value); if (p >= 1 && p <= totalPages) setPage(p); }}
                min="1" max={totalPages} className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center" />
              <span className="text-sm text-gray-600 font-medium">OF {totalPages}</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div ref={modalRef} className="bg-white w-full max-w-4xl rounded-lg my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">{editingExam ? 'Edit Exam' : 'New Exam'}</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Exam Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Java Beginner Exam" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Category <span className="text-red-500">*</span></label>
                  <select required value={formData.category_id} onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Subcategory <span className="text-red-500">*</span></label>
                  <select required value={formData.subcategory_id} onChange={(e) => handleSubcategoryChange(e.target.value)}
                    disabled={!formData.category_id} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Subcategory</option>
                    {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Language <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Language</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Level <span className="text-red-500">*</span></label>
                  <select required value={formData.level_id} onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Level</option>
                    {levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Exam Type <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.exam_type}
                    onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map((type) => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Duration (minutes) <span className="text-red-500">*</span></label>
                  <input type="number" required min="1" value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Passing Score (%)</label>
                  <input type="number" min="0" max="100" value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Total Marks</label>
                  <input type="number" min="1" value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>


                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Active</label>
                      <p className="text-sm text-gray-500">Active (Shown Everywhere). In-active (Hidden Everywhere).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-400">
                  {saving ? 'Saving...' : editingExam ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;

