import { useState, useEffect } from 'react';
import { AlertTriangle, Smile, Frown, Meh, Info } from 'lucide-react';

export default function InterviewEmotionTips() {
    const [emotionData, setEmotionData] = useState([]);
    const [emotionCounts, setEmotionCounts] = useState({});
    const [topEmotions, setTopEmotions] = useState([]);
    const [tips, setTips] = useState({});
    const [currentTips, setCurrentTips] = useState({});

    // Emotion tips database
    const emotionTips = {
        Surprised: [
            "The interviewer seems surprised. Clarify complex points and provide context.",
            "Your unique perspective is getting noticed! Continue sharing distinctive insights.",
            "The interviewer may be intrigued. Maintain engagement with specific examples.",
            "Your responses are creating interest. Connect these points to job requirements."
        ],
        Neutral: [
            "The interviewer appears neutral. Add more energy to your responses.",
            "Consider using more specific examples to make your points more impactful.",
            "Try asking a thoughtful question to increase engagement.",
            "Focus on clear communication of your skills and experience."
        ],
        Happy: [
            "Your answers are resonating positively! Continue with this approach.",
            "The interviewer seems pleased. Maintain your enthusiasm and positive energy.",
            "You're making a good impression. Connect your experience to the role.",
            "Your positive energy works well. Keep connecting to company values."
        ],
        Fearful: [
            "The interviewer may have concerns. Address potential doubts directly.",
            "Reassure by focusing on solutions and positive outcomes from your experience.",
            "Share concrete examples that demonstrate your capability to handle challenges.",
            "Speak with more confidence and emphasize your reliable track record."
        ]
    };

    // Simulate data updates (in your app, replace with actual data fetching)
    useEffect(() => {
        const sampleData = [
            { time: 1744456584010, emotion: "Surprised" },
            { time: 1744456584018, emotion: "Neutral" },
            { time: 1744456589526, emotion: "Happy" },
            { time: 1744456589527, emotion: "Fearful" },
        ];

        setEmotionData(sampleData);

        // Simulate real-time updates
        const intervalId = setInterval(() => {
            const emotions = ["Surprised", "Neutral", "Happy", "Fearful"];
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

            setEmotionData(prev => [
                ...prev,
                { time: Date.now(), emotion: randomEmotion }
            ]);
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    // Update emotion counts when data changes
    useEffect(() => {
        const counts = emotionData.reduce((acc, item) => {
            acc[item.emotion] = (acc[item.emotion] || 0) + 1;
            return acc;
        }, {});

        setEmotionCounts(counts);

        // Determine top 3 emotions
        const sortedEmotions = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);

        // Only update topEmotions if the members have changed (not just order)
        const currentSet = new Set(topEmotions);
        const newSet = new Set(sortedEmotions);

        // Check if the sets are different
        let isDifferent = topEmotions.length !== sortedEmotions.length;
        if (!isDifferent) {
            for (const emotion of sortedEmotions) {
                if (!currentSet.has(emotion)) {
                    isDifferent = true;
                    break;
                }
            }
        }

        if (isDifferent) {
            setTopEmotions(sortedEmotions);
        }
    }, [emotionData]);

    // Initialize tips when top emotions change
    useEffect(() => {
        const newTips = {};
        const newCurrentTips = {};

        // Generate tip indices for each emotion
        topEmotions.forEach(emotion => {
            if (emotionTips[emotion]) {
                // Start with a random index for variety
                const randomIndex = Math.floor(Math.random() * emotionTips[emotion].length);
                newTips[emotion] = {
                    currentIndex: randomIndex,
                    tips: emotionTips[emotion]
                };
                newCurrentTips[emotion] = emotionTips[emotion][randomIndex];
            }
        });

        setTips(newTips);
        setCurrentTips(newCurrentTips);
    }, [topEmotions]);

    // Rotate through tips for each emotion independently every 30 seconds
    useEffect(() => {
        if (topEmotions.length === 0) return;

        const tipIntervals = topEmotions.map((emotion, index) => {
            return setInterval(() => {
                if (!tips[emotion] || !tips[emotion].tips) return;

                setTips(prevTips => {
                    const emotionTip = prevTips[emotion];
                    if (!emotionTip) return prevTips;

                    const nextIndex = (emotionTip.currentIndex + 1) % emotionTip.tips.length;

                    // Update current tip text
                    setCurrentTips(prevCurrentTips => ({
                        ...prevCurrentTips,
                        [emotion]: emotionTip.tips[nextIndex]
                    }));

                    // Update the index
                    return {
                        ...prevTips,
                        [emotion]: {
                            ...emotionTip,
                            currentIndex: nextIndex
                        }
                    };
                });
            }, 30000); // 30 seconds
        });

        return () => tipIntervals.forEach(interval => clearInterval(interval));
    }, [tips, topEmotions]);

    // Helper function to get icon by emotion
    const getEmotionIcon = (emotion) => {
        switch (emotion) {
            case 'Happy': return <Smile className="text-green-500" />;
            case 'Fearful': return <AlertTriangle className="text-orange-500" />;
            case 'Surprised': return <Info className="text-blue-500" />;
            case 'Neutral': return <Meh className="text-gray-500" />;
            default: return <Info className="text-gray-500" />;
        }
    };

    // Helper function to get background color by emotion
    const getEmotionBgColor = (emotion) => {
        switch (emotion) {
            case 'Happy': return 'bg-green-50 border-green-400';
            case 'Fearful': return 'bg-orange-50 border-orange-400';
            case 'Surprised': return 'bg-blue-50 border-blue-400';
            case 'Neutral': return 'bg-gray-50 border-gray-400';
            default: return 'bg-gray-50 border-gray-400';
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center">Interview Coach</h2>

            {/* Emotion summary */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                {Object.entries(emotionCounts)
                    .sort((a, b) => {
                        // Top emotions first, then alphabetical
                        const aIsTop = topEmotions.includes(a[0]);
                        const bIsTop = topEmotions.includes(b[0]);
                        if (aIsTop && !bIsTop) return -1;
                        if (!aIsTop && bIsTop) return 1;
                        return a[0].localeCompare(b[0]);
                    })
                    .map(([emotion, count]) => (
                        <div key={emotion} className={`flex items-center p-2 rounded ${topEmotions.includes(emotion) ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                            <div className="mr-2">
                                {getEmotionIcon(emotion)}
                            </div>
                            <div>
                                <span className="font-semibold">{emotion}</span>
                                <span className="ml-2 text-sm text-gray-600">({count})</span>
                            </div>
                        </div>
                    ))}
            </div>

            {/* All top emotion tips */}
            <div className="mb-6 space-y-3">
                <h3 className="text-md font-semibold mb-2">Interview Feedback</h3>

                {topEmotions.map((emotion, index) => (
                    currentTips[emotion] && (
                        <div key={emotion} className={`p-3 rounded border-l-4 ${getEmotionBgColor(emotion)}`}>
                            <div className="flex items-start">
                                <div className="mr-3 mt-1">
                                    {getEmotionIcon(emotion)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-1">{emotion}:</p>
                                    <p className="text-sm">{currentTips[emotion]}</p>
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* Most recent emotions */}
            <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Recent Emotion Trend</h3>
                <div className="flex space-x-1 overflow-x-auto py-1">
                    {emotionData.slice(-10).map((item, index) => (
                        <div key={index} className="flex-shrink-0">
                            {getEmotionIcon(item.emotion)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}