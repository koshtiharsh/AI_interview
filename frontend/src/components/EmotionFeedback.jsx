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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Professional terminology mapping for emotions
const professionalTerminology = {
    "Neutral": "Curious & Calm",
    "Happy": "Confident & Excited",
    "Surprised": "Curious", // Will be normalized, but keeping a mapping for edge cases
    "Fearful": "Nervous",
    "Sad": "Frustration",
    "Angry": "Assertive",
    "Disgusted": "Critical"
};

// Expanded insight generation helpers with professional terminology
const generateInsightVariations = {
    "Neutral": [
        {
            interpretation: "Active Listening",
            descriptions: [
                "Your expressions indicate curiosity and calmness. This can be a great state for listening and absorbing information.",
                "Maintained a balanced demeanor, showcasing attentiveness and professional engagement.",
                "Exhibited a calm and collected approach, indicating strong communication intelligence."
            ],
            professionalImplications: [
                "Suggests ability to handle complex information with focus",
                "Indicates potential for leadership roles requiring emotional regulation",
                "Demonstrates adaptability in complex professional environments"
            ]
        },
        {
            interpretation: "Strategic Engagement",
            descriptions: [
                "Displayed curiosity and open-mindedness, suggesting engagement with the material.",
                "Showed a nuanced approach to communication, staying open to new information.",
                "Demonstrated remarkable ability to remain present and attentive throughout."
            ],
            professionalImplications: [
                "Potential strength in roles requiring careful analysis",
                "Indicates receptiveness to new ideas and perspectives",
                "Suggests capability in navigating complex information"
            ]
        }
    ],
    "Happy": [
        {
            interpretation: "Positive Presence",
            descriptions: [
                "Your expressions show confidence and excitement, which can positively influence those around you.",
                "Demonstrated assured communication style with balanced self-assurance.",
                "Showed remarkable ability to maintain professional enthusiasm and constructive outlook."
            ],
            professionalImplications: [
                "Indicates potential as a motivational team player",
                "Suggests strength in client-facing or collaborative roles",
                "Demonstrates ability to create positive workplace environments"
            ]
        },
        {
            interpretation: "Professional Enthusiasm",
            descriptions: [
                "Projected confidence and positive energy throughout the interaction.",
                "Communicated with appropriate warmth and sincere professional engagement.",
                "Showed ability to convey enthusiasm while maintaining professional boundaries."
            ],
            professionalImplications: [
                "Strong potential in roles requiring authentic stakeholder engagement",
                "Indicates natural ability to build rapport and trust",
                "Suggests emotional intelligence and effective communication skills"
            ]
        }
    ],
    "Fearful": [
        {
            interpretation: "Thoughtful Caution",
            descriptions: [
                "It looks like you're experiencing some nervousness or anxiety. This might be affecting your confidence.",
                "Showed attentiveness to potential challenges, indicating foresight.",
                "Exhibited awareness of nuances that might escape less perceptive candidates."
            ],
            professionalImplications: [
                "Valuable for roles requiring risk assessment and mitigation",
                "Indicates detail-oriented thinking and preventative approach",
                "Suggests ability to identify potential issues before they escalate"
            ]
        }
    ],
    "Sad": [
        {
            interpretation: "Reflective Analysis",
            descriptions: [
                "It seems you might be feeling frustration or disappointment. Acknowledging these feelings is the first step to overcoming them.",
                "Showed nuanced understanding of complex situations with appropriate seriousness.",
                "Exhibited emotional depth that suggests empathy and interpersonal awareness."
            ],
            professionalImplications: [
                "Well-suited for roles requiring empathetic leadership",
                "Indicates potential for thoughtful problem-solving",
                "Suggests capacity for understanding complex human dynamics"
            ]
        }
    ],
    "Angry": [
        {
            interpretation: "Assertive",
            descriptions: [
                "You seem to be feeling defensive. This could be a sign that you are stressed or overwhelmed.",
                "Demonstrated clear boundaries and decisive approach to challenging topics.",
                "Showed capacity for direct and focused engagement when addressing key points."
            ],
            professionalImplications: [
                "Potential strength in advocacy positions",
                "Indicates ability to maintain focus under pressure",
                "Suggests passion and commitment to outcomes"
            ]
        }
    ],
    "Disgusted": [
        {
            interpretation: "Critical Evaluation",
            descriptions: [
                "Demonstrated refined judgment and careful evaluation of standards.",
                "Showed clear understanding of quality benchmarks and professional expectations.",
                "Exhibited discerning perspective that suggests attention to excellence."
            ],
            professionalImplications: [
                "Well-suited for quality assurance or evaluation roles",
                "Indicates potential strength in maintaining professional standards",
                "Suggests commitment to excellence and integrity"
            ]
        }
    ]
};

// Function to randomly select an insight variation
const getRandomInsightVariation = (emotion) => {
    const variations = generateInsightVariations[emotion] || [];
    return variations.length > 0
        ? variations[Math.floor(Math.random() * variations.length)]
        : {
            interpretation: "Unique Professional Approach",
            descriptions: ["Displayed a distinctive communication style during the interaction."],
            professionalImplications: ["Suggests individuality and unique professional perspective"]
        };
};

const EmotionInsightsFeedback = ({ emotions }) => {
    // Mapping of ML emotions to comprehensive insights with dynamic generation
    const emotionInsights = {
        "Neutral": {
            icon: <Meh className="text-gray-500" size={40} />,
            color: "bg-gray-100",
            chartColor: "#9CA3AF"
        },
        "Happy": {
            icon: <Smile className="text-green-500" size={40} />,
            color: "bg-green-50",
            chartColor: "#10B981"
        },
        "Surprised": {
            icon: <Zap className="text-yellow-500" size={40} />,
            color: "bg-yellow-50",
            chartColor: "#F59E0B"
        },
        "Fearful": {
            icon: <Thermometer className="text-blue-400" size={40} />,
            color: "bg-blue-50",
            chartColor: "#60A5FA"
        },
        "Sad": {
            icon: <Frown className="text-indigo-500" size={40} />,
            color: "bg-indigo-50",
            chartColor: "#6366F1"
        },
        "Angry": {
            icon: <TrendingUp className="text-red-500" size={40} />,
            color: "bg-red-50",
            chartColor: "#EF4444"
        },
        "Disgusted": {
            icon: <User className="text-purple-500" size={40} />,
            color: "bg-purple-50",
            chartColor: "#8B5CF6"
        }
    };

    // Use useMemo to normalize emotions and generate insights
    const dynamicInsights = useMemo(() => {
        // Create a copy of emotions to work with
        let normalizedEmotions = { ...emotions };

        // Handle "Surprised" misclassification issue
        if (normalizedEmotions["Surprised"] > 0) {
            // Distribute "Surprised" values to "Neutral" and "Happy"
            const surprisedCount = normalizedEmotions["Surprised"];
            normalizedEmotions["Neutral"] = (normalizedEmotions["Neutral"] || 0) + Math.floor(surprisedCount * 0.6);
            normalizedEmotions["Happy"] = (normalizedEmotions["Happy"] || 0) + Math.floor(surprisedCount * 0.4);
            normalizedEmotions["Surprised"] = 0; // Remove the surprised classification
        }

        return Object.entries(normalizedEmotions)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([emotion, count]) => ({
                emotion,
                professionalLabel: professionalTerminology[emotion],
                count,
                ...emotionInsights[emotion],
                ...getRandomInsightVariation(emotion)
            }));
    }, [emotions]);

    const totalEmotions = Object.values(emotions).reduce((sum, count) => sum + count, 0);

    // Prepare data for the pie chart
    const chartData = useMemo(() => {
        return dynamicInsights.map(insight => ({
            name: insight.professionalLabel,
            value: insight.count,
            color: insight.chartColor
        }));
    }, [dynamicInsights]);

    // Custom tooltip for the pie chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 shadow-md rounded border text-sm">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-gray-600">Count: {payload[0].value}</p>
                    <p className="text-gray-600">
                        {((payload[0].value / totalEmotions) * 100).toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-100 to-white p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-800">
                    Comprehensive Professional Presence Analysis
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    Insights derived from advanced communication style assessment
                </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Top Communication Styles Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Primary Communication Highlights
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
                                            {insight.professionalLabel}
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

                {/* Additional insights if more than 2 emotions detected */}
                {dynamicInsights.length > 2 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">
                            Secondary Communication Patterns
                        </h2>
                        <div className="space-y-4">
                            {dynamicInsights.slice(2).map((insight) => (
                                <div
                                    key={insight.emotion}
                                    className={`${insight.color} border rounded-lg p-4 shadow-sm`}
                                >
                                    <div className="flex items-center mb-2">
                                        {insight.icon}
                                        <div className="ml-3">
                                            <h3 className="text-md font-bold text-gray-800">
                                                {insight.professionalLabel}
                                            </h3>
                                            <p className="text-xs text-gray-600">
                                                {((insight.count / totalEmotions) * 100).toFixed(1)}% of interactions
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {insight.descriptions[0]}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chart Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Communication Style Distribution
                    </h2>
                    <div className="border rounded-lg p-4 bg-white shadow-md">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Distribution of communication styles based on {totalEmotions} analyzed interactions
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmotionInsightsFeedback;