import React, { useState, useEffect, useContext } from 'react';
import { ChevronDown, ChevronUp, Star, AlertTriangle, Award, BarChart2, ArrowUp, ArrowDown, TrendingUp, Calendar, CheckCircle, Flag, Code, BookOpen, FileCheck } from 'lucide-react';
import { context } from '../context/Context';
import EmotionQuestionAnalysis from './EmotionGraph';

const TechFeedbackComponent = ({ allEmotion, setAllEmotion }) => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  const { email } = useContext(context);
  const userEmail = email || "harsh@gmail.com"; // Fallback email if context doesn't provide one

  useEffect(() => {
    const fetchFeedback = async () => {
      if (email) {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:5000/api/tech_feedback/${userEmail}`);
          if (!response.ok) throw new Error('Failed to fetch feedback data');
          const data = await response.json();
          // Filter out items where verified is not true
          const verifiedFeedback = (data.feedback || []).filter(item => item.verified === true);
          setFeedbackData(verifiedFeedback);
          if(data.emotion){
            setAllEmotion(data.emotion)
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFeedback();
  }, [email, userEmail]);

  const toggleExpand = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Normalize score to a scale of 10
  const normalizeScore = (score) => {
    return Math.round((score / 100) * 10);
  };

  const sortedFeedback = [...feedbackData].sort((a, b) => {
    if (sortConfig.key === 'score') {
      return sortConfig.direction === 'asc' ? a.score - b.score : b.score - a.score;
    }
    if (sortConfig.key === 'timestamp') {
      const dateA = new Date(typeof a.timestamp === 'object' ? a.timestamp.$date : a.timestamp);
      const dateB = new Date(typeof b.timestamp === 'object' ? b.timestamp.$date : b.timestamp);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(typeof dateString === 'object' ? dateString.$date : dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getScoreColor = (score) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore >= 8) return 'text-green-600 bg-green-50';
    if (normalizedScore >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadgeColor = (score) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore >= 8) return 'bg-green-100 text-green-800';
    if (normalizedScore >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const calculateAverageScore = () => {
    if (!feedbackData.length) return 0;
    const sum = feedbackData.reduce((acc, item) => acc + normalizeScore(item.score), 0);
    return (sum / feedbackData.length).toFixed(1);
  };

  const getHighestScoreQuestion = () => {
    if (!feedbackData.length) return null;
    return feedbackData.reduce((max, item) => item.score > max.score ? item : max, feedbackData[0]);
  };

  const getProgressTrend = () => {
    if (feedbackData.length < 3) return 'neutral';

    const recentScores = [...feedbackData]
      .sort((a, b) => {
        const dateA = new Date(typeof a.timestamp === 'object' ? a.timestamp.$date : a.timestamp);
        const dateB = new Date(typeof b.timestamp === 'object' ? b.timestamp.$date : b.timestamp);
        return dateB - dateA;
      })
      .slice(0, 3)
      .map(item => normalizeScore(item.score));

    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const overallAvg = parseFloat(calculateAverageScore());

    return recentAvg > overallAvg ? 'improving' : recentAvg < overallAvg ? 'declining' : 'neutral';
  };

  // Format feedback array for display
  const formatFeedbackArray = (feedbackArray) => {
    if (!feedbackArray || !Array.isArray(feedbackArray)) return "";
    return feedbackArray.join("\n");
  };

  // Check if question is a coding question
  const isCodingQuestion = (item) => {
    return !!item.code_solution;
  };

  // Format code with proper indentation
  const formatCode = (code) => {
    if (!code) return "";
    return code.trim();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-lg font-medium text-gray-600">Loading feedback...</div>;
  if (error) return <div className="p-4 bg-red-100 border border-red-400 rounded-md text-red-700">Error: {error}</div>;
  if (!feedbackData.length) return <div className="p-8 text-center bg-gray-50 rounded-lg text-lg text-gray-600">No verified feedback available yet. Start practicing!</div>;

  const bestQuestion = getHighestScoreQuestion();
  const progressTrend = getProgressTrend();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">HR Interview Feedback Dashboard</h1>
        <span className="px-4 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
          {feedbackData.length} Verified Responses
        </span>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-600">Average Score</h3>
            <Star size={24} className={`${parseFloat(calculateAverageScore()) >= 8 ? 'text-green-500' : parseFloat(calculateAverageScore()) >= 6 ? 'text-yellow-500' : 'text-red-500'}`} />
          </div>
          <p className={`mt-4 text-5xl font-extrabold ${parseFloat(calculateAverageScore()) >= 8 ? 'text-green-600' : parseFloat(calculateAverageScore()) >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
            {calculateAverageScore()}<span className="text-xl text-gray-400">/10</span>
          </p>
          <div className="mt-3 text-sm font-medium">
            {progressTrend === 'improving' && <span className="text-green-600 flex items-center"><TrendingUp size={16} className="mr-1" /> Improving</span>}
            {progressTrend === 'declining' && <span className="text-red-600 flex items-center"><ArrowDown size={16} className="mr-1" /> Declining</span>}
            {progressTrend === 'neutral' && <span className="text-gray-500">Stable</span>}
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-600">Top Performance</h3>
            <Award size={24} className="text-green-500" />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-800 truncate" title={bestQuestion?.question}>{bestQuestion?.question || 'N/A'}</p>
          <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(bestQuestion?.score || 0)}`}>
            {normalizeScore(bestQuestion?.score || 0)}/10
          </span>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-600">Last Practice</h3>
            <Calendar size={24} className="text-blue-500" />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-800">{feedbackData.length ? formatDate(sortedFeedback[0].timestamp) : 'N/A'}</p>
          <p className="mt-2 text-sm text-gray-500 truncate">{feedbackData.length ? sortedFeedback[0].question : ''}</p>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Feedback History</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button onClick={() => handleSort('timestamp')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${sortConfig.key === 'timestamp' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Date {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? <ArrowUp size={16} className="inline ml-1" /> : <ArrowDown size={16} className="inline ml-1" />)}
          </button>
          <button onClick={() => handleSort('score')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${sortConfig.key === 'score' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Score {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? <ArrowUp size={16} className="inline ml-1" /> : <ArrowDown size={16} className="inline ml-1" />)}
          </button>
        </div>
      </div>

      {/* Feedback Items */}
      <div className="space-y-6">
        {sortedFeedback.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => toggleExpand(index)}>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                  {isCodingQuestion(item) && (
                    <span className="ml-3 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-md flex items-center">
                      <Code size={14} className="mr-1" /> Coding
                    </span>
                  )}
                  {item.difficulty && (
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-md flex items-center
                      ${item.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                        item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {item.difficulty}
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Calendar size={16} className="mr-2" /> {formatDate(item.timestamp)}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 text-lg font-bold rounded-lg ${getScoreColor(item.score)}`}>
                  {normalizeScore(item.score)}/10
                </span>
                {expandedQuestion === index ? <ChevronUp size={24} className="text-gray-600" /> : <ChevronDown size={24} className="text-gray-600" />}
              </div>
            </div>

            {expandedQuestion === index && (
              <div className="p-5 border-t border-gray-200">
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Answer</h4>
                  <p className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200">{item.user_answer}</p>
                </div>

                {isCodingQuestion(item) && (
                  <div className="mb-5">
                    <h4 className="flex items-center text-sm font-semibold text-indigo-700 mb-2">
                      <Code size={16} className="mr-2" /> Your Code Solution
                    </h4>
                    <div className="p-4 bg-gray-900 rounded-lg text-sm text-gray-100 border border-gray-700 font-mono whitespace-pre overflow-x-auto">
                      {formatCode(item.code_solution)}
                    </div>
                  </div>
                )}

                {item.ideal_answer && (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Ideal Answer</h4>
                    <p className="p-4 bg-green-50 rounded-lg text-sm text-gray-800 border border-green-200">{item.ideal_answer}</p>
                  </div>
                )}

                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Feedback</h4>
                  <p className="p-4 bg-blue-50 rounded-lg text-sm text-gray-800 border border-blue-200 whitespace-pre-line">{formatFeedbackArray(item.technical_feedback)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {item.strengths?.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="flex items-center text-sm font-semibold text-green-700 mb-3"><CheckCircle size={16} className="mr-2" /> Strengths</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {item.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start"><span className="w-5 h-5 mr-2 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs">{i + 1}</span>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.improvement_areas?.length > 0 && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="flex items-center text-sm font-semibold text-amber-700 mb-3"><AlertTriangle size={16} className="mr-2" /> Improvement Areas</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {item.improvement_areas.map((area, i) => (
                          <li key={i} className="flex items-start"><span className="w-5 h-5 mr-2 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs">{i + 1}</span>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.matching_concepts?.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="flex items-center text-sm font-semibold text-blue-700 mb-3"><CheckCircle size={16} className="mr-2" /> Matching Points</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {item.matching_concepts.map((point, i) => (
                          <li key={i} className="flex items-start"><span className="w-5 h-5 mr-2 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs">{i + 1}</span>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.missing_concepts?.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="flex items-center text-sm font-semibold text-red-700 mb-3"><AlertTriangle size={16} className="mr-2" /> Missing Points</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {item.missing_concepts.map((point, i) => (
                          <li key={i} className="flex items-start"><span className="w-5 h-5 mr-2 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-xs">{i + 1}</span>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.misconceptions?.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="flex items-center text-sm font-semibold text-orange-700 mb-3">
                        <AlertTriangle size={16} className="mr-2" /> Misconceptions
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {item.misconceptions.map((point, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-5 h-5 mr-2 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-xs">{i + 1}</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.red_flags_triggered?.length > 0 && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="flex items-center text-sm font-semibold text-purple-700 mb-3"><Flag size={16} className="mr-2" /> Red Flags</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {item.red_flags_triggered.map((flag, i) => (
                          <li key={i} className="flex items-start"><span className="w-5 h-5 mr-2 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs">{i + 1}</span>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {item.learning_resources?.length > 0 && (
                  <div className="mt-5 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <h4 className="flex items-center text-sm font-semibold text-teal-700 mb-3">
                      <BookOpen size={16} className="mr-2" /> Learning Resources
                    </h4>
                    <ul className="space-y-2 text-sm text-teal-800">
                      {item.learning_resources.map((resource, i) => (
                        <li key={i} className="flex items-start">
                          <span className="w-5 h-5 mr-2 bg-teal-200 text-teal-800 rounded-full flex items-center justify-center text-xs">{i + 1}</span>
                          <a href={resource} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {resource}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {item.overAllEmotion && item.overAllEmotion.length > 0 && <EmotionQuestionAnalysis emotion={item.overAllEmotion} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechFeedbackComponent;