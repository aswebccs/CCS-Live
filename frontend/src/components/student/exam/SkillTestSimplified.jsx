import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronRight,
  Code,
  Cloud,
  Globe,
  Database,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Target,
  AlertCircle,
  FileCode,
  Coffee
} from 'lucide-react';

const SkillTestSimplified = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('categories'); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Icon mapping
  const iconMap = {
    code: Code,
    cloud: Cloud,
    globe: Globe,
    database: Database,
    coffee: Coffee,
    python: FileCode,
    javascript: FileCode
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/skill-tests/categories', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setLoading(false);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load categories. Please try again.');
      }
    }
  };

  const fetchLanguages = async (categoryId) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/skill-tests/categories/${categoryId}/languages`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      setLanguages(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch languages:', err);
      setLoading(false);
      setError('Failed to load languages. Please try again.');
    }
  };

  const fetchLevels = async (languageId) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/skill-tests/languages/${languageId}/levels`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      setLevels(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch levels:', err);
      setLoading(false);
      setError('Failed to load levels. Please try again.');
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    await fetchLanguages(category.id);
    setView('languages');
  };

  const handleLanguageClick = async (language) => {
    setSelectedLanguage(language);
    await fetchLevels(language.id);
    setView('levels');
  };

  const handleLevelClick = (level) => {
    if (!level.has_exam) {
      alert('This exam is coming soon!');
      return;
    }
    if (level.has_attempted) {
      alert('You have already attempted this exam');
      return;
    }
    navigate(`/student/skill-test/${level.test_id}`);
  };

  const handleBack = () => {
    if (view === 'levels') {
      setView('languages');
      setSelectedLanguage(null);
    } else if (view === 'languages') {
      setView('categories');
      setSelectedCategory(null);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'from-green-500 to-emerald-600',
      'Intermediate': 'from-blue-500 to-indigo-600',
      'Advanced': 'from-purple-500 to-pink-600',
      'Professional': 'from-orange-500 to-red-600'
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  const getLevelIcon = (level) => {
    const icons = {
      'Beginner': '🌱',
      'Intermediate': '⚡',
      'Advanced': '🚀',
      'Professional': '👑'
    };
    return icons[level] || '📚';
  };

  if (error) {
    return (
      <div className="min-h-screen  from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {!error.includes('Session expired') && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          )}
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
    <div className="min-h-screen bg-gray-100 from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header with Breadcrumb */}
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
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className={view === 'categories' ? 'font-bold text-blue-600' : 'cursor-pointer hover:text-blue-600'}>
              Categories
            </span>
            {view !== 'categories' && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className={view === 'languages' ? 'font-bold text-blue-600' : 'cursor-pointer hover:text-blue-600'}>
                  {selectedCategory?.name}
                </span>
              </>
            )}
            {view === 'levels' && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="font-bold text-blue-600">
                  {selectedLanguage?.name}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {view === 'categories' && 'Choose Your Category'}
            {view === 'languages' && `${selectedCategory?.name} Languages`}
            {view === 'levels' && `${selectedLanguage?.name} Skill Levels`}
          </h1>
          <p className="text-gray-600 text-lg">
            {view === 'categories' && 'Select a category to begin your assessment'}
            {view === 'languages' && 'Choose a programming language'}
            {view === 'levels' && 'Select your skill level and take the exam'}
          </p>
        </div>

        {/* CATEGORIES VIEW */}
        {view === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon] || Code;
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0  from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500"></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Languages</span>
                        <span className="font-bold text-blue-600">{category.language_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Tests</span>
                        <span className="font-bold text-blue-600">{category.total_tests}</span>
                      </div>
                      {category.completed_tests > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Completed</span>
                          <span className="font-bold text-green-600">{category.completed_tests}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LANGUAGES VIEW */}
        {view === 'languages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {languages.map((language, index) => {
              const IconComponent = iconMap[language.icon] || Code;
              return (
                <div
                  key={language.id}
                  onClick={() => handleLanguageClick(language)}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500"></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {language.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {language.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Levels Available</span>
                        <span className="font-bold text-blue-600">4</span>
                      </div>
                      {language.completed_count > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Completed</span>
                          <span className="font-bold text-green-600">{language.completed_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LEVELS VIEW (4 Level Cards) */}
        {view === 'levels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((level, index) => {
              const canAttempt = level.has_exam && !level.has_attempted;
              
              return (
                <div
                  key={index}
                  onClick={() => canAttempt && handleLevelClick(level)}
                  className={`group relative bg-white rounded-2xl shadow-lg transition-all duration-500 overflow-hidden ${
                    canAttempt ? 'hover:shadow-2xl cursor-pointer transform hover:-translate-y-2' : 'opacity-75 cursor-not-allowed'
                  }`}
                >
                  {/* Gradient Top Bar */}
                  <div className={`h-2 bg-gradient-to-r ${getLevelColor(level.level)}`}></div>
                  
                  {/* Status Badge */}
                  {level.has_attempted && (
                    <div className={`absolute top-4 right-4 ${
                      level.result_status === 'PASSED' ? 'bg-green-500' : 'bg-red-500'
                    } text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10`}>
                      {level.result_status === 'PASSED' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {level.result_status}
                    </div>
                  )}
                  {!level.has_exam && (
                    <div className="absolute top-4 right-4 bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                      Coming Soon
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-5xl">{getLevelIcon(level.level)}</span>
                      {canAttempt && <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {level.level}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedLanguage?.name} - {level.level} Level
                    </p>
                    
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

                    {/* Module Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>📝 MCQs</span>
                        <span className="font-semibold">{level.mcq_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>✏️ Fill Blanks</span>
                        <span className="font-semibold">{level.fill_blank_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💻 Programming</span>
                        <span className="font-semibold">{level.programming_count}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {canAttempt ? (
                      <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                        Take Exam
                      </button>
                    ) : level.has_attempted ? (
                      <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed">
                        Already Attempted
                      </button>
                    ) : (
                      <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed">
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
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