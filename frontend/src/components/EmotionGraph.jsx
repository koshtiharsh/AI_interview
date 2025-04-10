import React from "react";
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine } from "recharts";

const EmotionQuestionAnalysis = ({ emotion }) => {
    // Sample data to use if no emotion prop is provided
    const sampleEmotions = [
        { time: 1000, emotion: "Neutral" },
        { time: 5000, emotion: "Neutral" },
        { time: 14000, emotion: "Happy" },
        { time: 22000, emotion: "Surprised" },
        { time: 30000, emotion: "Happy" },
        { time: 42000, emotion: "Neutral" }
    ];

    // Professional terminology mapping for emotions (simplified to single words)
    const professionalTerminology = {
        "Neutral": "Calm",
        "Happy": "Confident",
        "Surprised": "Curious",
        "Fearful": "Nervous",
        "Sad": "Frustration",
        "Angry": "Assertive",
        "Disgusted": "Critical"
    };

    // Process the incoming data to handle timestamps
    const processData = (rawData) => {
        if (!rawData) return sampleEmotions;

        // Check if we need to process MongoDB style timestamps
        const needsProcessing = rawData.some(item =>
            item.time && typeof item.time === 'object' && item.time.$numberLong);

        // Get the first timestamp to calculate relative times
        let firstTimestamp;
        let processedData;

        if (needsProcessing) {
            // Convert MongoDB timestamps
            firstTimestamp = parseInt(rawData[0].time.$numberLong, 10);
            processedData = rawData.map(item => {
                if (item.time && item.time.$numberLong) {
                    const timestamp = parseInt(item.time.$numberLong, 10);
                    // Calculate relative time in milliseconds
                    const relativeTime = timestamp - firstTimestamp;
                    return {
                        ...item,
                        time: relativeTime // Store as milliseconds for accurate calculation
                    };
                }
                return item;
            });
        } else {
            // Handle regular JavaScript timestamps (from Date.now())
            firstTimestamp = rawData[0].time;
            processedData = rawData.map(item => ({
                ...item,
                time: item.time - firstTimestamp // Store relative time in milliseconds
            }));
        }

        // Apply normalization directly here
        return normalizeEmotions(processedData);
    };

    // Normalize emotions (handle "Surprised" misclassification)
    const normalizeEmotions = (data) => {
        const normalizedData = [...data];

        // Find all "Surprised" entries
        const surprisedIndices = normalizedData.reduce((indices, item, index) => {
            if (item.emotion === "Surprised") {
                indices.push(index);
            }
            return indices;
        }, []);

        // Redistribute "Surprised" to "Neutral" and "Happy"
        surprisedIndices.forEach(index => {
            // 60% chance of becoming "Neutral", 40% chance of becoming "Happy"
            normalizedData[index].emotion = Math.random() < 0.6 ? "Neutral" : "Happy";
        });

        return normalizedData;
    };

    // Process the data
    const data = processData(emotion);

    // Determine time range for charts (in milliseconds)
    const timeStart = 0; // Always start at 0 for relative time
    const timeEnd = data.length > 0 ? Math.max(...data.map(d => d.time)) : 60000; // Default to 1 minute if no data

    const emotionColors = {
        "Neutral": "#9e9e9e",
        "Angry": "#d32f2f",
        "Happy": "#4caf50",
        "Surprised": "#ff9800", // Keep for backwards compatibility
        "Fearful": "#7e57c2",
        "Sad": "#2196f3",
        "Disgusted": "#795548"
    };

    // Calculate emotion distribution with professional terminology
    const calculateEmotionDistribution = () => {
        const emotionCounts = {};
        data.forEach(item => {
            emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
        });

        const total = data.length;
        return Object.keys(emotionCounts).map(emotion => ({
            emotion: emotion,
            professionalTerm: professionalTerminology[emotion] || emotion,
            count: emotionCounts[emotion],
            percentage: ((emotionCounts[emotion] / total) * 100).toFixed(1)
        })).sort((a, b) => b.count - a.count);
    };

    const emotionDistribution = calculateEmotionDistribution();

    // Format milliseconds to MM:SS format
    const formatMinSec = (milliseconds) => {
        // Convert milliseconds to seconds
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    // Get all unique emotions to create fixed Y-axis categories
    const allEmotions = [...new Set(data.map(item => item.emotion))];

    // Create properly formatted timeline data points with professional terminology
    const timelineData = data.map((item) => ({
        time: item.time,
        emotion: item.emotion,
        professionalTerm: professionalTerminology[item.emotion] || item.emotion,
        value: 1 // Used for scatter point size
    }));

    const dominantEmotion = emotionDistribution.length > 0 ? emotionDistribution[0].emotion : "Neutral";
    const dominantProfessionalTerm = emotionDistribution.length > 0 ? emotionDistribution[0].professionalTerm : "Attentive";

    // Custom tooltip component to show formatted time
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
                    <p className="font-medium">{data.professionalTerm || data.emotion}</p>
                    <p>Time: {formatMinSec(data.time)}</p>
                </div>
            );
        }
        return null;
    };

    // Distribution chart tooltip
    const DistributionTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
                    <p className="font-medium">{data.professionalTerm}</p>
                    <p>{data.percentage}% of responses</p>
                    <p>Count: {data.count}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full p-4 bg-white rounded-lg shadow">
            <div className="mb-3">
                <h3 className="text-lg font-semibold">Communication Style Analysis</h3>
                <p className="text-sm text-gray-500">Time: {formatMinSec(timeStart)} - {formatMinSec(timeEnd)}</p>
            </div>

            {/* Emotion Distribution Bar Chart */}
            <div className="h-40 mb-4">
                <h4 className="text-sm font-medium mb-1">Communication Style Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionDistribution} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="professionalTerm" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 10 }} />
                        <Tooltip content={<DistributionTooltip />} />
                        <Bar dataKey="percentage" name="Percentage">
                            {emotionDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={emotionColors[entry.emotion]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Emotion Scatter Chart - With Reference Lines for Times */}
            <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">Communication Style Timeline</h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="time"
                                domain={[timeStart, timeEnd]}
                                tickFormatter={formatMinSec}
                                tick={{ fontSize: 10 }}
                                label={{ value: "Time (MM:SS)", position: 'bottom', fontSize: 10, dy: 10 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="professionalTerm"
                                name="Communication Style"
                                tick={{ fontSize: 10 }}
                                width={65}
                                domain={allEmotions.map(e => professionalTerminology[e] || e)}
                                allowDuplicatedCategory={false}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {/* Add reference lines for each time point */}
                            {timelineData.map((point, index) => (
                                <ReferenceLine
                                    key={`timeline-${index}`}
                                    x={point.time}
                                    stroke={emotionColors[point.emotion]}
                                    strokeDasharray="3 3"
                                    strokeOpacity={0.6}
                                    label={{
                                        value: formatMinSec(point.time),
                                        position: 'bottom',
                                        fill: emotionColors[point.emotion],
                                        fontSize: 9,
                                        offset: 15
                                    }}
                                />
                            ))}

                            <Scatter
                                name="Styles"
                                data={timelineData}
                                fill="#8884d8"
                                shape="circle"
                            >
                                {timelineData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={emotionColors[entry.emotion]}
                                        r={6} // Slightly larger radius for better visibility
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Overall Emotion Summary */}
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                <h4 className="text-sm font-medium">Overall Communication Style</h4>
                <p className="text-sm">
                    <span className="font-medium">Predominant Style:</span> {dominantProfessionalTerm} ({emotionDistribution.find(e => e.emotion === dominantEmotion)?.percentage}% of the interaction)
                </p>
            </div>
        </div>
    );
};

export default EmotionQuestionAnalysis;