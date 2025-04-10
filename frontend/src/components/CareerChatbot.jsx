import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send, User, Bot, RotateCcw, ThumbsUp, ThumbsDown, PanelRightOpen } from 'lucide-react';
import { context } from '../context/Context';

const CareerChatbot = ({ summary, setSummary }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'bot',
            content: 'Hello! I can answer your questions about career paths. What would you like to know?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [theme, setTheme] = useState('default'); // 'default', 'dark', 'light'
    const { email } = useContext(context) // Default email or get from user session
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // API endpoint for the chatbot
    const API_URL = 'http://localhost:2000/api/chat';

    useEffect(() => {

        async function getSummary() {
            try {
                const res = await fetch(`http://localhost:2000/api/summary/${email}`);
                const data = await res.json()

                setSummary(data.summary)
            } catch (error) {

            }
        }

        getSummary();
    }, [])

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        console.log("enter in chatbot")
    }, [messages]);

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if (input.trim() === '') return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Make API call to the backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    message: input,
                    summary: summary
                }),
            });

            const data = await response.json();

            if (data.success) {
                const botMessage = {
                    id: messages.length + 2,
                    role: 'bot',
                    content: data.response
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                id: messages.length + 2,
                role: 'bot',
                content: 'Sorry, I encountered an error communicating with the server. Please try again later.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = async () => {
        setMessages([{
            id: 1,
            role: 'bot',
            content: 'Hello! I can answer your questions about career paths. What would you like to know?'
        }]);

        // Optional: Clear chat history on the server
        try {
            await fetch(`http://localhost:2000/api/chat/history/${email}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to clear chat history on server:', error);
        }
    };

    const toggleTheme = () => {
        if (theme === 'default') setTheme('dark');
        else if (theme === 'dark') setTheme('light');
        else setTheme('default');
    };

    // Get theme colors
    const getThemeClasses = () => {
        switch (theme) {
            case 'dark':
                return {
                    container: 'bg-gray-900 border-gray-700',
                    header: 'bg-purple-900 text-white',
                    messageArea: 'bg-gray-800',
                    userBubble: 'bg-purple-600 text-white',
                    botBubble: 'bg-gray-700 text-white border-gray-600',
                    input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
                    button: 'bg-purple-600 hover:bg-purple-700 text-white',
                    iconBg: 'bg-purple-700'
                };
            case 'light':
                return {
                    container: 'bg-white border-gray-200',
                    header: 'bg-purple-100 text-purple-800',
                    messageArea: 'bg-gray-50',
                    userBubble: 'bg-purple-200 text-purple-900',
                    botBubble: 'bg-white text-gray-800 border-gray-200',
                    input: 'bg-white border-gray-300 text-gray-800 placeholder-gray-500',
                    button: 'bg-purple-400 hover:bg-purple-500 text-white',
                    iconBg: 'bg-purple-300'
                };
            default:
                return {
                    container: 'bg-white border-purple-200',
                    header: 'bg-purple-700 text-white',
                    messageArea: 'bg-purple-50',
                    userBubble: 'bg-purple-600 text-white',
                    botBubble: 'bg-white text-gray-800 border-purple-100',
                    input: 'bg-white border-purple-300 text-gray-800 placeholder-purple-400',
                    button: 'bg-purple-600 hover:bg-purple-700 text-white',
                    iconBg: 'bg-purple-500'
                };
        }
    };

    const themeClasses = getThemeClasses();

    // Handle example questions
    const handleExampleQuestion = (question) => {
        setInput(question);
        inputRef.current?.focus();
    };

    return (
        <div className={`flex flex-col h-screen sm:h-[600px] w-full max-w-lg rounded-lg border shadow-lg overflow-hidden transition-all duration-300 ${themeClasses.container}`}>
            {/* Header */}
            <div className={`px-4 py-3 flex justify-between items-center ${themeClasses.header}`}>
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${themeClasses.iconBg}`}>
                        <Bot size={20} className="text-white" />
                    </div>
                    <span className="font-medium text-lg">Career Compass</span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={toggleTheme}
                        className="p-1 rounded-full hover:bg-purple-800/20 transition-colors"
                        title="Change theme"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-300 to-purple-600"></div>
                    </button>
                    <button
                        onClick={clearChat}
                        className="p-1 rounded-full hover:bg-purple-800/20 transition-colors"
                        title="Clear chat"
                    >
                        <RotateCcw size={20} className="text-purple-100" />
                    </button>
                    <button
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                        className="p-1 rounded-full hover:bg-purple-800/20 transition-colors"
                        title="Toggle info panel"
                    >
                        <PanelRightOpen size={20} className="text-purple-100" />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main chat area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className={`flex-1 p-4 overflow-y-auto ${themeClasses.messageArea}`}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                            >
                                <div className={`flex items-start max-w-xs md:max-w-md ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.role === 'user' ? `${themeClasses.iconBg} ml-2` : 'bg-gray-300 mr-2'
                                        }`}>
                                        {message.role === 'user' ?
                                            <User size={16} className="text-white" /> :
                                            <Bot size={16} className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
                                        }
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg shadow-sm ${message.role === 'user'
                                        ? `${themeClasses.userBubble} rounded-tr-none`
                                        : `${themeClasses.botBubble} rounded-tl-none`
                                        }`}>
                                        {message.content}

                                        {message.role === 'bot' && (
                                            <div className="flex items-center justify-end mt-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 rounded-full hover:bg-gray-200/30 transition-colors">
                                                    <ThumbsUp size={12} className="text-gray-400" />
                                                </button>
                                                <button className="p-1 rounded-full hover:bg-gray-200/30 transition-colors">
                                                    <ThumbsDown size={12} className="text-gray-400" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex mb-4 justify-start animate-fadeIn">
                                <div className="flex items-start max-w-xs md:max-w-md">
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-300 mr-2`}>
                                        <Bot size={16} className={theme === 'dark' ? 'text-white' : 'text-gray-700'} />
                                    </div>
                                    <div className={`px-4 py-3 rounded-lg ${themeClasses.botBubble} rounded-tl-none`}>
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-purple-200">
                        <div className="flex items-center">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about career paths..."
                                className={`flex-1 border rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-12 max-h-32 overflow-y-auto transition-colors ${themeClasses.input}`}
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || input.trim() === ''}
                                className={`rounded-r-lg p-3 h-12 transition-all ${isLoading || input.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''
                                    } ${themeClasses.button}`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="text-xs text-center mt-2 text-purple-500">
                            Press Enter to send, Shift+Enter for new line
                        </div>
                    </div>
                </div>

                {/* Side panel */}
                {isPanelOpen && (
                    <div className="w-56 border-l border-purple-200 animate-slideIn bg-purple-50 p-4 flex flex-col">
                        <h3 className="font-medium text-purple-800 mb-3">Popular Questions</h3>
                        <div className="space-y-2">
                            {['How to prepare for interviews?', 'What skills should I learn?', 'Career transition tips?', 'Resume advice'].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleExampleQuestion(q)}
                                    className="text-sm text-left p-2 rounded-md hover:bg-purple-100 text-purple-700 w-full transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                        <div className="mt-auto">
                            <h3 className="font-medium text-purple-800 mb-2">Resources</h3>
                            <div className="space-y-1 text-xs">
                                <div className="p-2 bg-white rounded-md shadow-sm text-purple-700">
                                    <strong>Resume Templates</strong>
                                    <p className="text-gray-500">Professional templates for job seekers</p>
                                </div>
                                <div className="p-2 bg-white rounded-md shadow-sm text-purple-700">
                                    <strong>Interview Guide</strong>
                                    <p className="text-gray-500">Ace your next interview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CareerChatbot;