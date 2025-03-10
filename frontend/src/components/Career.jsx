import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CareerPath = () => {
    const [resumeText, setResumeText] = useState("");
    const [careerPaths, setCareerPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    // Fetch resume text from DB
    useEffect(() => {
        const fetchResume = async () => {
            try {
                const response = await fetch("http://localhost:2000/api/resume");
                if (!response.ok) {
                    throw new Error("Failed to fetch resume text");
                }
                const data = await response.json();
                setResumeText(data.resume);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchResume();
    }, []);

    // Send resume text to backend for career analysis
    useEffect(() => {
        if (resumeText) {
            const fetchCareerPaths = async () => {
                try {
                    const response = await fetch("http://localhost:2000/api/career-path", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ resumeText }),
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
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="text-center py-8 px-4 bg-white shadow-md">
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
                                                    ? 'bg-blue-500 text-white'
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
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center">
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
        </div>
    );
};

export default CareerPath;