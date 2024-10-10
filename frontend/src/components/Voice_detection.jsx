import React, { useEffect, useState } from "react";
import '../App.css';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import { io } from 'socket.io-client';

const feedbackMap = new Map([
    ["Angry", "You seem to be feeling defensive. This could be a sign that you are stressed or overwhelmed. Consider taking a moment to relax your facial muscles and breathe deeply. Practicing mindfulness can also help manage feelings of anger."],
    ["Fearful", "It looks like you're experiencing some nervousness or anxiety. This might be affecting your confidence. Try to ground yourself by focusing on your breathing and reminding yourself of your strengths. Visualization techniques can also help ease fear."],
    ["Happy", "Fantastic! Your expressions show confidence and excitement, which can positively influence those around you. Continue to embrace this positivity, and consider sharing your happiness with others, as it can uplift their spirits too."],
    ["Neutral", "Your expressions indicate curiosity or calmness. This can be a great state for listening and absorbing information. Stay open-minded, and engage with your surroundings. You might also explore new ideas or ask questions to deepen your understanding."],
    ["Sad", "It seems you might be feeling frustration or disappointment. Acknowledging these feelings is the first step to overcoming them. Consider reflecting on what may have caused these emotions and think about actions you can take to improve your situation."],
    ["Surprised", "You appear to be curious about the unknown, which is a great mindset for learning! Embrace this curiosity and use it to explore new topics or ask questions. Consider keeping a journal to document your thoughts and discoveries."],
]);

const Voice_detection = ({ feedback_emotion, socketRef, setFeedback_emotion, show, setShow, setEmotionCounts, emotionCounts }) => {
    const [textToCopy, setTextToCopy] = useState();
    const [isCopied, setCopied] = useClipboard(textToCopy, {
        successDuration: 1000
    });
    const [hrQuestion, setHrQuestion] = useState("");
    const [feedback, setFeedback] = useState(null); // For showing feedback
    const [transcriptCleared, setTranscriptCleared] = useState(false); // Track if transcript has been cleared

    const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    useEffect(() => {
        // Emit request for the first question when the component mounts
        socketRef.current.emit('request_question'); // Request the first question
        // Listen for new HR question from the server
        socketRef.current.on('new_question', (data) => {
            setHrQuestion(data.question);
        });
        // Listen for feedback from the server
        socketRef.current.on('transcript_feedback', (data) => {
            setFeedback(data);  // Store feedback
        });

        return () => {
            socketRef.current.off('new_question'); // Clean up the listener on unmount
            socketRef.current.off('transcript_feedback'); // Clean up feedback listener
        };
    }, []);

    const handleStopListening = () => {

        // Only send the transcript if there's a new one (after the last question)
        if (!transcriptCleared) {
            socketRef.current.emit('send_transcript', { transcript }); // Send transcript to the server for analysis
        }
        setShow('feedback')

        // Reset the transcript for the next question
        resetTranscript();
        setTranscriptCleared(true);  // Mark that the transcript has been cleared

        // Emit event to get a new question from the server
        socketRef.current.emit('request_question');

        // Reset feedback for the next question
        setFeedback(null);
        let most;
        let mostc = 0;
        Object.keys(emotionCounts).map((key) => {
            if (emotionCounts[key] > mostc) {
                most = key;
                mostc = emotionCounts[key]
            }
        })
        console.log(most, mostc)

        setEmotionCounts({ ...emotionCounts, [most]: 0 })
        setFeedback_emotion('Most of the time ' + feedbackMap.get(most));
        Object.keys(emotionCounts).map((key) => {

            if (emotionCounts[key] > 0 && feedbackMap.has(key)) {
                setFeedback_emotion(prevFeedback => prevFeedback + ' ' + feedbackMap.get(key));
            }
        })



        // reseting all emotionCounts


        SpeechRecognition.stopListening(); // Stop the speech recognition


        // if (feedbackMap.has(detectedEmotion)) {
        //     setFeedback(prevFeedback => prevFeedback + ' ' + feedbackMap.get(detectedEmotion));
        // } else {
        //     setFeedback(prevFeedback => prevFeedback + ' No clear emotion detected. Remember, it\'s always good to reflect on how you\'re feeling!');
        // }

    };

    const handleStartListening = () => {
        startListening();  // Start speech recognition
        setTranscriptCleared(false);  // Allow the new transcript to be sent again
        setEmotionCounts({
            Angry: 0,
            Fearful: 0,
            Happy: 0,
            Neutral: 0,
            Sad: 0,
            Surprised: 0,
        })
        setShow('start')
    };

    if (!browserSupportsSpeechRecognition) {
        return <p>Speech Recognition is not supported in this browser. Please try using Chrome.</p>;
    }

    return (
        <>
            <div className="container">
                <br />
                <h2>{/* Display the randomly selected HR question */}
                    {hrQuestion && (
                        <div className="hr-question">
                            <h3>HR Question:</h3>
                            <p>{hrQuestion}</p>
                        </div>
                    )}</h2>

                <div className="main-content" onClick={() => setTextToCopy(transcript)}>
                    {/* Clear the transcript on stop listening */}
                    {transcriptCleared ? '' : transcript}
                </div>

                <div className="btn-style">
                    <button onClick={setCopied}>
                        {isCopied ? 'Copied!' : 'Copy to clipboard'}
                    </button>
                    <button onClick={handleStartListening}>Start Listening</button>
                    <button onClick={handleStopListening}>Stop Listening</button>
                </div>

                {/* Show feedback from the server */}
                {feedback && (
                    <div className="feedback">
                        <h4>Feedback:</h4>
                        <p><strong>Avoid words:</strong> {feedback.avoid_words.join(', ') || 'None'}</p>
                        <p><strong>Must-use words:</strong> {feedback.must_use_words.join(', ') || 'None'}</p>
                        <p><strong>Transcript length:</strong> {feedback.transcript_length} words</p>
                    </div>
                )}
                <div class="feedback-card">
                    <div class="feedback-icon">
                    </div>
                    <div class="feedback-content">
                        <p class="feedback-text" id="feed">
                            {feedback_emotion}
                        </p>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Voice_detection;
