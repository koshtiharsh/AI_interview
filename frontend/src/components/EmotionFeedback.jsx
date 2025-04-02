import React, { useMemo } from 'react';
import {
    Smile,
    Frown,
    Meh,
    Thermometer,
    TrendingUp,
    Zap,
    User
} from 'lucide-react';

// Expanded insight generation helpers
const generateInsightVariations = {
    "Neutral": [
        {
            interpretation: "Professional Composure",
            descriptions: [
                "Demonstrated exceptional self-control and emotional stability throughout the interview.",
                "Maintained a balanced demeanor, showcasing maturity and professional restraint.",
                "Exhibited a calm and collected approach, indicating strong emotional intelligence."
            ],
            professionalImplications: [
                "Suggests ability to handle high-pressure situations with grace",
                "Indicates potential for leadership roles requiring emotional regulation",
                "Demonstrates adaptability in complex professional environments"
            ]
        },
        {
            interpretation: "Strategic Reservedness",
            descriptions: [
                "Maintained a measured emotional response, suggesting strategic thinking.",
                "Displayed a nuanced approach to communication, balancing openness with discretion.",
                "Showed remarkable ability to process information without emotional reactivity."
            ],
            professionalImplications: [
                "Potential strength in roles requiring diplomatic communication",
                "Indicates analytical mindset and careful decision-making",
                "Suggests capability in navigating complex interpersonal dynamics"
            ]
        }
    ],
    "Happy": [
        {
            interpretation: "Vibrant Enthusiasm",
            descriptions: [
                "Radiated genuine excitement and positive energy throughout the interview.",
                "Demonstrated infectious optimism and passion for potential opportunities.",
                "Showed remarkable ability to maintain high spirits and positive outlook."
            ],
            professionalImplications: [
                "Indicates potential as a motivational team player",
                "Suggests strong potential in client-facing or collaborative roles",
                "Demonstrates ability to create positive workplace environments"
            ]
        },
        {
            interpretation: "Authentic Passion",
            descriptions: [
                "Displayed deep genuine enthusiasm that goes beyond surface-level excitement.",
                "Communicated with natural warmth and sincere engagement.",
                "Showed ability to connect emotionally while maintaining professional boundaries."
            ],
            professionalImplications: [
                "Strong potential in roles requiring genuine interpersonal connection",
                "Indicates natural ability to inspire and motivate others",
                "Suggests emotional intelligence and authentic communication skills"
            ]
        }
    ],
    // Similar expansions for other emotions...
};

// Function to randomly select an insight variation
const getRandomInsightVariation = (emotion) => {
    const variations = generateInsightVariations[emotion] || [];
    return variations.length > 0
        ? variations[Math.floor(Math.random() * variations.length)]
        : {
            interpretation: "Unique Emotional Perspective",
            descriptions: ["Displayed a distinctive emotional approach to the interview."],
            professionalImplications: ["Suggests individuality and unique communication style"]
        };
};

const EmotionInsightsFeedback = ({ emotions }) => {
    // Mapping of ML emotions to comprehensive insights with dynamic generation
    const emotionInsights = {
        "Neutral": {
            icon: <Meh className="text-gray-500" size={40} />,
            color: "bg-gray-100",
        },
        "Happy": {
            icon: <Smile className="text-green-500" size={40} />,
            color: "bg-green-50",
        },
        "Surprised": {
            icon: <Zap className="text-yellow-500" size={40} />,
            color: "bg-yellow-50",
        },
        "Fearful": {
            icon: <Thermometer className="text-blue-400" size={40} />,
            color: "bg-blue-50",
        },
        "Sad": {
            icon: <Frown className="text-indigo-500" size={40} />,
            color: "bg-indigo-50",
        },
        "Angry": {
            icon: <TrendingUp className="text-red-500" size={40} />,
            color: "bg-red-50",
        },
        "Disgusted": {
            icon: <User className="text-purple-500" size={40} />,
            color: "bg-purple-50",
        }
    };

    // Use useMemo to generate consistent but dynamic insights per render
    const dynamicInsights = useMemo(() => {
        return Object.entries(emotions)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([emotion, count]) => ({
                emotion,
                count,
                ...emotionInsights[emotion],
                ...getRandomInsightVariation(emotion)
            }));
    }, [emotions]);

    const totalEmotions = dynamicInsights.reduce((sum, insight) => sum + insight.count, 0);

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-100 to-white p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-800">
                    Comprehensive Emotional Intelligence Report
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    Insights derived from advanced emotional analysis
                </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Top Emotions Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Primary Emotional Highlights
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {dynamicInsights.slice(0, 2).map((insight) => (
                            <div
                                key={insight.emotion}
                                className={`${insight.color} border rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow`}
                            >
                                <div className="flex items-center mb-3">
                                    {insight.icon}
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {insight.emotion}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {((insight.count / totalEmotions) * 100).toFixed(1)}% of interactions
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-700">
                                        {insight.interpretation}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {insight.descriptions[0]}
                                    </p>
                                    <div className="mt-2">
                                        <h5 className="text-xs font-semibold text-blue-600">
                                            Professional Implications:
                                        </h5>
                                        <ul className="text-xs text-gray-600 list-disc list-inside">
                                            {insight.professionalImplications.map((implication, index) => (
                                                <li key={index}>{implication}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comprehensive Emotion Breakdown */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Comprehensive Emotional Landscape
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {dynamicInsights.map((insight) => (
                            <div
                                key={insight.emotion}
                                className={`${insight.color} rounded-lg p-4 border hover:scale-105 transition-transform`}
                            >
                                <div className="flex items-center mb-2">
                                    {insight.icon}
                                    <span className="ml-2 font-semibold text-gray-800">
                                        {insight.emotion}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {insight.count} occurrences ({((insight.count / totalEmotions) * 100).toFixed(1)}%)
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {insight.interpretation}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {insight.descriptions[0]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmotionInsightsFeedback;