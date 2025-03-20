import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Star, AlertTriangle, Award, BarChart2, ArrowUp, ArrowDown, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

const InterviewFeedbackDashboard = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  
  const userEmail = "harsh@gmail.com"; // This would come from your auth system

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/user_feedback/${userEmail}`);

        if (!response.ok) {
          throw new Error('Failed to fetch feedback data');
        }

        const data = await response.json();

        // Extract HR questions from the response
        const hrQuestions = data.feedback || [];
        setFeedbackData(hrQuestions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [userEmail]);

  const toggleExpand = (index) => {
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(index);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedFeedback = [...feedbackData].sort((a, b) => {
    if (sortConfig.key === 'score') {
      return sortConfig.direction === 'asc'
        ? a.score - b.score
        : b.score - a.score;
    }

    if (sortConfig.key === 'timestamp') {
      const dateA = new Date(typeof a.timestamp === 'object' && a.timestamp.$date ? a.timestamp.$date : a.timestamp);
      const dateB = new Date(typeof b.timestamp === 'object' && b.timestamp.$date ? b.timestamp.$date : b.timestamp);
      return sortConfig.direction === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    }

    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(typeof dateString === 'object' && dateString.$date ? dateString.$date : dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const calculateAverageScore = () => {
    if (!feedbackData.length) return 0;
    return (feedbackData.reduce((sum, item) => sum + item.score, 0) / feedbackData.length).toFixed(1);
  };

  const getHighestScoreQuestion = () => {
    if (!feedbackData.length) return null;
    return feedbackData.reduce((highest, item) => 
      item.score > highest.score ? item : highest, feedbackData[0]);
  };

  const getProgressTrend = () => {
    if (feedbackData.length < 3) return 'neutral';
    
    const recentScores = [...feedbackData]
      .sort((a, b) => {
        const dateA = new Date(typeof a.timestamp === 'object' && a.timestamp.$date ? a.timestamp.$date : a.timestamp);
        const dateB = new Date(typeof b.timestamp === 'object' && b.timestamp.$date ? b.timestamp.$date : b.timestamp);
        return dateB - dateA;
      })
      .slice(0, 3)
      .map(item => item.score);
    
    const average = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const previousAverage = calculateAverageScore();
    
    if (average > previousAverage) return 'improving';
    if (average < previousAverage) return 'declining';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-medium text-gray-600">Loading feedback data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded-md">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  if (!feedbackData.length) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-600">No interview feedback available yet. Complete some practice questions to see your results!</p>
      </div>
    );
  }

  const bestQuestion = getHighestScoreQuestion();
  const progressTrend = getProgressTrend();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Interview Feedback Dashboard</h1>
        <div className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
          {feedbackData.length} Questions Answered
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-md transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Average Performance</h3>
            <div className={`p-2 rounded-full ${
              calculateAverageScore() >= 8 ? 'bg-green-100' : 
              calculateAverageScore() >= 6 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Star size={20} className={
                calculateAverageScore() >= 8 ? 'text-green-500' : 
                calculateAverageScore() >= 6 ? 'text-yellow-500' : 'text-red-500'
              } />
            </div>
          </div>
          <p className={`mt-3 text-4xl font-bold ${
            calculateAverageScore() >= 8 ? 'text-green-600' : 
            calculateAverageScore() >= 6 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {calculateAverageScore()}
            <span className="text-lg font-medium text-gray-400">/10</span>
          </p>
          <div className="flex items-center mt-2">
            {progressTrend === 'improving' && (
              <div className="flex items-center text-green-600">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-xs font-medium">Improving</span>
              </div>
            )}
            {progressTrend === 'declining' && (
              <div className="flex items-center text-red-600">
                <ArrowDown size={16} className="mr-1" />
                <span className="text-xs font-medium">Declining</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Best Performance</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <Award size={20} className="text-green-500" />
            </div>
          </div>
          <p className="mt-3 text-lg font-medium text-gray-800 line-clamp-1" title={bestQuestion?.question}>
            {bestQuestion?.question || 'N/A'}
          </p>
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeColor(bestQuestion?.score || 0)}`}>
              Score: {bestQuestion?.score || 0}/10
            </span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Latest Practice</h3>
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="mt-3 text-lg font-medium text-gray-800">
            {feedbackData.length > 0 ? formatDate(sortedFeedback[0].timestamp) : 'N/A'}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-gray-500">
              {feedbackData.length > 0 ? 
                `Question: ${sortedFeedback[0].question.length > 30 ? 
                  sortedFeedback[0].question.substring(0, 30) + '...' : 
                  sortedFeedback[0].question}` : 
                ''}
            </span>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Feedback History</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <button
            onClick={() => handleSort('timestamp')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortConfig.key === 'timestamp' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Date
            {sortConfig.key === 'timestamp' && (
              sortConfig.direction === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
            )}
          </button>

          <button
            onClick={() => handleSort('score')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              sortConfig.key === 'score' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Score
            {sortConfig.key === 'score' && (
              sortConfig.direction === 'asc' ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Feedback Items */}
      <div className="space-y-4">
        {sortedFeedback.map((item, index) => (
          <div key={index} className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm transition-all hover:shadow-md">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex-1 mr-4">
                <h3 className="mb-1 text-lg font-medium text-gray-800">{item.question}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(item.timestamp)}</span>
                </div>
              </div>

              <div className="flex items-center">
                <div className={`px-3 py-1 mr-4 text-lg font-bold rounded-md ${getScoreColor(item.score)}`}>
                  {item.score}/10
                </div>
                {expandedQuestion === index ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </div>
            </div>

            {expandedQuestion === index && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="py-3">
                  <h4 className="mb-2 text-sm font-medium text-gray-600">Your Answer:</h4>
                  <div className="p-4 text-sm bg-gray-50 rounded-md border border-gray-100">{item.user_answer}</div>
                </div>

                {item.feedback && (
                  <div className="py-3">
                    <h4 className="mb-2 text-sm font-medium text-gray-600">Feedback:</h4>
                    <div className="p-4 text-sm bg-blue-50 rounded-md border border-blue-100 whitespace-pre-line">{item.feedback}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
                  {item.strengths && item.strengths.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-md border border-green-100">
                      <h4 className="flex items-center mb-3 text-sm font-medium text-green-700">
                        <CheckCircle size={16} className="mr-2" /> Key Strengths
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {item.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start">
                            <span className="inline-block w-5 h-5 mt-0.5 mr-2 text-xs flex items-center justify-center bg-green-200 text-green-800 rounded-full">{i + 1}</span>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.improvement_areas && item.improvement_areas.length > 0 && (
                    <div className="p-4 bg-amber-50 rounded-md border border-amber-100">
                      <h4 className="flex items-center mb-3 text-sm font-medium text-amber-700">
                        <AlertTriangle size={16} className="mr-2" /> Improvement Areas
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {item.improvement_areas.map((area, i) => (
                          <li key={i} className="flex items-start">
                            <span className="inline-block w-5 h-5 mt-0.5 mr-2 text-xs flex items-center justify-center bg-amber-200 text-amber-800 rounded-full">{i + 1}</span>
                            <span className="text-gray-700">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewFeedbackDashboard;