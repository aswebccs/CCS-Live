
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Home, TrendingUp, Target } from 'lucide-react';

const SkillTestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, totalQuestions, percentage, passed, testTitle } = location.state || {};

  // Redirect if no data
  if (score === undefined || score === null) {
    React.useEffect(() => {
      navigate('/student/skill-test');
    }, []);
    return null;
  }

  const percentageNum = parseFloat(percentage);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
      <div className="max-w-3xl w-full">

        {/* Result Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Score */}
          <div className="bg-blue-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-1">{testTitle}</h2>
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
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default SkillTestResult;