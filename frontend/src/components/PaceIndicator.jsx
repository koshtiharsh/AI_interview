import React, { useState, useEffect } from 'react';
import { Volume2, Pause, Play } from 'lucide-react';

const SpeakingPaceIndicator = ({
    userTranscript = '',
    isInterviewInProgress = true,
    resetTrigger = null // New prop to trigger reset
}) => {
    // State to track speaking metrics
    const [wordCount, setWordCount] = useState(0);
    const [duration, setDuration] = useState(0);
    const [wordsPerMinute, setWordsPerMinute] = useState(0);
    const [isRecording, setIsRecording] = useState(false);

    // Reset effect triggered by resetTrigger prop
    useEffect(() => {
        // Reset all metrics when resetTrigger changes
        if (resetTrigger !== null) {
            setWordCount(0);
            setDuration(0);
            setWordsPerMinute(0);
            setIsRecording(false);
        }
    }, [resetTrigger]);

    // Update word count when transcript changes
    useEffect(() => {
        // Count words in the transcript
        const words = userTranscript.trim().split(/\s+/);
        const filteredWords = words.filter(word => word.length > 0);
        setWordCount(filteredWords.length);
    }, [userTranscript]);

    // Track duration and calculate WPM
    useEffect(() => {
        let intervalId;
        if (isInterviewInProgress) {
            intervalId = setInterval(() => {
                setDuration(prev => prev + 1);

                // Calculate words per minute
                const wpm = duration > 0
                    ? Math.floor((wordCount / duration) * 60)
                    : 0;
                setWordsPerMinute(wpm);
            }, 1000);
        }

        return () => clearInterval(intervalId);
    }, [isInterviewInProgress, wordCount, duration]);

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
                {/* Optional recording toggle, now controlled by interview progress */}
                {/* {isInterviewInProgress && (
                    <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-2 rounded-full ${isRecording
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                            } text-white transition`}
                    >
                        {isRecording ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                )} */}
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

            {/* Transcript Preview */}
            {/* <div className="mt-4 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-700 italic">
                    {userTranscript || "No transcript available"}
                </p>
            </div> */}
        </div>
    );
};

export default SpeakingPaceIndicator;