import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const SkillTestSimplified = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedExamGroup, setSelectedExamGroup] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [examGroups, setExamGroups] = useState([]);
  const [levels, setLevels] = useState([]);
  const [allExams, setAllExams] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    setSearchQuery('');
  }, [view]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      const [catRes, examRes] = await Promise.all([
        fetch('http://localhost:5000/api/exam-management/categories?page=1&limit=500&status=active'),
        fetch('http://localhost:5000/api/exam-management/exams?page=1&limit=1000&status=active')
      ]);

      const catResult = await catRes.json();
      const examResult = await examRes.json();

      if (!catResult.success) throw new Error('Failed to load categories');
      if (!examResult.success) throw new Error('Failed to load exams');

      const exams = examResult.data || [];
      setAllExams(exams);

      const categoriesWithStats = (catResult.data || []).map((c) => {
        const catExams = exams.filter((e) => String(e.category_id) === String(c.id));
        const subcategorySet = new Set(catExams.map((e) => e.subcategory_id).filter(Boolean));
        return {
          id: c.id,
          name: c.name,
          description: c.short_description || c.description || '',
          subcategory_count: subcategorySet.size,
          total_tests: catExams.length
        };
      });

      setCategories(categoriesWithStats);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      setLoading(true);
      setError('');

      const subRes = await fetch(
        `http://localhost:5000/api/exam-management/subcategories?page=1&limit=500&status=active&category_id=${categoryId}`
      );
      const subResult = await subRes.json();

      if (!subResult.success) throw new Error('Failed to load subcategories');

      const subs = subResult.data || [];
      const mapped = subs.map((s) => {
        const subExams = allExams.filter((e) => String(e.subcategory_id) === String(s.id));
        const distinctExamTitles = new Set(subExams.map((e) => (e.title || '').trim()).filter(Boolean));
        return {
          id: s.id,
          name: s.name,
          description: s.short_description || '',
          exam_count: distinctExamTitles.size
        };
      });

      setSubcategories(mapped);
    } catch (err) {
      setError('Failed to load subcategories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamGroups = async (subcategoryId) => {
    setLoading(true);
    setError('');

    try {
      const filtered = allExams.filter(
        (e) =>
          String(e.category_id) === String(selectedCategory?.id) &&
          String(e.subcategory_id) === String(subcategoryId)
      );

      const groupsMap = new Map();
      filtered.forEach((exam) => {
        const key = (exam.title || '').trim().toLowerCase();
        if (!key) return;

        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            key,
            title: exam.title,
            exams: []
          });
        }

        groupsMap.get(key).exams.push(exam);
      });

      const grouped = Array.from(groupsMap.values()).map((g) => ({
        ...g,
        levels_available: g.exams.length
      }));

      setExamGroups(grouped);
    } catch (err) {
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async (subcategoryId, examGroupKey) => {
    try {
      setLoading(true);
      setError('');

      const levelsRes = await fetch('http://localhost:5000/api/exam-management/levels');
      const levelsResult = await levelsRes.json();

      if (!levelsResult.success) throw new Error('Failed to load levels');

      const levelMaster = levelsResult.data || [];
      const filtered = allExams.filter(
        (e) =>
          String(e.category_id) === String(selectedCategory?.id) &&
          String(e.subcategory_id) === String(subcategoryId) &&
          String((e.title || '').trim().toLowerCase()) === String(examGroupKey)
      );

      const mappedLevels = await Promise.all(
        levelMaster.map(async (level) => {
          const exam = filtered.find((e) => Number(e.level_id) === Number(level.id));
          let hasAttempted = false;
          let resultStatus = null;

          if (exam?.id) {
            try {
              const statusRes = await fetch(
                `http://localhost:5000/api/exam-management/exams/${exam.id}/attempt-status`,
                { headers: getAuthHeaders() }
              );
              const statusJson = await statusRes.json();
              hasAttempted = Boolean(statusJson?.data?.has_attempted);
              resultStatus = statusJson?.data?.result_status || null;
            } catch (statusErr) {
              hasAttempted = false;
              resultStatus = null;
            }
          }

          return {
            level: level.name,
            has_exam: Boolean(exam),
            has_attempted: hasAttempted,
            result_status: resultStatus,
            test_id: exam?.id || null,
            duration_minutes: exam?.duration_minutes || 60,
            total_questions: exam?.total_marks || 0,
            passing_percentage: Number(exam?.passing_score || 70)
          };
        })
      );

      setLevels(mappedLevels);
    } catch (err) {
      setError('Failed to load levels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedExamGroup(null);
    await fetchSubcategories(category.id);
    setView('subcategories');
  };

  const handleSubcategoryClick = async (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedExamGroup(null);
    await fetchExamGroups(subcategory.id);
    setView('exams');
  };

  const handleExamClick = async (group) => {
    setSelectedExamGroup(group);
    await fetchLevels(selectedSubcategory.id, group.key);
    setView('levels');
  };

  const handleLevelClick = (level) => {
    if (!level.has_exam) {
      alert('This exam is coming soon!');
      return;
    }
    navigate(`/student/skill-test/${level.test_id}`);
  };

  const handleBack = () => {
    if (view === 'levels') {
      setView('exams');
      setLevels([]);
    } else if (view === 'exams') {
      setView('subcategories');
      setSelectedExamGroup(null);
    } else if (view === 'subcategories') {
      setView('categories');
      setSelectedSubcategory(null);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      Beginner: 'from-green-500 to-emerald-600',
      Intermediate: 'from-blue-500 to-indigo-600',
      Advanced: 'from-purple-500 to-pink-600',
      Professional: 'from-orange-500 to-red-600'
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredCategories = categories.filter((item) => {
    if (!query) return true;
    return String(item.name || '').toLowerCase().includes(query) || String(item.description || '').toLowerCase().includes(query);
  });

  const filteredSubcategories = subcategories.filter((item) => {
    if (!query) return true;
    return String(item.name || '').toLowerCase().includes(query) || String(item.description || '').toLowerCase().includes(query);
  });

  const filteredExamGroups = examGroups.filter((item) => {
    if (!query) return true;
    return String(item.title || '').toLowerCase().includes(query);
  });

  const filteredLevels = levels;

  if (error) {
    return (
      <div className="min-h-screen from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
        </div>
      </div>
    );
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading skill tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          {view !== 'categories' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 font-semibold mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}

          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {view === 'categories' && 'Choose Your Category'}
            {view === 'subcategories' && `${formatDisplayName(selectedCategory?.name)} Subcategories`}
            {view === 'exams' && `${formatDisplayName(selectedSubcategory?.name)} Exams`}
            {view === 'levels' && `${formatDisplayName(selectedExamGroup?.title)} Levels`}
          </h1>
          <p className="text-gray-600 text-lg">
            {view === 'categories' && 'Select a category to begin your assessment'}
            {view === 'subcategories' && 'Choose a subcategory'}
            {view === 'exams' && 'Choose an exam'}
            {view === 'levels' && 'Select your level and take the exam'}
          </p>

          {view !== 'levels' && (
            <div className="mt-4">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  view === 'categories'
                    ? 'Search categories...'
                    : view === 'subcategories'
                    ? 'Search subcategories...'
                    : 'Search exams...'
                }
                className="w-full md:w-96 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {view === 'categories' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <div key={category.id} onClick={() => handleCategoryClick(category)} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2">
                  <div className="relative p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{formatDisplayName(category.name)}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">{category.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Subcategories</span>
                        <span className="font-bold text-blue-600">{category.subcategory_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Tests</span>
                        <span className="font-bold text-blue-600">{category.total_tests}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!filteredCategories.length && <div className="mt-6 text-gray-500">No categories found.</div>}
          </>
        )}

        {view === 'subcategories' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubcategories.map((subcategory) => (
                <div key={subcategory.id} onClick={() => handleSubcategoryClick(subcategory)} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2">
                  <div className="relative p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{formatDisplayName(subcategory.name)}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{subcategory.description}</p>
                    <div className="text-sm text-gray-600">Exams: <span className="font-bold text-blue-600">{subcategory.exam_count}</span></div>
                  </div>
                </div>
              ))}
            </div>
            {!filteredSubcategories.length && <div className="mt-6 text-gray-500">No subcategories found.</div>}
          </>
        )}

        {view === 'exams' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExamGroups.map((group) => (
                <div key={group.key} onClick={() => handleExamClick(group)} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2">
                  <div className="relative p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{formatDisplayName(group.title)}</h3>
                    <p className="text-sm text-gray-600">Levels Available: <span className="font-bold text-blue-600">{group.levels_available}</span></p>
                  </div>
                </div>
              ))}
            </div>
            {!filteredExamGroups.length && <div className="mt-6 text-gray-500">No exams found.</div>}
          </>
        )}

        {view === 'levels' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredLevels.map((level, index) => {
                const canAttempt = level.has_exam && !level.has_attempted;
                return (
                  <div key={index} onClick={() => canAttempt && handleLevelClick(level)} className={`group relative bg-white rounded-2xl shadow-lg transition-all duration-500 overflow-hidden ${canAttempt ? 'hover:shadow-2xl cursor-pointer transform hover:-translate-y-2' : 'opacity-75 cursor-not-allowed'}`}>
                    <div className={`h-2 bg-gradient-to-r ${getLevelColor(level.level)}`}></div>

                    {level.has_attempted && (
                      <div className={`absolute top-4 right-4 ${level.result_status === 'PASSED' ? 'bg-green-500' : 'bg-red-500'} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10`}>
                        {level.result_status === 'PASSED' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {level.result_status}
                      </div>
                    )}

                    {!level.has_exam && (
                      <div className="absolute top-4 right-4 bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">Coming Soon</div>
                    )}

                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{level.level}</h3>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-semibold">{level.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Questions</span>
                          <span className="font-semibold">{level.total_questions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Pass %</span>
                          <span className="font-semibold">{level.passing_percentage}%</span>
                        </div>
                      </div>

                      {canAttempt ? (
                        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">Take Exam</button>
                      ) : level.has_attempted ? (
                        <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed">Already Attempted</button>
                      ) : (
                        <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed">Coming Soon</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {!filteredLevels.length && <div className="mt-6 text-gray-500">No levels found.</div>}
          </>
        )}
      </div>

      {loading && categories.length > 0 && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTestSimplified;
