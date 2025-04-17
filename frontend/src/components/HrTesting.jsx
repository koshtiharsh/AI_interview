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
    const [conversationHistory, setConversationHistory] = useState([]);
    const [userQuery, setUserQuery] = useState('');
    const [isQueryMode, setIsQueryMode] = useState(false);
    const [queryResponse, setQueryResponse] = useState('');
    const [isProcessingQuery, setIsProcessingQuery] = useState(false);
    const [autoSubmitTimer, setAutoSubmitTimer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes per question
    const [isPaused, setIsPaused] = useState(false);

    const { overAllEmotion, setOverAllEmotion, email, tech_stack } = useContext(context);

    // Track when we're transitioning between questions
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Use useRef for socket connection and SpeechRecognition
    const socketRef = useRef(null);
    const socketInitialized = useRef(false);
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);

    // LLM endpoint for questions and clarifications
    const LLM_ENDPOINT = "http://localhost:2000/api/llm";

    // Function to speak text using the Web Speech API
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

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

                // Check if the user asked a question (contains keywords like "can you", "how", "what", "why", etc.)
                const questionKeywords = ["can you", "how", "what", "why", "could you", "explain", "tell me", "help"];
                if (finalTranscript && questionKeywords.some(keyword => finalTranscript.toLowerCase().includes(keyword))) {
                    handleUserQuery(finalTranscript);
                } else {
                    // Automatically update answer with transcript
                    setAnswer(prev => prev + finalTranscript);
                }

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

    // Initialize countdown timer
    useEffect(() => {
        if (currentQuestion && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        // Auto-submit when time runs out
                        if (!submitting) submitAnswer();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentQuestion, isPaused]);

    // Format time for display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    const toggleListening = () => {
        if (isListening) {
            // If currently listening, stop the recognition
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
        } else {
            // If not listening, start the recognition
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (error) {
                    console.error('Failed to start speech recognition:', error);
                }
            }
        }
    };
    // Auto-start speech recognition and speaking the question
    useEffect(() => {
        if (currentQuestion && !isTransitioning) {
            // Speak the question aloud
            speakText(currentQuestion.question);

            // Auto-start speech recognition
            if (recognitionRef.current && !isListening) {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (error) {
                    console.error('Failed to start speech recognition:', error);
                }
            }

            // Update conversation history
            setConversationHistory(prev => [
                ...prev,
                { role: 'system', content: currentQuestion.question }
            ]);

            // Set auto-submit timer (2 minutes per question)
            setTimeRemaining(120);
        }
    }, [currentQuestion]);

    // Handle user queries through LLM
    const handleUserQuery = async (query) => {
        // Pause timer while handling query
        setIsPaused(true);

        // Stop speech recognition temporarily
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        setIsQueryMode(true);
        setUserQuery(query);
        setIsProcessingQuery(true);

        try {
            // Add user query to conversation history
            const updatedHistory = [
                ...conversationHistory,
                { role: 'user', content: query }
            ];

            setConversationHistory(updatedHistory);

            // Prepare context for the LLM
            const context = {
                question: currentQuestion.question,
                questionNumber: questionNumber,
                totalQuestions: totalQuestions,
                tech_role: tech_role,
                tech_stack: tech_stack,
                difficulty: currentQuestion.difficulty,
                conversation_history: updatedHistory
            };

            // Make API call to LLM
            const response = await fetch(LLM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: query,
                    context: context
                }),
            });

            if (!response.ok) {
                throw new Error(`LLM request failed with status ${response.status}`);
            }

            const data = await response.json();
            const llmResponse = data.response || 'Sorry, I couldn\'t process your query.';

            // Add LLM response to conversation history
            setConversationHistory(prev => [...prev, { role: 'assistant', content: llmResponse }]);

            // Display and speak the response
            setQueryResponse(llmResponse);
            speakText(llmResponse);

        } catch (error) {
            console.error('Error processing query:', error);
            const errorMsg = 'Sorry, I encountered an error processing your question. Please try again.';
            setQueryResponse(errorMsg);
            speakText(errorMsg);
        } finally {
            setIsProcessingQuery(false);

            // Resume timer and speech recognition after a delay to allow the user to hear the response
            setTimeout(() => {
                setIsQueryMode(false);
                setIsPaused(false);

                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                        setIsListening(true);
                    } catch (error) {
                        console.error('Failed to restart speech recognition:', error);
                    }
                }
            }, 5000);
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
                    setInterviewComplete(true);
                }

                // Automatically show code editor if the question has a code snippet
                if (data.code_snippet) {
                    setShowCodeEditor(true);
                }

                // Reset timer and conversation for new question
                setTimeRemaining(120);
                setConversationHistory([
                    { role: 'system', content: data.question }
                ]);
            });

            socketRef.current.on('tech_answer_feedback', (data) => {
                console.log('Received feedback:', data);
                console.log(`Current question: ${questionNumber}, Total questions: ${totalQuestions}`);
                setSubmitting(false);
                setOverAllEmotion([]);

                // Add feedback to conversation history
                if (data.feedback) {
                    setConversationHistory(prev => [
                        ...prev,
                        { role: 'system', content: `Feedback: ${data.feedback}` }
                    ]);

                    // Speak the feedback
                    speakText(`Feedback: ${data.feedback}`);
                }

                // More explicit condition with debug info
                if (questionNumber >= totalQuestions) {
                    console.log('Setting interview complete to true');
                    setInterviewComplete(true);
                } else {
                    console.log('Proceeding to next question');
                    // Auto-proceed to next question after a delay
                    setTimeout(() => {
                        handleNextQuestion();
                    }, 5000);
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
                if (timerRef.current) {
                    clearInterval(timerRef.current);
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
        setConversationHistory([]);
        setTimeRemaining(120);

        // Reset query state
        setIsQueryMode(false);
        setUserQuery('');
        setQueryResponse('');

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
        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
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

            // Add answer to conversation history
            setConversationHistory(prev => [
                ...prev,
                {
                    role: 'user',
                    content: answer + (codeSolution ? `\n\nCode Solution:\n${codeSolution}` : '')
                }
            ]);

            // Send answer to server
            socketRef.current.emit('send_tech_answer', {
                email,
                questionId: currentQuestion.id || `question-${questionNumber}`,
                techQuestion: currentQuestion.question,
                answer,
                codeSolution,
                overAllEmotion,
                conversationHistory: conversationHistory
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
        if (questionNumber >= totalQuestions) {
            setInterviewComplete(true);
        } else {
            requestNextQuestion();
        }
    };

    // Auto-submit when timer runs out
    useEffect(() => {
        if (timeRemaining === 0 && !submitting && currentQuestion) {
            submitAnswer();
        }
    }, [timeRemaining]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Hard': return 'bg-red-100 text-red-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    useEffect(() => {
        if (questionNumber > totalQuestions) setInterviewComplete(true);
    }, [questionNumber]);

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
                    {/* Progress Bar */}
                    <div className="mb-6 bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">Question {questionNumber} of {totalQuestions}</span>
                            <span className="flex items-center">
                                <span className={`font-medium mr-2 ${timeRemaining < 30 ? 'text-red-600' : ''}`}>
                                    Time: {formatTime(timeRemaining)}
                                </span>
                                •
                                <span className="ml-2">{Math.round((questionNumber / totalQuestions) * 100)}% Complete</span>
                            </span>
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

                    {/* LLM Query Response Modal */}
                    {isQueryMode && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Question</h3>
                                <p className="text-gray-700 mb-4">{userQuery}</p>

                                <h3 className="text-lg font-medium text-gray-900 mb-2">Response</h3>
                                {isProcessingQuery ? (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                                        <span>Processing your question...</span>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 mb-6">{queryResponse}</p>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        onClick={() => {
                                            setIsQueryMode(false);
                                            setIsPaused(false);

                                            // Resume speech recognition
                                            if (recognitionRef.current && !isListening) {
                                                try {
                                                    recognitionRef.current.start();
                                                    setIsListening(true);
                                                } catch (error) {
                                                    console.error('Failed to restart speech recognition:', error);
                                                }
                                            }
                                        }}
                                        disabled={isProcessingQuery}
                                    >
                                        Continue Interview
                                    </button>
                                </div>
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

                                {/* Conversation History */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-800">Conversation History</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {conversationHistory.map((msg, index) => (
                                            <div key={index} className={`mb-3 p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-50 ml-8' :
                                                msg.role === 'assistant' ? 'bg-green-50 mr-8' : 'bg-gray-50'
                                                }`}>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {msg.role === 'user' ? 'You' :
                                                        msg.role === 'assistant' ? 'Assistant' : 'System'}
                                                </p>
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600">
                                            Say "Can you help me with..." or "Explain..." to ask a question during the interview.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Answer and Post-Answer Sections */}
                            <div className="space-y-6">
                                {/* Current Answer Section */}
                                {currentQuestion && (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium text-gray-800">Your Answer</h3>
                                                <div className="flex items-center">
                                                    {!isTransitioning && (
                                                        <button
                                                            className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} hover:opacity-80 focus:outline-none mr-2`}
                                                            onClick={toggleListening}
                                                            title={isListening ? "Stop Voice Recognition" : "Start Voice Recognition"}
                                                        >
                                                            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:opacity-80 focus:outline-none"
                                                        onClick={() => setIsPaused(!isPaused)}
                                                        title={isPaused ? "Resume Timer" : "Pause Timer"}
                                                    >
                                                        {isPaused ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Textual Answer Section */}
                                            <div className="mb-4 relative">
                                                <textarea
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    rows="8"
                                                    value={answer}
                                                    onChange={(e) => setAnswer(e.target.value)}
                                                    placeholder="Start speaking to answer or type here..."
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

                                            {/* Code Editor Section */}
                                            {showCodeEditor && (
                                                <div className="mt-4">
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

                                {/* Interview Instructions Panel */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Interview Instructions</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            <span>Speak naturally to answer questions - your voice will be transcribed automatically.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            <span>Ask for clarification by saying "Can you explain..." or "What does...mean?"</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            <span>You have {Math.floor(timeRemaining / 60)} minutes to answer each question before automatic submission.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            <span>For coding questions, use the code editor to provide your solution.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            <span>You can pause the timer if you need a short break.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Speech Commands Helper Panel */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Useful Voice Commands</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">"Can you explain this question?"</p>
                                            <p className="text-xs text-gray-500">Get clarification on the current question</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">"What does [term] mean?"</p>
                                            <p className="text-xs text-gray-500">Ask about a specific term</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">"How much time do I have left?"</p>
                                            <p className="text-xs text-gray-500">Check your remaining time</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">"Help me with this problem"</p>
                                            <p className="text-xs text-gray-500">Get a hint for the current question</p>
                                        </div>
                                    </div>
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