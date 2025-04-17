import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Pause, Play } from 'lucide-react';

const SpeakingPaceIndicator = ({
    userTranscript = '',
    interimTranscript = '',
    isInterviewInProgress = true,
    resetTrigger = null // Prop to trigger reset
}) => {
    // State to track speaking metrics
    const [wordCount, setWordCount] = useState(0);
    const [duration, setDuration] = useState(0);
    const [wordsPerMinute, setWordsPerMinute] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    
    // Use ref to track the current transcript including interim results
    const currentTranscriptRef = useRef('');
    
    // Reset effect triggered by resetTrigger prop
    useEffect(() => {
        if (resetTrigger !== null) {
            setWordCount(0);
            setDuration(0);
            setWordsPerMinute(0);
            setIsRecording(false);
            currentTranscriptRef.current = '';
        }
    }, [resetTrigger]);

    // Update word count when transcript changes
    useEffect(() => {
        // Combine user transcript with interim for live word counting
        currentTranscriptRef.current = userTranscript + ' ' + (interimTranscript || '');
        
        // Count words in the combined transcript
        const words = currentTranscriptRef.current.trim().split(/\s+/);
        const filteredWords = words.filter(word => word.length > 0);
        setWordCount(filteredWords.length);
    }, [userTranscript, interimTranscript]);

    // Handle recording state based on interview progress
    useEffect(() => {
        setIsRecording(isInterviewInProgress);
    }, [isInterviewInProgress]);

    // Timer effect - separate from WPM calculation
    useEffect(() => {
        let intervalId;
        if (isInterviewInProgress) {
            setIsRecording(true);
            intervalId = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            setIsRecording(false);
        }

        return () => clearInterval(intervalId);
    }, [isInterviewInProgress]);

    // Calculate WPM separately when duration or wordCount changes
    useEffect(() => {
        if (duration > 0) {
            const wpm = Math.floor((wordCount / duration) * 60);
            setWordsPerMinute(wpm);
        }
    }, [duration, wordCount]);

    // Pace categories
    const getPaceCategory = (wpm) => {
        if (wpm < 100) return {
            label: 'Slow',
            color: 'bg-yellow-500',
            description: 'Speaking too deliberately'
        };
        if (wpm < 150) return {
            label: 'Moderate',
            color: 'bg-green-500',
            description: 'Ideal conversational pace'
        };
        if (wpm < 200) return {
            label: 'Brisk',
            color: 'bg-blue-500',
            description: 'Energetic and engaging'
        };
        return {
            label: 'Very Fast',
            color: 'bg-red-500',
            description: 'Risk of losing clarity'
        };
    };

    // Current pace category
    const paceCategory = getPaceCategory(wordsPerMinute);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mt-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Speaking Pace Analyzer</h2>
                {isInterviewInProgress && (
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-600">{isRecording ? 'Recording' : 'Paused'}</span>
                    </div>
                )}
            </div>

            {/* Pace Visualization */}
            <div className="mb-4">
                <div className="flex items-center space-x-4">
                    <Volume2 className="text-gray-600" />
                    <div className="flex-grow bg-gray-200 rounded-full h-4 relative">
                        <div
                            className={`absolute left-0 top-0 bottom-0 rounded-full ${paceCategory.color}`}
                            style={{
                                width: `${Math.min(wordsPerMinute, 250) / 2.5}%`,
                                transition: 'width 0.5s ease-in-out'
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Metrics Display */}
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-600">Words</p>
                    <p className="font-bold">{wordCount}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">WPM</p>
                    <p className="font-bold">{wordsPerMinute}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Pace</p>
                    <p className={`font-bold ${paceCategory.color.replace('bg-', 'text-')}`}>
                        {paceCategory.label}
                    </p>
                </div>
            </div>

            {/* Detailed Pace Description */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                    <span className="font-semibold">Status:</span> {paceCategory.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Ideal interview pace is typically 125-150 words per minute
                </p>
            </div>
        </div>
    );
};

export default SpeakingPaceIndicator;