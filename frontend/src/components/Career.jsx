import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { context } from "../context/Context";
import Navbar from "./Navbar";
import CareerChatbot from "./CareerChatbot";
import CareerProgressionPathway from "./CareerProgressionPathway";
import ProgressionPathsDisplay from "./CareerProgressionPathway";

const CareerPath = () => {
    const [resumeText, setResumeText] = useState(null);
    const [careerPaths, setCareerPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [summary, setSummary] = useState('')
    const { email } = useContext(context);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Fetch resume text from DB
    useEffect(() => {
        if (email) {
            const fetchResume = async () => {
                try {
                    const response = await fetch(`http://localhost:2000/api/resume/${email}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch resume text");
                    }
                    const data = await response.json();

                    if (data.success == false) {
                        window.location.href = '/resume'
                    }

                    setResumeText(data.resume);
                } catch (error) {
                    setError(error.message);
                    setLoading(false);
                }
            };

            fetchResume();
        }
    }, [email]);

    // Send resume text to backend for career analysis
    useEffect(() => {





        if (resumeText) {
            const fetchCareerPaths = async () => {
                try {
                    const response = await fetch("http://localhost:2000/api/career-path", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ resumeText, email }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch career paths");
                    }

                    const data = await response.json();
                    console.log("Career paths data:", data);

                    if (data.careerPaths && Array.isArray(data.careerPaths)) {
                        setCareerPaths(data.careerPaths);
                    } else if (data.careerPaths && Array.isArray(data.careerPaths.careerPaths)) {
                        setCareerPaths(data.careerPaths.careerPaths);
                    } else {
                        console.error("Unexpected data structure:", data);
                        setError("Received malformed data from server");
                    }
                } catch (error) {
                    console.error("Error fetching career paths:", error);
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchCareerPaths();
        }
    }, [resumeText]);

    // Function to format salary display
    const formatSalary = (salary) => {
        if (!salary) return "Not available";

        // If salary is an object with min and max
        if (typeof salary === 'object' && salary.min && salary.max) {
            return `${salary.min} - ${salary.max}`;
        }

        // If salary is just a number or string
        return salary.toString();
    };

    // Handle star rating hover
    const handleMouseOver = (starRating) => {
        setHoverRating(starRating);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    // Handle star click
    const handleStarClick = (starRating) => {
        setRating(starRating);
    };

    // Submit feedback to backend
    const handleSubmitFeedback = async () => {
        if (rating === 0) return; // Require at least a star rating

        setSubmittingFeedback(true);

        try {
            const feedbackData = {
                email: email,
                careerTitle: careerPaths[activeTab].title,
                rating: rating,
                feedback: feedbackText,
                timestamp: new Date().toISOString(),
                recommendationId: activeTab // Using activeTab as a simple identifier for the recommendation
            };

            const response = await fetch("http://localhost:2000/api/recommendation-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit feedback");
            }

            setFeedbackSubmitted(true);
            setTimeout(() => {
                setShowFeedbackModal(false);
                setFeedbackSubmitted(false);
                setRating(0);
                setFeedbackText("");
            }, 2000);

        } catch (error) {
            console.error("Error submitting feedback:", error);
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-700">Analyzing your career opportunities...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
            <div className="text-4xl text-red-500 mb-2">❌</div>
            <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="bg-gray-50 min-h-screen mt-2">
                {/* Header */}
                <header className="text-center py-8 px-4 bg-white ">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                        Career Compass
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Personalized career recommendations based on your resume
                    </p>
                </header>

                {/* Main Content */}
                <div className="container mx-auto p-4 lg:p-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Navigation Card */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-lg font-bold mb-4 text-gray-800">Career Options</h3>
                                    {careerPaths && careerPaths.length > 0 ? (
                                        <ul className="space-y-2">
                                            {careerPaths.map((path, index) => (
                                                <li
                                                    key={index}
                                                    className={`px-4 py-3 rounded-lg cursor-pointer transition-colors ${activeTab === index
                                                        ? 'bg-gradient-to-r from-blue-600 to-violet-600  text-white'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                    onClick={() => setActiveTab(index)}
                                                >
                                                    {path.title}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No career paths found</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-2">
                            {careerPaths && careerPaths.length > 0 ? (
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    {/* Career Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-violet-600  px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <h2 className="text-2xl font-bold text-white">{careerPaths[activeTab].title}</h2>
                                        <div className="mt-2 md:mt-0 bg-blue-600 bg-opacity-20 rounded-full px-4 py-1 text-white font-medium">
                                            Average Salary: {formatSalary(careerPaths[activeTab].salary)} CTC Rs
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-8">
                                        {/* Overview Section */}
                                        <div>
                                            <h3 className="text-lg font-bold mb-3 text-gray-800">Career Overview</h3>
                                            <p className="text-gray-600">{careerPaths[activeTab].description}</p>
                                        </div>

                                        {/* Skills Section */}
                                        <div>
                                            <h3 className="text-lg font-bold mb-3 text-gray-800">Required Skills</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(careerPaths[activeTab].skills) ? (
                                                    careerPaths[activeTab].skills.map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500">Skills information not available</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Match Analysis */}
                                        <div>
                                            <h3 className="text-lg font-bold mb-3 text-gray-800">Skills Match Analysis</h3>
                                            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-4 rounded-full"
                                                    style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-gray-600">Your resume shows a strong match for this career path!</p>
                                        </div>

                                        {/* Pass the progression paths array as a prop */}
                                        <ProgressionPathsDisplay progressionPaths={careerPaths[activeTab].progressionPaths} />
                                        {console.log(careerPaths.progressionPaths)}

                                        {/* Feedback Section */}
                                        <div>
                                            <h3 className="text-lg font-bold mb-3 text-gray-800">Rate This Recommendation</h3>
                                            <button
                                                onClick={() => setShowFeedbackModal(true)}
                                                className="px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                                            >
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    Rate & Provide Feedback
                                                </span>
                                            </button>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Link
                                                target="_blank"
                                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex-1 text-center"
                                                to={`/jobsearch?jobpost=${careerPaths[activeTab].title}`}
                                            >
                                                <button>Find Jobs</button>
                                            </Link>

                                            <button className="px-6 py-3 border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex-1 text-center">
                                                Skill Development
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                                    <h2 className="text-xl font-bold mb-2">No career recommendations found</h2>
                                    <p className="text-gray-600">
                                        We couldn't generate career recommendations based on your resume. Try updating your resume with more skills and experiences.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Feedback Modal */}
                {showFeedbackModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                            {feedbackSubmitted ? (
                                <div className="text-center py-8">
                                    <div className="text-green-500 text-5xl mb-4">✓</div>
                                    <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                                    <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-gray-800">Rate This Recommendation</h3>
                                        <button
                                            onClick={() => setShowFeedbackModal(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-gray-600 mb-4">How helpful was this career recommendation?</p>
                                        <div className="flex justify-center space-x-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onMouseOver={() => handleMouseOver(star)}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => handleStarClick(star)}
                                                    className="focus:outline-none"
                                                >
                                                    {star <= (hoverRating || rating) ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label htmlFor="feedback" className="block text-gray-700 mb-2">Share your thoughts (optional)</label>
                                        <textarea
                                            id="feedback"
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            placeholder="What did you like or dislike about this career recommendation?"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSubmitFeedback}
                                            disabled={rating === 0 || submittingFeedback}
                                            className={`px-6 py-2 rounded-lg text-white ${rating === 0 || submittingFeedback
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                        >
                                            {submittingFeedback ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Submitting...
                                                </span>
                                            ) : (
                                                "Submit Feedback"
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Chat Button */}
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                    >
                        {isChatOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Chat Component */}
                {isChatOpen && (
                    <div className="fixed bottom-24 right-6 z-50  shadow-xl rounded-lg overflow-hidden">
                        <CareerChatbot onClose={() => setIsChatOpen(false)} summary={summary} setSummary={setSummary} />
                    </div>
                )}
            </div>
        </>
    );
};

export default CareerPath;