import React, { useState, useEffect } from 'react';
import {
    File,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Award,
    BarChart3,
    BookOpen,
    Briefcase,
    FileText,
    ListChecks,
    HelpCircle,
    Sparkles,
    User,
    Download,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    ExternalLink,
    Edit
} from 'lucide-react';

export default function ResumeAnalysisReport() {
    // Sample data based on the function parameters provided
    const data = {
        final: 78,
        struct: 85,
        hsp: 75,
        ssp: 70,
        wcp: 80,
        sections: {
            'Education': true,
            'Experience': true,
            'Skills': true,
            'Projects': false,
            'Certifications': true
        },
        match_hard: ['JavaScript', 'React', 'CSS', 'HTML', 'REST API'],
        missing_hard: ['Node.js', 'GraphQL', 'TypeScript'],
        match_soft: ['Communication', 'Leadership', 'Teamwork'],
        missing_soft: ['Problem Solving', 'Time Management'],
        word_count: 450,
        pdfFileName: 'john_doe_resume.pdf',
        corrections: [
            { type: 'Grammar', issue: 'developmnet to development' },
            { type: 'Grammar', issue: 'acheived to achieved' },
            { type: 'Grammar', issue: 'responsable to responsible' }
        ]
    };

    const [expandedSections, setExpandedSections] = useState({
        skills: false,
        structure: false,
        corrections: false
    });

    const [showResume, setShowResume] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading the resume
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const toggleSection = (section) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    // Calculate color based on score
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Main content - Analysis */}
            <div className={`transition-all duration-300 ${showResume ? 'w-3/5' : 'w-full'} overflow-y-auto`}>
                <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-b-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-white/20 p-3 rounded-lg mr-4">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Resume Analysis Report</h1>
                                    <p className="text-blue-200 mt-1 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        {data.pdfFileName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowResume(!showResume)}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {showResume ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {showResume ? 'Hide Resume' : 'Show Resume'}
                                </button>
                                <div className="bg-white text-center p-6 rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-lg border-4 border-blue-100">
                                    <span className={`text-4xl font-bold ${getScoreColor(data.final)}`}>{data.final}</span>
                                    <span className="text-blue-800 font-medium">Score</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-indigo-50">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center text-indigo-700 mb-2">
                                <BarChart3 className="w-5 h-5 mr-2" />
                                <h3 className="font-semibold">Structure</h3>
                            </div>
                            <p className={`text-2xl font-bold ${getScoreColor(data.struct)}`}>{data.struct}%</p>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                                <div className={`${getScoreBgColor(data.struct)} h-2.5 rounded-full`} style={{ width: `${data.struct}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center text-indigo-700 mb-2">
                                <Briefcase className="w-5 h-5 mr-2" />
                                <h3 className="font-semibold">Hard Skills</h3>
                            </div>
                            <p className={`text-2xl font-bold ${getScoreColor(data.hsp)}`}>{data.hsp}%</p>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                                <div className={`${getScoreBgColor(data.hsp)} h-2.5 rounded-full`} style={{ width: `${data.hsp}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center text-indigo-700 mb-2">
                                <BookOpen className="w-5 h-5 mr-2" />
                                <h3 className="font-semibold">Soft Skills</h3>
                            </div>
                            <p className={`text-2xl font-bold ${getScoreColor(data.ssp)}`}>{data.ssp}%</p>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                                <div className={`${getScoreBgColor(data.ssp)} h-2.5 rounded-full`} style={{ width: `${data.ssp}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center text-indigo-700 mb-2">
                                <File className="w-5 h-5 mr-2" />
                                <h3 className="font-semibold">Content</h3>
                            </div>
                            <p className={`text-2xl font-bold ${getScoreColor(data.wcp)}`}>{data.wcp}%</p>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                                <div className={`${getScoreBgColor(data.wcp)} h-2.5 rounded-full`} style={{ width: `${data.wcp}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6">
                        {/* Corrections Section - Showing first because it's most important for grammar */}
                        <div className="mb-6 bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                            <div
                                className="p-4 bg-indigo-50 flex justify-between items-center cursor-pointer hover:bg-indigo-100 transition-colors"
                                onClick={() => toggleSection('corrections')}
                            >
                                <div className="flex items-center text-lg font-semibold text-indigo-700">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Grammar Corrections
                                </div>
                                <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                                    {expandedSections.corrections ? <ChevronUp className="text-indigo-700" /> : <ChevronDown className="text-indigo-700" />}
                                </div>
                            </div>

                            {expandedSections.corrections && (
                                <div className="p-6">
                                    {data.corrections.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.corrections.map((correction, index) => (
                                                <div key={index} className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                                                            <Edit className="w-5 h-5 text-indigo-700" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <h4 className="text-sm font-medium text-indigo-800">{correction.type}</h4>
                                                            <div className="mt-3 bg-white p-3 rounded-lg border-l-4 border-indigo-400">
                                                                <p className="text-sm text-indigo-800">
                                                                    <strong>Correction:</strong> {correction.issue}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center py-8 bg-indigo-50 rounded-xl">
                                            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                                            <p className="text-gray-700 font-medium">No grammatical errors detected. Great job!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Skills Section */}
                        <div className="mb-6 bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                            <div
                                className="p-4 bg-indigo-50 flex justify-between items-center cursor-pointer hover:bg-indigo-100 transition-colors"
                                onClick={() => toggleSection('skills')}
                            >
                                <div className="flex items-center text-lg font-semibold text-indigo-700">
                                    <ListChecks className="w-5 h-5 mr-2" />
                                    Skills Analysis
                                </div>
                                <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                                    {expandedSections.skills ? <ChevronUp className="text-indigo-700" /> : <ChevronDown className="text-indigo-700" />}
                                </div>
                            </div>

                            {expandedSections.skills && (
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Hard Skills */}
                                        <div>
                                            <h3 className="font-medium text-indigo-800 mb-4 flex items-center">
                                                <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                                                Hard Skills
                                            </h3>
                                            <div className="space-y-5">
                                                <div>
                                                    <p className="text-sm text-indigo-600 mb-3 font-medium">Matching Skills:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.match_hard.map((skill, index) => (
                                                            <span key={index} className="flex items-center bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-full">
                                                                <CheckCircle className="w-3 h-3 mr-1.5" />
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-indigo-600 mb-3 font-medium">Missing Skills:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.missing_hard.map((skill, index) => (
                                                            <span key={index} className="flex items-center bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1.5 rounded-full">
                                                                <XCircle className="w-3 h-3 mr-1.5" />
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Soft Skills */}
                                        <div>
                                            <h3 className="font-medium text-indigo-800 mb-4 flex items-center">
                                                <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                                                Soft Skills
                                            </h3>
                                            <div className="space-y-5">
                                                <div>
                                                    <p className="text-sm text-indigo-600 mb-3 font-medium">Matching Skills:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.match_soft.map((skill, index) => (
                                                            <span key={index} className="flex items-center bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-full">
                                                                <CheckCircle className="w-3 h-3 mr-1.5" />
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-indigo-600 mb-3 font-medium">Missing Skills:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.missing_soft.map((skill, index) => (
                                                            <span key={index} className="flex items-center bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1.5 rounded-full">
                                                                <XCircle className="w-3 h-3 mr-1.5" />
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Structure Section */}
                        <div className="mb-6 bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                            <div
                                className="p-4 bg-indigo-50 flex justify-between items-center cursor-pointer hover:bg-indigo-100 transition-colors"
                                onClick={() => toggleSection('structure')}
                            >
                                <div className="flex items-center text-lg font-semibold text-indigo-700">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Resume Structure
                                </div>
                                <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                                    {expandedSections.structure ? <ChevronUp className="text-indigo-700" /> : <ChevronDown className="text-indigo-700" />}
                                </div>
                            </div>

                            {expandedSections.structure && (
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-indigo-50 p-5 rounded-xl">
                                            <h3 className="font-medium text-indigo-800 mb-4 flex items-center">
                                                <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
                                                Required Sections
                                            </h3>
                                            <ul className="space-y-3">
                                                {Object.entries(data.sections).map(([section, present], index) => (
                                                    <li key={index} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                                                        {present ? (
                                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            </div>
                                                        )}
                                                        <span className={`${present ? "text-gray-800" : "text-red-600"} font-medium`}>{section}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-indigo-50 p-5 rounded-xl">
                                            <h3 className="font-medium text-indigo-800 mb-4 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                                                Content Analysis
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-gray-700">Word Count</span>
                                                    <span className="font-bold text-indigo-700">{data.word_count}</span>
                                                </div>
                                                <div className="mb-4">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className={`h-2.5 rounded-full ${data.word_count < 300 ? 'bg-red-500' : data.word_count > 700 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.min(100, (data.word_count / 700) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {data.word_count < 300 ? '⚠️ Too short - add more relevant details' :
                                                        data.word_count > 700 ? '⚠️ Consider condensing content for better readability' :
                                                            '✓ Optimal length for most resumes'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recommendations */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
                            <div className="flex items-start">
                                <div className="bg-white/20 p-3 rounded-lg mr-4">
                                    <Award className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Recommendations to Improve Your Score</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                            <span>Add a <strong>Projects section</strong> to showcase practical experience with your listed skills.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                            <span>Incorporate more of the <strong>missing hard skills</strong> or highlight relevant experiences with similar technologies.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                            <span>Add examples that demonstrate your <strong>problem-solving abilities</strong> and time management skills.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                            <span>Fix the <strong>grammatical errors</strong> highlighted above for a more professional document.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-indigo-50 p-5 text-center text-indigo-600 text-sm border-t border-indigo-100">
                        <p>Resume analysis completed on {new Date().toLocaleDateString()}</p>
                        <p className="mt-1 text-xs text-indigo-400">Results are based on industry standards and job market requirements</p>
                    </div>
                </div>
            </div>

            {/* Resume Preview Section */}
            {showResume && (
                <div className="w-2/5 bg-gray-800 p-6 flex flex-col h-screen">
                    <div className="bg-gray-700 rounded-t-xl p-4 flex justify-between items-center">
                        <h2 className="text-white font-medium flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Resume Preview
                        </h2>
                        <div className="flex items-center gap-2">
                            <a
                                href="http://localhost:5000/john_doe_resume.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open
                            </a>
                            <a
                                href="http://localhost:5000/john_doe_resume.pdf"
                                download
                                className="bg-gray-600 hover:bg-gray-500 text-white text-sm py-1.5 px-3 rounded flex items-center gap-1.5 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download
                            </a>
                        </div>
                    </div>
                    <div className="flex-1 bg-white overflow-hidden rounded-b-xl">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                            </div>
                        ) : (
                            <iframe
                                src="http://localhost:5000/static/uploads/Resume%20(1)-1.pdf"
                                className="w-full h-full"
                                title="Resume Preview"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}