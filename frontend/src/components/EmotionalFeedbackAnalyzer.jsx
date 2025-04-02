import { v4 as uuidv4 } from 'uuid';

class EmotionalFeedbackAnalyzer {
    constructor() {
        this.emotionMappings = {
            'Happy': [
                'Confident',
                'Enthusiastic',
                'Optimistic',
                'Energetic',
                'Passionate'
            ],
            'Surprised': [
                'Intrigued',
                'Curious',
                'Impressed',
                'Open-minded',
                'Receptive'
            ],
            'Neutral': [
                'Composed',
                'Analytical',
                'Reserved',
                'Balanced',
                'Contemplative'
            ],
            'Sad': [
                'Nervous',
                'Anxious',
                'Uncertain',
                'Self-doubting',
                'Hesitant'
            ],
            'Angry': [
                'Frustrated',
                'Defensive',
                'Challenged',
                'Competitive',
                'Aggressive'
            ],
            'Fearful': [
                'Insecure',
                'Overwhelmed',
                'Intimidated',
                'Vulnerable',
                'Apprehensive'
            ],
            'Disgusted': [
                'Critical',
                'Dismissive',
                'Skeptical',
                'Judgmental',
                'Disapproving'
            ]
        };

        this.feedbackTemplates = {
            comprehensive: [
                "Your emotional landscape reveals {primary_emotion} undertones, suggesting {secondary_emotion} potential. The data points to {key_insight} in your communication approach.",
                "An intriguing emotional profile emerges, characterized by {primary_emotion} energy and {secondary_emotion} nuances. Key areas for development include {improvement_area}.",
                "Your emotional response demonstrates {primary_emotion} characteristics, with subtle {secondary_emotion} influences. The analysis suggests opportunities for {growth_dimension}.",
                "A complex emotional terrain is detected, blending {primary_emotion} and {secondary_emotion} elements. Strategic focus could enhance {performance_aspect}.",
                "Emotional data reveals a {primary_emotion} core with {secondary_emotion} undertones, indicating potential for {personal_development_goal}."
            ],
            personalizedInsight: [
                "Your emotional intelligence shows {strength_level} in managing {emotional_context}, with room to develop {growth_area}.",
                "Communication patterns suggest {emotional_resilience} with {emotional_flexibility} in challenging interactions.",
                "Detected emotional patterns indicate {adaptability_score} in navigating {interaction_complexity}.",
                "Emotional bandwidth demonstrates {emotional_range} with potential for {strategic_improvement}.",
                "Nuanced emotional responses reveal {emotional_intelligence_metric} in professional contexts."
            ]
        };
    }

    generateEmotionalMapping(emotionData) {
        const enrichedEmotions = {};

        Object.entries(emotionData).forEach(([emotion, intensity]) => {
            if (intensity > 0) {
                enrichedEmotions[emotion] = {
                    intensity: intensity,
                    derivedEmotions: this.emotionMappings[emotion] || [],
                    significanceLevel: this.calculateSignificanceLevel(intensity)
                };
            }
        });

        return enrichedEmotions;
    }

    calculateSignificanceLevel(intensity) {
        if (intensity <= 3) return 'Low';
        if (intensity <= 7) return 'Medium';
        return 'High';
    }

    generateComprehensiveFeedback(emotionData) {
        const enrichedEmotions = this.generateEmotionalMapping(emotionData);
        const dominantEmotion = this.findDominantEmotion(enrichedEmotions);

        const feedbackContext = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            dominantEmotion: dominantEmotion.emotion,
            secondaryEmotion: this.selectSecondaryEmotion(enrichedEmotions),
            insights: this.generateContextualInsights(dominantEmotion)
        };

        return {
            emotionalProfile: enrichedEmotions,
            feedback: this.constructFeedbackNarrative(feedbackContext),
            feedbackContext
        };
    }

    findDominantEmotion(enrichedEmotions) {
        return Object.entries(enrichedEmotions)
            .reduce((max, [emotion, data]) =>
                data.intensity > max.intensity ? { emotion, ...data } : max,
                { emotion: '', intensity: -1 }
            );
    }

    selectSecondaryEmotion(enrichedEmotions) {
        const sortedEmotions = Object.entries(enrichedEmotions)
            .sort(([, a], [, b]) => b.intensity - a.intensity);

        return sortedEmotions.length > 1 ? sortedEmotions[1][0] : 'Neutral';
    }

    generateContextualInsights(dominantEmotion) {
        const insightGenerators = {
            'Happy': () => ['Leverage your positive energy', 'Maintain professional enthusiasm'],
            'Surprised': () => ['Stay curious', 'Embrace learning opportunities'],
            'Neutral': () => ['Develop emotional range', 'Practice active engagement'],
            'Sad': () => ['Build emotional resilience', 'Seek supportive environments'],
            'Angry': () => ['Channel energy constructively', 'Practice emotional regulation'],
            'Fearful': () => ['Develop confidence strategies', 'Challenge limiting beliefs'],
            'Disgusted': () => ['Cultivate open-mindedness', 'Practice empathetic listening']
        };

        return insightGenerators[dominantEmotion.emotion]?.() ||
            ['Develop self-awareness', 'Enhance emotional intelligence'];
    }

    constructFeedbackNarrative(context) {
        const comprehensiveTemplate = this.feedbackTemplates.comprehensive[
            Math.floor(Math.random() * this.feedbackTemplates.comprehensive.length)
        ];

        const personalizedTemplate = this.feedbackTemplates.personalizedInsight[
            Math.floor(Math.random() * this.feedbackTemplates.personalizedInsight.length)
        ];

        return {
            comprehensiveFeedback: this.formatTemplate(comprehensiveTemplate, context),
            personalizedInsight: this.formatTemplate(personalizedTemplate, context)
        };
    }

    formatTemplate(template, context) {
        return template
            .replace('{primary_emotion}', context.dominantEmotion)
            .replace('{secondary_emotion}', context.secondaryEmotion)
            .replace('{key_insight}', context.insights[0])
            .replace('{improvement_area}', context.insights[1])
            .replace('{growth_dimension}', context.insights[0])
            .replace('{performance_aspect}', context.insights[1])
            .replace('{personal_development_goal}', context.insights[0]);
    }
}

export default new EmotionalFeedbackAnalyzer();