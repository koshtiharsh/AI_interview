import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Waves } from 'lucide-react';

const BackgroundNoiseDetector = ({ onNoiseUpdate }) => {
    const [isListening, setIsListening] = useState(false);
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [noiseLevelCategory, setNoiseLevelCategory] = useState({
        label: 'Quiet',
        color: 'bg-green-500',
        description: 'Minimal background noise'
    });

    // Refs for audio context and analysis
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Noise level categorization (same as previous implementation)
    const getNoiseLevelCategory = (level) => {
        if (level < 20) return {
            label: 'Quiet',
            color: 'bg-green-500',
            description: 'Minimal background noise'
        };
        if (level < 40) return {
            label: 'Low',
            color: 'bg-yellow-500',
            description: 'Slight background noise'
        };
        if (level < 60) return {
            label: 'Moderate',
            color: 'bg-orange-500',
            description: 'Noticeable background noise'
        };
        return {
            label: 'High',
            color: 'bg-red-500',
            description: 'Significant background noise'
        };
    };

    // Start noise detection
    const startNoiseDetection = async (existingStream = null) => {
        try {
            // Use existing stream if provided, otherwise request microphone access
            const stream = existingStream || await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            // Create analyser node
            const analyser = audioContext.createAnalyser();
            analyserRef.current = analyser;
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.85;

            // Create source from microphone stream
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            // Analyze noise levels
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateNoiseLevel = () => {
                analyser.getByteFrequencyData(dataArray);

                // Calculate average noise level
                const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
                const normalizedLevel = Math.min(100, (average / 255) * 100);

                const currentNoiseLevel = Math.round(normalizedLevel);
                const currentNoiseLevelCategory = getNoiseLevelCategory(currentNoiseLevel);

                setNoiseLevel(currentNoiseLevel);
                setNoiseLevelCategory(currentNoiseLevelCategory);

                // Call onNoiseUpdate prop if provided
                if (onNoiseUpdate) {
                    onNoiseUpdate({
                        level: currentNoiseLevel,
                        category: currentNoiseLevelCategory
                    });
                }

                // Continue animation
                animationFrameRef.current = requestAnimationFrame(updateNoiseLevel);
            };

            // Start analysis
            updateNoiseLevel();
            setIsListening(true);

            return stream;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            return null;
        }
    };

    // Stop noise detection
    const stopNoiseDetection = () => {
        // Cancel animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Stop microphone stream
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        // Reset states
        setIsListening(false);
        setNoiseLevel(0);
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopNoiseDetection();
        };
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                    <Waves className="mr-2" /> Background Noise Detector
                </h2>
                <button
                    onClick={isListening ? stopNoiseDetection : startNoiseDetection}
                    className={`p-2 rounded-full ${isListening
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                        } text-white transition`}
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
            </div>

            {/* Noise Level Visualization */}
            <div className="mb-4">
                <div className="flex items-center space-x-4">
                    <Volume2 className="text-gray-600" />
                    <div className="flex-grow bg-gray-200 rounded-full h-4 relative">
                        <div
                            className={`absolute left-0 top-0 bottom-0 rounded-full ${noiseLevelCategory.color}`}
                            style={{
                                width: `${noiseLevel}%`,
                                transition: 'width 0.5s ease-in-out'
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Metrics Display */}
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-600">Noise Level</p>
                    <p className="font-bold">{noiseLevel}%</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-bold ${noiseLevelCategory.color.replace('bg-', 'text-')}`}>
                        {noiseLevelCategory.label}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Impact</p>
                    <p className="text-gray-700">
                        {noiseLevelCategory.description}
                    </p>
                </div>
            </div>

            {/* Detailed Noise Description */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                    <span className="font-semibold">Recommendation:</span>
                    {noiseLevelCategory.label === 'High'
                        ? ' Consider finding a quieter environment for your interview.'
                        : ' Background noise looks good for your interview.'}
                </p>
            </div>
        </div>
    );
};

export default BackgroundNoiseDetector;