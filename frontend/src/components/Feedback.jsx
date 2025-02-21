import React, { useState } from 'react';

const CandidateFeedbackUI = () => {
    const [candidateInfo] = useState({
        name: 'John Doe',
        position: 'Senior Frontend Developer',
        interviewDate: 'February 15, 2025',
        overallScore: 78,
    });

    const [activeSection, setActiveSection] = useState('hr');
    const [feedbackSent, setFeedbackSent] = useState(false);

    // HR interview feedback with specific answers and improvement suggestions
    const [hrFeedback] = useState([
        {
            question: "Tell me about yourself and your experience.",
            answer: "I'm a frontend developer with 5 years of experience working with React and JavaScript. I've been part of three major projects in my current company, leading the UI development team in the last one.",
            rating: 4,
            feedback: "Your introduction was clear and concise. You highlighted relevant experience, but could have briefly mentioned specific achievements to stand out. Consider quantifying your impact (e.g., 'improved site performance by 40%').",
            improvementTips: "For future interviews, prepare a 30-60-90 second version of your introduction. Include 1-2 measurable achievements and briefly mention your career goals aligned with the position."
        },
        {
            question: "How do you handle work pressure and tight deadlines?",
            answer: "I try to stay organized and prioritize tasks. When deadlines are tight, I focus on the most important features first.",
            rating: 3,
            feedback: "Your answer demonstrates basic time management awareness, but lacks specific methods or examples of how you've handled pressure successfully in the past.",
            improvementTips: "Use the STAR method (Situation, Task, Action, Result) to structure your answer with a concrete example. Mention specific techniques you use for stress management and prioritization."
        },
        {
            question: "What's your approach to teamwork and collaboration?",
            answer: "I believe in open communication. I use tools like Slack and participate in standups to stay connected with the team. I'm always willing to help teammates when they have questions.",
            rating: 4,
            feedback: "Good emphasis on communication and willingness to help others. You mentioned specific tools, which is positive.",
            improvementTips: "Enhance your answer by describing a specific scenario where your collaborative approach led to a successful outcome. Also mention how you handle disagreements in a team setting."
        }
    ]);

    // Technical interview feedback with code examples and suggestions
    const [technicalFeedback] = useState([
        {
            question: "Implement a function to reverse a string in JavaScript.",
            answer: `function reverseString(str) {
  return str.split('').reverse().join('');
}`,
            rating: 5,
            feedback: "Your solution is correct, efficient, and easy to understand. You used the appropriate string methods for JavaScript.",
            improvementTips: "This is already optimal for this specific question. For extra points, you could have mentioned edge cases like handling Unicode characters or demonstrating an alternate method using a for loop for comparison."
        },
        {
            question: "Explain how React component lifecycle works.",
            answer: "React components go through mounting, updating, and unmounting phases. We can use hooks like useEffect to handle side effects that would traditionally be handled by lifecycle methods.",
            rating: 3,
            feedback: "Your answer covers the basics, but lacks depth. You mentioned hooks but didn't fully explain how they relate to the traditional lifecycle methods.",
            improvementTips: "Provide more specific details about which hooks replace which lifecycle methods (e.g., useEffect with cleanup replaces componentDidMount and componentWillUnmount). Include examples of when you would use different approaches."
        },
        {
            question: "How would you optimize the performance of a React application?",
            answer: "I would use React.memo to prevent unnecessary re-renders, implement code splitting with React.lazy, and minimize state changes.",
            rating: 4,
            feedback: "Good mention of specific optimization techniques. You demonstrated knowledge of modern React practices.",
            improvementTips: "Expand your answer with specific examples from your experience where you applied these techniques and measured the improvement. Also mention tools like Lighthouse or React DevTools that you use to identify performance bottlenecks."
        }
    ]);

    // Overall assessment and improvement plan
    const [overallFeedback] = useState({
        strengthsSummary: "You demonstrated strong technical fundamentals, particularly in JavaScript coding and React knowledge. Your communication style is clear and professional.",
        weaknessesSummary: "Areas for improvement include providing more specific examples from your experience, deeper explanations of complex concepts, and more structured responses to behavioral questions.",
        improvementPlan: [
            "Focus on preparing 2-3 strong examples of past achievements using the STAR method",
            "Practice explaining technical concepts at different levels of complexity",
            "Research the company more thoroughly to align your answers with their specific needs and culture",
            "Strengthen your knowledge of modern frontend optimization techniques and testing methodologies"
        ],
        recommendedResources: [
            { name: "Advanced React Patterns", url: "https://example.com/react-patterns" },
            { name: "Technical Interview Preparation Guide", url: "https://example.com/tech-interview-guide" },
            { name: "Effective Communication for Developers", url: "https://example.com/dev-communication" }
        ]
    });

    // Rating component with stars
    const RatingDisplay = ({ rating }) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    const handleDownloadPDF = () => {
        // In a real application, this would generate and download a PDF of the feedback
        alert('Downloading PDF version of your feedback...');
    };

    const handleSendFeedback = () => {
        setFeedbackSent(true);
    };

    if (feedbackSent) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <h2 className="text-3xl font-bold text-gray-800 mt-4">Feedback Sent!</h2>
                        <p className="text-gray-600 mt-2">Your feedback has been sent to {candidateInfo.name}. They'll receive an email with all the details and improvement suggestions.</p>
                        <button
                            onClick={() => setFeedbackSent(false)}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                        >
                            Return to Feedback Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header with candidate info and summary */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Interview Feedback Report</h1>
                                <p className="mt-1 text-blue-100">Your AI-Powered Interview Assessment</p>
                            </div>
                            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
                                <span className="font-medium">Overall Score: </span>
                                <span className="text-2xl font-bold">{candidateInfo.overallScore}%</span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                            <div>
                                <p className="text-blue-200 text-sm">Candidate</p>
                                <p className="font-medium">{candidateInfo.name}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-sm">Position</p>
                                <p className="font-medium">{candidateInfo.position}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-sm">Interview Date</p>
                                <p className="font-medium">{candidateInfo.interviewDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveSection('hr')}
                            className={`px-6 py-3 text-sm font-medium ${activeSection === 'hr'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            HR Interview Feedback
                        </button>
                        <button
                            onClick={() => setActiveSection('technical')}
                            className={`px-6 py-3 text-sm font-medium ${activeSection === 'technical'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Technical Interview Feedback
                        </button>
                        <button
                            onClick={() => setActiveSection('overall')}
                            className={`px-6 py-3 text-sm font-medium ${activeSection === 'overall'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Overall Assessment
                        </button>
                    </div>

                    {/* Section Content */}
                    <div className="px-6 py-6">
                        {/* HR Feedback */}
                        {activeSection === 'hr' && (
                            <div className="space-y-8">
                                <div className="pb-4 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-800">HR Interview Feedback</h2>
                                    <p className="text-gray-600 mt-2">Assessment of your communication skills, professional attitude, and cultural fit.</p>
                                </div>

                                {hrFeedback.map((item, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
                                            <RatingDisplay rating={item.rating} />
                                        </div>

                                        <div className="mt-3 p-3 bg-gray-100 rounded text-gray-700">
                                            <p className="text-sm italic">Your answer:</p>
                                            <p className="mt-1">{item.answer}</p>
                                        </div>

                                        <div className="mt-4">
                                            <p className="font-medium text-gray-800">Feedback:</p>
                                            <p className="mt-1 text-gray-700">{item.feedback}</p>
                                        </div>

                                        <div className="mt-4 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                                            <p className="font-medium text-blue-700">How to improve:</p>
                                            <p className="mt-1 text-blue-900">{item.improvementTips}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Technical Feedback */}
                        {activeSection === 'technical' && (
                            <div className="space-y-8">
                                <div className="pb-4 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-800">Technical Interview Feedback</h2>
                                    <p className="text-gray-600 mt-2">Assessment of your technical knowledge, problem-solving skills, and coding abilities.</p>
                                </div>

                                {technicalFeedback.map((item, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
                                            <RatingDisplay rating={item.rating} />
                                        </div>

                                        <div className="mt-3 p-3 bg-gray-100 rounded text-gray-700 font-mono text-sm">
                                            <p className="text-sm italic font-sans">Your answer:</p>
                                            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">{item.answer}</pre>
                                        </div>

                                        <div className="mt-4">
                                            <p className="font-medium text-gray-800">Feedback:</p>
                                            <p className="mt-1 text-gray-700">{item.feedback}</p>
                                        </div>

                                        <div className="mt-4 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                                            <p className="font-medium text-blue-700">How to improve:</p>
                                            <p className="mt-1 text-blue-900">{item.improvementTips}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Overall Assessment */}
                        {activeSection === 'overall' && (
                            <div className="space-y-8">
                                <div className="pb-4 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-800">Overall Assessment</h2>
                                    <p className="text-gray-600 mt-2">Summary of your performance and personalized improvement plan.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <h3 className="text-lg font-semibold text-green-800 mb-3">Strengths</h3>
                                        <p className="text-green-700">{overallFeedback.strengthsSummary}</p>
                                    </div>

                                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                        <h3 className="text-lg font-semibold text-amber-800 mb-3">Areas for Improvement</h3>
                                        <p className="text-amber-700">{overallFeedback.weaknessesSummary}</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Your Personalized Improvement Plan</h3>
                                    <ul className="space-y-3">
                                        {overallFeedback.improvementPlan.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span className="text-blue-900">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Resources</h3>
                                    <ul className="space-y-3">
                                        {overallFeedback.recommendedResources.map((resource, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                                </svg>
                                                <a href={resource.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                                    {resource.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 border-t">
                        <button
                            type="button"
                            onClick={handleDownloadPDF}
                            className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Download PDF
                        </button>
                        <button
                            type="button"
                            onClick={handleSendFeedback}
                            className="inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            Send to Candidate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateFeedbackUI;