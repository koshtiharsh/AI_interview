// import React, { useEffect, useState } from "react";
// import '../App.css';
// import 'regenerator-runtime/runtime';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import useClipboard from "react-use-clipboard";
// import { io } from 'socket.io-client';

// const feedbackMap = new Map([
//     ["Angry", "You seem to be feeling defensive. This could be a sign that you are stressed or overwhelmed. Consider taking a moment to relax your facial muscles and breathe deeply. Practicing mindfulness can also help manage feelings of anger."],
//     ["Fearful", "It looks like you're experiencing some nervousness or anxiety. This might be affecting your confidence. Try to ground yourself by focusing on your breathing and reminding yourself of your strengths. Visualization techniques can also help ease fear."],
//     ["Happy", "Fantastic! Your expressions show confidence and excitement, which can positively influence those around you. Continue to embrace this positivity, and consider sharing your happiness with others, as it can uplift their spirits too."],
//     ["Neutral", "Your expressions indicate curiosity or calmness. This can be a great state for listening and absorbing information. Stay open-minded, and engage with your surroundings. You might also explore new ideas or ask questions to deepen your understanding."],
//     ["Sad", "It seems you might be feeling frustration or disappointment. Acknowledging these feelings is the first step to overcoming them. Consider reflecting on what may have caused these emotions and think about actions you can take to improve your situation."],
//     ["Surprised", "You appear to be curious about the unknown, which is a great mindset for learning! Embrace this curiosity and use it to explore new topics or ask questions. Consider keeping a journal to document your thoughts and discoveries."],
// ]);

// const Voice_detection = ({ feedback_emotion, socketRef, setFeedback_emotion, show, setShow, setEmotionCounts, emotionCounts }) => {
//     const [textToCopy, setTextToCopy] = useState();
//     const [isCopied, setCopied] = useClipboard(textToCopy, {
//         successDuration: 1000
//     });
//     const [hrQuestion, setHrQuestion] = useState("");
//     const [feedback, setFeedback] = useState(null); // For showing feedback
//     const [transcriptCleared, setTranscriptCleared] = useState(false); // Track if transcript has been cleared

//     const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
//     const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

//     useEffect(() => {
//         // Emit request for the first question when the component mounts
//         socketRef.current.emit('request_question'); // Request the first question
//         // Listen for new HR question from the server
//         socketRef.current.on('new_question', (data) => {
//             setHrQuestion(data.question);
//         });
//         // Listen for feedback from the server
//         socketRef.current.on('transcript_feedback', (data) => {
//             setFeedback(data);  // Store feedback
//         });

//         return () => {
//             socketRef.current.off('new_question'); // Clean up the listener on unmount
//             socketRef.current.off('transcript_feedback'); // Clean up feedback listener
//         };
//     }, []);

//     const handleStopListening = () => {

//         // Only send the transcript if there's a new one (after the last question)
//         if (!transcriptCleared) {
//             socketRef.current.emit('send_transcript', { transcript }); // Send transcript to the server for analysis
//         }
//         setShow('feedback')

//         // Reset the transcript for the next question
//         resetTranscript();
//         setTranscriptCleared(true);  // Mark that the transcript has been cleared

//         // Emit event to get a new question from the server
//         socketRef.current.emit('request_question');

//         // Reset feedback for the next question
//         setFeedback(null);
//         let most;
//         let mostc = 0;
//         Object.keys(emotionCounts).map((key) => {
//             if (emotionCounts[key] > mostc) {
//                 most = key;
//                 mostc = emotionCounts[key]
//             }
//         })
//         console.log(most, mostc)

//         setEmotionCounts({ ...emotionCounts, [most]: 0 })
//         setFeedback_emotion('Most of the time ' + feedbackMap.get(most));
//         Object.keys(emotionCounts).map((key) => {

//             if (emotionCounts[key] > 0 && feedbackMap.has(key)) {
//                 setFeedback_emotion(prevFeedback => prevFeedback + ' ' + feedbackMap.get(key));
//             }
//         })



//         // reseting all emotionCounts


//         SpeechRecognition.stopListening(); // Stop the speech recognition


//         // if (feedbackMap.has(detectedEmotion)) {
//         //     setFeedback(prevFeedback => prevFeedback + ' ' + feedbackMap.get(detectedEmotion));
//         // } else {
//         //     setFeedback(prevFeedback => prevFeedback + ' No clear emotion detected. Remember, it\'s always good to reflect on how you\'re feeling!');
//         // }

//     };

//     const handleStartListening = () => {
//         startListening();  // Start speech recognition
//         setTranscriptCleared(false);  // Allow the new transcript to be sent again
//         setEmotionCounts({
//             Angry: 0,
//             Fearful: 0,
//             Happy: 0,
//             Neutral: 0,
//             Sad: 0,
//             Surprised: 0,
//         })
//         setShow('start')
//     };

//     if (!browserSupportsSpeechRecognition) {
//         return <p>Speech Recognition is not supported in this browser. Please try using Chrome.</p>;
//     }

//     return (
//         <>
//             <div className="container">
//                 <br />
//                 <h2>{/* Display the randomly selected HR question */}
//                     {hrQuestion && (
//                         <div className="hr-question">
//                             <h3>HR Question:</h3>
//                             <p>{hrQuestion}</p>
//                         </div>
//                     )}</h2>

//                 <div className="main-content" onClick={() => setTextToCopy(transcript)}>
//                     {/* Clear the transcript on stop listening */}
//                     {transcriptCleared ? '' : transcript}
//                 </div>

//                 <div className="btn-style">
//                     <button onClick={setCopied}>
//                         {isCopied ? 'Copied!' : 'Copy to clipboard'}
//                     </button>
//                     <button onClick={handleStartListening}>Start Listening</button>
//                     <button onClick={handleStopListening}>Stop Listening</button>
//                 </div>

//                 {/* Show feedback from the server */}
//                 {feedback && (
//                     <div className="feedback">
//                         <h4>Feedback:</h4>
//                         <p><strong>Avoid words:</strong> {feedback.avoid_words.join(', ') || 'None'}</p>
//                         <p><strong>Must-use words:</strong> {feedback.must_use_words.join(', ') || 'None'}</p>
//                         <p><strong>Transcript length:</strong> {feedback.transcript_length} words</p>
//                     </div>
//                 )}
//                 <div class="feedback-card">
//                     <div class="feedback-icon">
//                     </div>
//                     <div class="feedback-content">
//                         <p class="feedback-text" id="feed">
//                             {feedback_emotion}
//                         </p>
//                     </div>
//                 </div>

//             </div>
//         </>
//     );
// };

// export default Voice_detection;


// import React, { useEffect, useState } from "react";
// import '../App.css';
// import 'regenerator-runtime/runtime';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import useClipboard from "react-use-clipboard";
// import { io } from 'socket.io-client';

// const feedbackMap = new Map([
//     ["Angry", "You seem to be feeling defensive..."],
//     ["Fearful", "It looks like you're experiencing some nervousness..."],
//     ["Happy", "Fantastic! Your expressions show confidence..."],
//     ["Neutral", "Your expressions indicate curiosity or calmness..."],
//     ["Sad", "It seems you might be feeling frustration..."],
//     ["Surprised", "You appear to be curious about the unknown..."],
// ]);

// const Voice_detection = ({ feedback_emotion, socketRef, setFeedback_emotion, show, setShow, setEmotionCounts, emotionCounts }) => {
//     const [textToCopy, setTextToCopy] = useState();
//     const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
//     const [hrQuestion, setHrQuestion] = useState("");
//     const [feedback, setFeedback] = useState(null); // Store feedback from HR model
//     const [transcriptCleared, setTranscriptCleared] = useState(false);

//     const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
//     const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

//     useEffect(() => {
//         socketRef.current.emit('request_question'); // Request the first question
//         socketRef.current.on('new_question', (data) => setHrQuestion(data.question));
//         socketRef.current.on('transcript_feedback', (data) => setFeedback(data)); // Store feedback from HR model
//         console.log(feedback)

//         return () => {
//             socketRef.current.off('new_question');
//             socketRef.current.off('transcript_feedback');
//         };
//     }, []);

//     useEffect(() => {
//         if (socketRef.current) {
//             socketRef.current.on('hr_response', (data) => {
//                 setFeedback(data);  // Update feedback with server response
//             });
//         }

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.off('hr_response');
//             }
//         };
//     }, []);

//     const handleStopListening = () => {
//         if (!transcriptCleared) {
//             socketRef.current.emit('send_transcript', { transcript, hrQuestion }); // Send transcript to server for analysis
//         }
//         setShow('feedback');
//         resetTranscript();
//         setTranscriptCleared(true);
//         socketRef.current.emit('request_question'); // Request new question

//         setFeedback(null);
//         let most;
//         let mostc = 0;
//         Object.keys(emotionCounts).forEach((key) => {
//             if (emotionCounts[key] > mostc) {
//                 most = key;
//                 mostc = emotionCounts[key];
//             }
//         });

//         setEmotionCounts({ ...emotionCounts, [most]: 0 });
//         setFeedback_emotion('Most of the time ' + feedbackMap.get(most));
//         Object.keys(emotionCounts).forEach((key) => {
//             if (emotionCounts[key] > 0 && feedbackMap.has(key)) {
//                 setFeedback_emotion(prevFeedback => prevFeedback + ' ' + feedbackMap.get(key));
//             }
//         });

//         SpeechRecognition.stopListening();
//     };

//     const handleStartListening = () => {
//         startListening();
//         setTranscriptCleared(false);
//         setEmotionCounts({
//             Angry: 0,
//             Fearful: 0,
//             Happy: 0,
//             Neutral: 0,
//             Sad: 0,
//             Surprised: 0,
//         });
//         setShow('start');
//     };

//     if (!browserSupportsSpeechRecognition) {
//         return <p>Speech Recognition is not supported in this browser. Please try using Chrome.</p>;
//     }


//     return (
//         <>
//             <div className="container">
//                 <br />
//                 <h2>{hrQuestion && (
//                     <div className="hr-question">
//                         <h3>HR Question:</h3>
//                         <p>{hrQuestion}</p>
//                     </div>
//                 )}</h2>

//                 <div className="main-content" onClick={() => setTextToCopy(transcript)}>
//                     {transcriptCleared ? '' : transcript}
//                 </div>

//                 <div className="btn-style">
//                     <button onClick={setCopied}>
//                         {isCopied ? 'Copied!' : 'Copy to clipboard'}
//                     </button>
//                     <button onClick={handleStartListening}>Start Listening</button>
//                     <button onClick={handleStopListening}>Stop Listening</button>
//                 </div>

//                 {feedback && (
//                     <div className="feedback">
//                         <h4>Feedback:</h4>
//                         <p>{feedback.feedback}</p> {/* Display the feedback from the server */}
//                     </div>
//                 )}

//                 <div className="feedback-card">
//                     <div className="feedback-icon"></div>
//                     <div className="feedback-content">
//                         <p className="feedback-text" id="feed">
//                             {feedback_emotion}
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Voice_detection;


// import React, { useEffect, useState } from "react";
// import '../App.css';
// import 'regenerator-runtime/runtime';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import useClipboard from "react-use-clipboard";
// import { io } from 'socket.io-client';

// const feedbackMap = new Map([
//     ["Angry", "You seem to be feeling defensive..."],
//     ["Fearful", "It looks like you're experiencing some nervousness..."],
//     ["Happy", "Fantastic! Your expressions show confidence..."],
//     ["Neutral", "Your expressions indicate curiosity or calmness..."],
//     ["Sad", "It seems you might be feeling frustration..."],
//     ["Surprised", "You appear to be curious about the unknown..."],
// ]);

// const Voice_detection = ({ feedback_emotion, socketRef, setFeedback_emotion, show, setShow, setEmotionCounts, emotionCounts }) => {
//     const [textToCopy, setTextToCopy] = useState();
//     const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
//     const [hrQuestion, setHrQuestion] = useState("");
//     const [feedback, setFeedback] = useState(null);
//     const [transcriptCleared, setTranscriptCleared] = useState(false);

//     const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
//     const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

//     useEffect(() => {
//         socketRef.current.emit('request_question');
//         socketRef.current.on('new_question', (data) => setHrQuestion(data.question));
//         socketRef.current.on('transcript_feedback', (data) => setFeedback(data));

//         return () => {
//             socketRef.current.off('new_question');
//             socketRef.current.off('transcript_feedback');
//         };
//     }, []);

//     useEffect(() => {
//         if (socketRef.current) {
//             socketRef.current.on('hr_response', (data) => setFeedback(data));
//         }

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.off('hr_response');
//             }
//         };
//     }, []);

//     const handleStopListening = () => {
//         if (!transcriptCleared) {
//             socketRef.current.emit('send_transcript', { transcript, hrQuestion });
//         }
//         setShow('feedback');
//         resetTranscript();
//         setTranscriptCleared(true);
//         socketRef.current.emit('request_question');
//         setFeedback(null);

//         let most;
//         let mostc = 0;
//         Object.keys(emotionCounts).forEach((key) => {
//             if (emotionCounts[key] > mostc) {
//                 most = key;
//                 mostc = emotionCounts[key];
//             }
//         });

//         setEmotionCounts({ ...emotionCounts, [most]: 0 });
//         setFeedback_emotion('Most of the time ' + feedbackMap.get(most));
//         Object.keys(emotionCounts).forEach((key) => {
//             if (emotionCounts[key] > 0 && feedbackMap.has(key)) {
//                 setFeedback_emotion(prevFeedback => prevFeedback + ' ' + feedbackMap.get(key));
//             }
//         });

//         SpeechRecognition.stopListening();
//     };

//     const handleStartListening = () => {
//         startListening();
//         setTranscriptCleared(false);
//         setEmotionCounts({
//             Angry: 0,
//             Fearful: 0,
//             Happy: 0,
//             Neutral: 0,
//             Sad: 0,
//             Surprised: 0,
//         });
//         setShow('start');
//     };

//     if (!browserSupportsSpeechRecognition) {
//         return <p>Speech Recognition is not supported in this browser. Please try using Chrome.</p>;
//     }

//     return (
//         <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
//             <div className="text-center mb-8">
//                 <h2 className="text-2xl font-bold text-gray-700">HR Interview Assistant</h2>
//             </div>

//             <div className="rounded-lg shadow-lg p-6 bg-white">
//                 {hrQuestion && (
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold text-gray-600">HR Question:</h3>
//                         <p className="text-gray-700">{hrQuestion}</p>
//                     </div>
//                 )}

//                 <div
//                     className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-100 text-gray-800 cursor-pointer"
//                     onClick={() => setTextToCopy(transcript)}
//                 >
//                     {transcriptCleared ? 'Transcript cleared' : transcript || 'Start speaking to see the transcript here...'}
//                 </div>

//                 <div className="flex justify-center gap-4 mb-4">
//                     <button onClick={setCopied} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
//                         {isCopied ? 'Copied!' : 'Copy to clipboard'}
//                     </button>
//                     <button onClick={handleStartListening} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
//                         Start Listening
//                     </button>
//                     <button onClick={handleStopListening} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
//                         Stop Listening
//                     </button>
//                 </div>

//                 {feedback && (
//                     <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
//                         <h4 className="text-lg font-semibold text-gray-600">Feedback:</h4>
//                         <p className="text-gray-700">{feedback.feedback}</p>
//                     </div>
//                 )}

//                 <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-indigo-50">
//                     <div className="flex items-center">
//                         <div className="mr-4 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
//                             😊
//                         </div>
//                         <p className="text-gray-700">{feedback_emotion}</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Voice_detection;

import React, { useContext, useEffect, useState } from "react";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import { io } from 'socket.io-client';
import { context } from "../context/Context";

const feedbackMap = new Map([
    ["Angry", "You seem to be feeling defensive. This could be a sign that you are stressed or overwhelmed. Consider taking a moment to relax your facial muscles and breathe deeply. Practicing mindfulness can also help manage feelings of anger."],
    ["Fearful", "It looks like you're experiencing some nervousness or anxiety. This might be affecting your confidence. Try to ground yourself by focusing on your breathing and reminding yourself of your strengths. Visualization techniques can also help ease fear."],
    ["Happy", "Fantastic! Your expressions show confidence and excitement, which can positively influence those around you. Continue to embrace this positivity, and consider sharing your happiness with others, as it can uplift their spirits too."],
    ["Neutral", "Your expressions indicate curiosity or calmness. This can be a great state for listening and absorbing information. Stay open-minded, and engage with your surroundings. You might also explore new ideas or ask questions to deepen your understanding."],
    ["Sad", "It seems you might be feeling frustration or disappointment. Acknowledging these feelings is the first step to overcoming them. Consider reflecting on what may have caused these emotions and think about actions you can take to improve your situation."],
    ["Surprised", "You appear to be curious about the unknown, which is a great mindset for learning! Embrace this curiosity and use it to explore new topics or ask questions. Consider keeping a journal to document your thoughts and discoveries."],
]);
const VoiceDetection = ({ feedback_emotion, socketRef, setFeedback_emotion, show, setShow, setEmotionCounts, emotionCounts }) => {
    const [textToCopy, setTextToCopy] = useState();
    const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });

    const [feedback, setFeedback] = useState(null);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition, } = useSpeechRecognition();
    const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });

    const { transcriptCleared, setTranscriptCleared, hrQuestion, setHrQuestion, ts, setTs, emotion, setEmotion } = useContext(context)


    useEffect(() => {
        setTs(transcript)
    }, [transcript])
    useEffect(() => {
        // Request the first question on component mount
        socketRef.current.emit('request_question');

        // Listen for new questions and feedback from the server
        socketRef.current.on('new_question', (data) => {
            setHrQuestion(data.question);
            setTranscriptCleared(false); // Reset transcriptCleared for the new question
        });

        socketRef.current.on('transcript_feedback', (data) => setFeedback(data));

        return () => {
            // Clean up event listeners on component unmount
            socketRef.current.off('new_question');
            socketRef.current.off('transcript_feedback');
        };
    }, []);

    const handleStopListening = () => {
        if (!transcriptCleared) {
            socketRef.current.emit('send_transcript', { transcript, hrQuestion });
        }

        setShow('feedback');
        setTranscriptCleared(true);
        resetTranscript(); // Clear the transcript for the next question
        socketRef.current.emit('request_question'); // Request the next question
        setFeedback(null); // Reset feedback for the new question

        // Analyze emotions and update feedback
        let most;
        let mostc = 0;
        Object.keys(emotionCounts).forEach((key) => {
            if (emotionCounts[key] > mostc) {
                most = key;
                mostc = emotionCounts[key];
            }
        });

        setEmotionCounts({ ...emotionCounts, [most]: 0 }); // Reset the count for the most detected emotion
        setFeedback_emotion('Most of the time ' + feedbackMap.get(most));

        SpeechRecognition.stopListening();
    };

    if (!browserSupportsSpeechRecognition) {
        return <p>Speech Recognition is not supported in this browser. Please try using Chrome.</p>;
    }
    const styles = "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-2  "

    return (
        <div>

            <div className={`p-4 mx-auto w-[90%]  bg-blue-400 ${styles} mt-4 rounded-lg`}>

                <div className="emotion ">
                    <span className="text-white  font-bold text-xl">Detected Emotion :</span> <span className="text-slate-600 inline-block font-bold text-xl p-1 ml-3 text-center w-[180px] bg-amber-200 rounded-lg"> {emotion}</span>
                </div>
            </div>
            {/* <div className={`p-4 mx-auto w-[90%] r bg-gray-100 ${styles} mt-4 rounded-lg`}>
                <h2>Tips : </h2>
                <div className="bg-gray-300 p-2 m-1 rounded-lg">
                    <ul class=" list-disc pl-8 texthw">
                        <li>Speak clearly and at a moderate pace.</li>
                        <li>Look at the camera, not the screen.</li>
                        <li>Avoid speaking too quickly.</li>
                        <li>Keep answers short and focused.</li>
                        <li>Sit up straight and gesture naturally.</li>
                    </ul>
                </div>

            </div> */}

            <div className={`p-4 mx-auto w-[90%] text-center bg-gray-100 ${styles} mt-4 rounded-lg`}>


                <div className="flex justify-center space-x-4 mt-4">

                    <button onClick={startListening} className="px-4 py-2 bg-green-500 text-white rounded-lg">Start Listening</button>
                    <button onClick={handleStopListening} className="px-4 py-2 bg-red-500 text-white rounded-lg">Stop Listening</button>
                </div>

                {feedback && (
                    <div className="mt-4 bg-yellow-100 p-3 rounded-lg text-yellow-800">
                        <h4 className="font-semibold">Feedback:</h4>
                        <p>{feedback.feedback}</p>
                    </div>
                )}

                <div className="mt-4 p-3 bg-gray-100 border rounded-lg">
                    <p className="text-gray-700">{feedback_emotion}</p>
                </div>
            </div>


        </div>
    );
};

export default VoiceDetection;
