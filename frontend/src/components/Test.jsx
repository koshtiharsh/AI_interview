import React, { useState, useEffect, useRef, useContext } from 'react';
import { AlertCircle, Code, ChevronDown, ChevronUp, Mic, MicOff } from 'lucide-react';
import io from 'socket.io-client';
import Emotion from './Emotion';
import { context } from '../context/Context';
import Navbar from './Navbar';

const TechnicalInterview = ({ tech_role = "Software Engineer" }) => {
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [codeSolution, setCodeSolution] = useState('');
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(5);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showAnswerSection, setShowAnswerSection] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const { overAllEmotion, setOverAllEmotion, email, tech_stack } = useContext(context)

    // Track when we're transitioning between questions
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Use useRef for socket connection and SpeechRecognition
    const socketRef = useRef(null);
    const socketInitialized = useRef(false);
    const recognitionRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        // Check if browser supports SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Automatically update answer with transcript
                setAnswer(prev => prev + finalTranscript);
                setTranscript(interimTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    recognitionRef.current.start();
                }
            };
        } else {
            console.log('Speech recognition not supported in this browser');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Auto-start speech recognition for non-coding questions
    useEffect(() => {
        if (currentQuestion && !currentQuestion.code_snippet && recognitionRef.current && !isListening) {
            // Auto-start speech recognition
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
            }
        }
    }, [currentQuestion]);

    // Manual toggle for speech recognition
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            setTranscript('');
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Initialize socket and request first question
    useEffect(() => {

        if (email) {
            // Connect to socket.io server
            const socketURL = 'http://localhost:5000'; // Update with your actual backend URL
            console.log('Initializing socket connection to:', socketURL);

            socketRef.current = io(socketURL, {
                transports: ['websocket', 'polling'],
                query: {
                    email,
                    tech_role,
                    tech_stack
                }
            });

            // Setup event listeners
            socketRef.current.on('connect', () => {
                console.log('Socket connected with ID:', socketRef.current.id);
                socketInitialized.current = true;
                setError(null);

                // Request first question after connection is established
                if (!currentQuestion && !isTransitioning) {
                    requestNextQuestion();
                }
            });


            socketRef.current.on('new_tech_question', (data) => {
                console.log('Received question:', data);
                setCurrentQuestion(data);
                setQuestionNumber(data.questionNumber);
                setTotalQuestions(data.totalQuestions);
                setLoading(false);
                setIsTransitioning(false);
                setError(null);

                if (data.tech_interview_finished) {
                    setInterviewComplete(true)
                }
                // Automatically show code editor if the question has a code snippet
                if (data.code_snippet) {
                    setShowCodeEditor(true);


                    // Stop speech recognition if it's a coding question
                    if (isListening) {
                        recognitionRef.current.stop();
                        setIsListening(false);
                    }
                }
            });

            socketRef.current.on('tech_answer_feedback', (data) => {
                console.log('Received feedback:', data);
                console.log(`Current question: ${questionNumber}, Total questions: ${totalQuestions}`);
                setSubmitting(false);
                setOverAllEmotion([])
                // More explicit condition with debug info
                if (questionNumber >= totalQuestions) {
                    console.log('Setting interview complete to true');
                    setInterviewComplete(true);
                } else {
                    console.log('Proceeding to next question');
                    handleNextQuestion();
                }
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setError('Connection error. Please check your internet connection and try again.');
                setLoading(false);
            });

            socketRef.current.on('error', (error) => {
                console.error('Socket error:', error);
                setError('An error occurred with the server connection.');
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                socketInitialized.current = false;
                setError('Disconnected from server. Attempting to reconnect...');
            });

            // Cleanup function
            return () => {
                console.log('Cleaning up socket connection');
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketInitialized.current = false;
                }
                if (recognitionRef.current && isListening) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                }
            };
        }
    }, [email]);

    const requestNextQuestion = () => {
        setLoading(true);
        setAnswer('');
        setCodeSolution('');
        setShowCodeEditor(false);
        setError(null);
        setIsTransitioning(true);
        setShowAnswerSection(true);
        setTranscript('');
        setSubmitting(false);

        // Stop speech recognition when transitioning questions
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        if (socketRef.current && socketRef.current.connected) {
            console.log('Emitting request_tech_question event');
            // Request next question from server without specifying question number
            socketRef.current.emit('request_tech_question', {
                email,
                tech_role,
                tech_stack
            });

            // Set a timeout to show error if server doesn't respond
            setTimeout(() => {
                if (loading && isTransitioning) {
                    console.log('No response from server after timeout');
                    setError('Server is taking too long to respond. Please try again or contact support.');
                    setLoading(false);
                    setIsTransitioning(false);
                }
            }, 10000);
        } else {
            console.log('Socket not connected');
            setError('Not connected to server. Please refresh the page and try again.');
            setLoading(false);
            setIsTransitioning(false);
        }
    };

    const submitAnswer = () => {
        // Validate if any content has been provided
        if (!answer.trim() && !codeSolution.trim()) {
            alert('Please provide an answer or code solution before submitting.');
            return;
        }

        // Stop speech recognition if it's active
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        setSubmitting(true);
        setError(null);

        if (socketRef.current && socketRef.current.connected) {
            console.log('Emitting send_tech_answer event with:', {
                email,
                questionId: currentQuestion.id || `question-${questionNumber}`,
                techQuestion: currentQuestion.question,
                answer,
                codeSolution
            });

            // Send answer to server
            socketRef.current.emit('send_tech_answer', {
                email,
                questionId: currentQuestion.id || `question-${questionNumber}`,
                techQuestion: currentQuestion.question,
                answer,
                codeSolution,
                overAllEmotion
            }, (acknowledgement) => {
                console.log('Server acknowledged answer submission:', acknowledgement);
            });

            // Set timeout for server response
            setTimeout(() => {
                if (submitting) {
                    console.log('No feedback received after timeout');
                    setError('Server is taking too long to provide feedback. Please try again or contact support.');
                    setSubmitting(false);
                }
            }, 15000);
        } else {
            console.log('Socket not connected');
            setError('Not connected to server. Please refresh the page and try again.');
            setSubmitting(false);
        }
    };

    const handleNextQuestion = () => {
        // If we're at the final question, mark as complete
        if (questionNumber > totalQuestions) {
            setInterviewComplete(true);
        } else {
            requestNextQuestion();
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Hard': return 'bg-red-100 text-red-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    useEffect(() => {

        if (questionNumber > totalQuestions) setInterviewComplete(true)
    }, [questionNumber])
    if (interviewComplete) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-center">Technical Interview Complete!</h1>
                        <p className="text-gray-600 text-center">
                            Congratulations! You have completed all technical interview questions.
                            Check your feedback in the results section.
                        </p>
                        <button
                            className="px-6 py-3 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => window.location.href = `/tech_interview_complete?email=${email}`}
                        >
                            View Results
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 py-2 mt-4">
                <div className="max-w-7xl mx-auto px-2">
                    {/* Header */}
                    {/* <div className="mb-6 bg-white p-6 rounded-lg shadow">
                    <h1 className="text-2xl font-bold text-gray-800">Technical Interview Simulation</h1>
                    <p className="text-gray-600">
                        Role: <span className="font-medium">{tech_role}</span> •
                        Stack: <span className="font-medium">{tech_stack}</span> •
                        Email: <span className="font-medium">{email}</span>
                    </p>
                </div> */}

                    {/* Progress Bar */}
                    <div className="mb-6 bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">Question {questionNumber} of {totalQuestions}</span>
                            <span>{Math.round((questionNumber / totalQuestions) * 100)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start shadow">
                            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Error</p>
                                <p className="text-sm">{error}</p>
                                <button
                                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                                <div className="text-gray-600">Loading question...</div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Question and Pre-Question Text */}
                            <div className="space-y-6">
                                {/* Pre-Question Section */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    {/* <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming Question</h3>
                                <p className="text-gray-700">
                                    This section will show details related to upcoming questions or additional context before you attempt the question.
                                </p> */}

                                    <Emotion socketRef={socketRef} />
                                </div>

                                {/* Current Question Section */}
                                {currentQuestion && (
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-semibold text-gray-800">Question {questionNumber}</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                                                {currentQuestion.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-lg">{currentQuestion.question}</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Answer and Post-Answer Sections */}
                            <div className="space-y-6">
                                {/* Current Answer Section */}
                                {currentQuestion && (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium text-gray-800">Your Answer</h3>
                                                {!currentQuestion.code_snippet && (
                                                    <div className="flex items-center">
                                                        <button
                                                            className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} hover:opacity-80 focus:outline-none`}
                                                            onClick={toggleListening}
                                                            title={isListening ? "Stop Voice Recognition" : "Start Voice Recognition"}
                                                        >
                                                            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Code snippet if present
                                        {currentQuestion.code_snippet && (
                                            <div className="bg-gray-50 p-4 rounded-md mb-4 overflow-x-auto border border-gray-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-sm font-medium text-gray-500">Code Snippet</h3>
                                                </div>
                                                <pre className="text-sm text-gray-800 font-mono">
                                                    <code>{currentQuestion.code_snippet}</code>
                                                </pre>
                                            </div>
                                        )} */}

                                            {/* Textual Answer Section */}
                                            {(!currentQuestion.code_snippet || currentQuestion.code_snippet === '') && (
                                                <div className="mb-4 relative">
                                                    <textarea
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                        rows="8"
                                                        value={answer}
                                                        onChange={(e) => setAnswer(e.target.value)}
                                                        placeholder="Type your answer here or start speaking..."
                                                        disabled={submitting}
                                                    ></textarea>

                                                    {isListening && (
                                                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                                                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                                                            Listening: {transcript || "Speak now..."}
                                                        </div>
                                                    )}

                                                    <div className="mt-4">
                                                        <button
                                                            className={`flex items-center ${showCodeEditor ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-700 focus:outline-none px-3 py-1 rounded-md border ${showCodeEditor ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                                            onClick={() => setShowCodeEditor(!showCodeEditor)}
                                                            type="button"
                                                        >
                                                            <Code className="w-4 h-4 mr-1" />
                                                            {showCodeEditor ? 'Hide Code Editor' : 'Add Code Solution'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Code Editor Section */}
                                            {(showCodeEditor || currentQuestion.code_snippet) && (
                                                <div className={!currentQuestion.code_snippet ? "mt-4" : ""}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-md font-medium text-gray-700">
                                                            {currentQuestion.code_snippet ? 'Your Code Solution' : 'Code Solution (optional)'}
                                                        </h4>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-md border border-gray-200">
                                                        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                                                            <span className="text-xs font-medium text-gray-600">code.js</span>
                                                        </div>
                                                        <textarea
                                                            className="w-full px-4 py-3 bg-gray-50 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none border-none"
                                                            rows="10"
                                                            value={codeSolution}
                                                            onChange={(e) => setCodeSolution(e.target.value)}
                                                            placeholder={currentQuestion.code_snippet ? "// Write your implementation here" : "// Add your code solution here..."}
                                                            disabled={submitting}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show conceptual answer field for code questions too */}
                                            {currentQuestion.code_snippet && (
                                                <div className="mt-4">
                                                    <h4 className="text-md font-medium text-gray-700 mb-2">Explanation (optional)</h4>
                                                    <textarea
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                        rows="4"
                                                        value={answer}
                                                        onChange={(e) => setAnswer(e.target.value)}
                                                        placeholder="Explain your approach and solution..."
                                                        disabled={submitting}
                                                    ></textarea>
                                                </div>
                                            )}

                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                                                    onClick={submitAnswer}
                                                    disabled={submitting}
                                                    type="button"
                                                >
                                                    {submitting ? 'Submitting...' : 'Submit Answer'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Post-Answer Section */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">After Submission</h3>
                                    <p className="text-gray-700">
                                        This section will display feedback or additional information after you submit your answer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TechnicalInterview;