import React, { useState, useEffect, useContext } from 'react';
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
import { context } from '../context/Context';
import Navbar from './Navbar';

export default function ResumeAnalysisReport() {
    const { email } = useContext(context);
    const [data, setData] = useState(null);
    const [rec, setRec] = useState(null)
    const [processedSections, setProcessedSections] = useState({
        found: [],
        missing: []
    });

    // Section patterns from your code
    const section_patterns = {
        'experience': [
            /(?:professional\s)?experience/i,
            /work\s(?:experience|history)/i,
            /employment(?:\shistory)?/i,
            /career(?:\shistory)?/i
        ],
        'projects': [
            /projects?/i,
            /portfolio/i,
            /personal\sprojects?/i,
            /key\sprojects?/i,
            /professional\sprojects?/i,
            /project\sexperience/i
        ],
        'education': [
            /education(?:al)?(?:\sbackground)?/i,
            /academic(?:\sbackground)?/i,
            /qualification/i,
            /academic\sprofile/i,
            /degrees?/i
        ],
        'skills': [
            /technical\sskills/i,
            /skills(?:\s&\sabilities)?/i,
            /competencies/i,
            /proficiencies/i,
            /expertise/i,
            /core\scompetencies/i
        ],
        'achievement': [
            /achievements?/i,
            /accomplishments?/i,
            /awards/i,
            /honors?/i,
            /recognitions?/i
        ],
        'summary': [
            /(?:professional\s)?summary/i,
            /profile/i,
            /objective/i,
            /career\sobjective/i,
            /about\sme/i,
            /introduction/i
        ],


        'references': [
            /references/i,
            /recommendations/i,
            /referees/i
        ],
        'publications': [
            /publications/i,
            /research/i,
            /papers/i,
            /articles/i
        ],
        'certifications': [
            /certifications?/i,
            /licenses?/i,
            /accreditations?/i,
            /professional\sdevelopment/i
        ],
        'languages': [
            /languages?/i,
            /language\sskills/i,
            /language\sproficiency/i
        ],
        'volunteer': [
            /volunteer(?:\sexperience)?/i,
            /community\sservice/i,
            /extracurricular/i
        ],
        'interests': [
            /interests/i,
            /hobbies/i,
            /activities/i,
            /personal\sinterests/i
        ]
    };

    // Essential sections that should be present in a resume
    const essentialSections = [
        'experience',
        'education',
        'skills',
        'summary',

        'projects'
    ];

    useEffect(() => {
        if (email) {
            async function getData() {
                const res = await fetch(`http://localhost:2000/resumereport/${email}`);
                const data = await res.json();

                console.log(data);
                if (data.success) {
                    setData(data.data);

                    // Process sections to determine which are found and which are missing
                    if (data.data.sections) {
                        processSections(data.data.sections);
                    }
                } else {
                    // window.location.href = "/resume"
                }
            }

            getData();
        }
    }, [email]);
    useEffect(() => {
        if (email) {
            async function getData() {
                const res = await fetch(`http://localhost:2000/analyses/${email}`);
                const data = await res.json();


                if (data.success) {
                    setRec(data.data);


                } else {
                    // window.location.href = "/resume"
                }
            }

            getData();
        }
    }, [email]);
    // Process the sections data to determine found and missing sections
    const processSections = (sections) => {
        // Extract section names from the "X section found" format
        const foundSections = sections.map(section => {
            const match = section.match(/^(.*?) section found$/);
            return match ? match[1].toLowerCase() : '';
        }).filter(Boolean);

        // Convert section names to their canonical form
        const canonicalFoundSections = foundSections.map(foundSection => {
            for (const [key, patterns] of Object.entries(section_patterns)) {
                for (const pattern of patterns) {
                    const regex = new RegExp(pattern, 'i');
                    if (regex.test(foundSection)) {
                        return key;
                    }
                }
            }
            return foundSection; // Return as is if no match found
        });

        // Find missing essential sections
        const missingSections = essentialSections.filter(
            section => !canonicalFoundSections.includes(section)
        );

        setProcessedSections({
            found: canonicalFoundSections,
            missing: missingSections
        });
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

    // Function to determine correction type
    const getCorrectionType = (correction) => {
        if (correction.includes('to ') && correction.split('to ').length === 2) {
            const [from, to] = correction.split('to ');

            // Check for capitalization fixes
            if (from.toLowerCase() === to.toLowerCase() &&
                (from.charAt(0).toLowerCase() !== from.charAt(0) ||
                    to.charAt(0).toLowerCase() !== to.charAt(0))) {
                return "Capitalization";
            }

            // Check for spacing issues
            if (from.trim() === to.trim() && (from.includes('  ') || to.includes('  '))) {
                return "Spacing";
            }

            // Check for punctuation issues
            if (from.replace(/[^\w\s]/g, '') === to.replace(/[^\w\s]/g, '')) {
                return "Punctuation";
            }

            // Default to spelling for other corrections
            return "Spelling/Grammar";
        }

        return "Grammar";
    };

    // Helper to capitalize section names for display
    const capitalizeSection = (section) => {
        return section.charAt(0).toUpperCase() + section.slice(1);
    };

    if (!data) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="flex h-screen bg-gray-100 ">
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
                                <p className={`text-2xl font-bold ${getScoreColor(data.hsp)}`}>{parseInt(data.hsp)}%</p>
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
                                        Grammar & Text Corrections
                                    </div>
                                    <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                                        {expandedSections.corrections ? <ChevronUp className="text-indigo-700" /> : <ChevronDown className="text-indigo-700" />}
                                    </div>
                                </div>

                                {expandedSections.corrections && (
                                    <div className="p-6">
                                        {data.corrections.length > 0 ? (
                                            <div className="space-y-4">
                                                {data.corrections.map((correction, index) => {
                                                    // Skip duplicate entries that just involve spacing after punctuation
                                                    if (correction === ' , to ,' || correction === ' . to .') {
                                                        return null;
                                                    }

                                                    const correctionType = getCorrectionType(correction);
                                                    const [from, to] = correction.split('to ');

                                                    return (
                                                        <div key={index} className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                                            <div className="flex items-start">
                                                                <div className="flex-shrink-0 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                                                                    <Edit className="w-5 h-5 text-indigo-700" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <h4 className="text-sm font-medium text-indigo-800">{correctionType}</h4>
                                                                    <div className="mt-3 bg-white p-3 rounded-lg border-l-4 border-indigo-400">
                                                                        <p className="text-sm text-indigo-800">
                                                                            <strong>Change:</strong> "<span className="text-red-600">{from?.trim()}</span>" to "<span className="text-green-600">{to?.trim()}</span>"
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }).filter(Boolean)}
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
                            {/* Structure Section - UPDATED */}
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
                                                    Resume Sections
                                                </h3>
                                                <ul className="space-y-3">
                                                    {/* Found Sections */}
                                                    {processedSections.found.map((section, index) => (
                                                        <li key={`found-${index}`} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            </div>
                                                            <span className="text-gray-800 font-medium">
                                                                {capitalizeSection(section)}
                                                            </span>
                                                        </li>
                                                    ))}

                                                    {/* Missing Sections */}
                                                    {processedSections.missing.map((section, index) => (
                                                        <li key={`missing-${index}`} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            </div>
                                                            <span className="text-red-600 font-medium">
                                                                {capitalizeSection(section)} <span className="text-xs">(Missing)</span>
                                                            </span>
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
                                            {
                                                rec && rec.map((item) => (
                                                    <li className="flex items-start">
                                                        <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                                            <CheckCircle className="w-3 h-3" />
                                                        </div>
                                                        <span>{item}</span>
                                                    </li>
                                                ))
                                            }
                                            {/* <li className="flex items-start">
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
                                        </li> */}
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
                                {/* <a
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
                            </a> */}
                            </div>
                        </div>
                        <div className="flex-1 bg-white overflow-hidden rounded-b-xl">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                                </div>
                            ) : (
                                <iframe
                                    src={`http://localhost:5000/static/uploads/${data.pdfFileName}`}
                                    className="w-full h-full"
                                    title="Resume Preview"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}