

// import React, { useContext, useEffect, useState } from "react";
// import 'regenerator-runtime/runtime';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import useClipboard from "react-use-clipboard";
// import { io } from 'socket.io-client';
// import { context } from "../context/Context";
// import SpeakingPaceIndicator from "./PaceIndicator";

// const feedbackMap = new Map([
//     ["Angry", "You seem to be feeling defensive. This could be a sign that you are stressed or overwhelmed. Consider taking a moment to relax your facial muscles and breathe deeply. Practicing mindfulness can also help manage feelings of anger."],
//     ["Fearful", "It looks like you're experiencing some nervousness or anxiety. This might be affecting your confidence. Try to ground yourself by focusing on your breathing and reminding yourself of your strengths. Visualization techniques can also help ease fear."],
//     ["Happy", "Fantastic! Your expressions show confidence and excitement, which can positively influence those around you. Continue to embrace this positivity, and consider sharing your happiness with others, as it can uplift their spirits too."],
//     ["Neutral", "Your expressions indicate curiosity or calmness. This can be a great state for listening and absorbing information. Stay open-minded, and engage with your surroundings. You might also explore new ideas or ask questions to deepen your understanding."],
//     ["Sad", "It seems you might be feeling frustration or disappointment. Acknowledging these feelings is the first step to overcoming them. Consider reflecting on what may have caused these emotions and think about actions you can take to improve your situation."],
//     ["Surprised", "You appear to be curious about the unknown, which is a great mindset for learning! Embrace this curiosity and use it to explore new topics or ask questions. Consider keeping a journal to document your thoughts and discoveries."],
// ]);
// const VoiceDetection = ({ model, setModel, feedback_emotion, socketRef, setFeedback_emotion, show, setShow, setEmotionCounts, emotionCounts }) => {
//     const [textToCopy, setTextToCopy] = useState();
//     const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });

//     const [feedback, setFeedback] = useState(null);
//     const { transcript, resetTranscript, browserSupportsSpeechRecognition, stopListening, interimTranscript, listening } = useSpeechRecognition();
//     // const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
//     const [resetCounter, setResetCounter] = useState(0);

//     const { transcriptCleared, setTranscriptCleared, hrQuestion, setHrQuestion, ts, setTs, emotion, setEmotion, prevTs, setPrevTs, ans, setAns, start, email, overAllEmotion, setOverAllEmotion, userData } = useContext(context)


//     const [silenceDetected, setSilenceDetected] = useState(false);


//     useEffect(() => {
//         const silenceDuration = 10000; // 10 seconds of silence
//         let silenceTimeout;

//         if (listening) {
//             // Clear any existing timeout whenever this effect runs
//             clearTimeout(silenceTimeout);

//             if (!interimTranscript && !transcript) {
//                 // Only start silence detection if both interim and final transcripts are empty
//                 silenceTimeout = setTimeout(() => {
//                     setSilenceDetected(true);
//                     setModel(true);
//                 }, silenceDuration);
//             } else {
//                 // If any speech is being detected, reset the silence state
//                 setSilenceDetected(false);
//                 setModel(false);
//             }

//             // Handle answer states
//             if (ans === 'yes') {
//                 setSilenceDetected(false);
//                 setAns('notset');
//             }
//             if (ans === 'no') {
//                 setSilenceDetected(false);
//                 setModel(false);
//                 setAns('notset');
//             }
//         }

//         return () => clearTimeout(silenceTimeout); // Clean up timeout
//     }, [interimTranscript, transcript, listening, ans]);




//     // useEffect(() => {
//     //     // Set the timeout when the component mounts
//     //     const timer = setTimeout(() => {
//     //         SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
//     //     }, 3000); // Waits for 5 seconds

//     //     // Cleanup function to clear the timeout when the component unmounts
//     //     return () => {
//     //         clearTimeout(timer);
//     //     };
//     // }, [hrQuestion]);

//     useEffect(() => {
//         setTs(transcript)
//     }, [transcript])

//     useEffect(() => {
//         if (hrQuestion) {
//             let prePend = "";
//             if (hrQuestion != "Tell me about yourself.") {
//                 prePend = "Let's move to next question...";
//             }

//             SpeechRecognition.stopListening();
//             const synth = window.speechSynthesis;
//             const utterance = new SpeechSynthesisUtterance(prePend + hrQuestion);

//             // Customize settings if needed
//             utterance.lang = 'en-US';
//             utterance.pitch = 1;
//             utterance.rate = 1;

//             // Reduced timing parameters
//             const baseTimeout = 2000; // Reduced base time to 2 seconds
//             const charReadTime = 40;  // Reduced from 70ms to 40ms per character
//             const questionLength = (prePend + hrQuestion).length;
//             const dynamicTimeout = baseTimeout + (questionLength * charReadTime);

//             // Adjusted limits
//             const minTimeout = 2000;  // Minimum 2 seconds
//             const maxTimeout = 15000; // Maximum 15 seconds
//             const finalTimeout = Math.min(Math.max(dynamicTimeout, minTimeout), maxTimeout);

//             console.log(`Question length: ${questionLength}, Timeout: ${finalTimeout}ms`);

//             synth.speak(utterance);

//             // A more accurate approach - wait for speech to finish
//             utterance.onend = function () {
//                 // Add a small buffer of 500ms after speech ends
//                 setTimeout(() => {
//                     SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
//                 }, 500);
//             };

//             // Fallback in case onend doesn't trigger
//             setTimeout(() => {
//                 if (!SpeechRecognition.listening) {
//                     SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
//                 }
//             }, finalTimeout);
//         }

//     }, [hrQuestion])



//     useEffect(() => {
//         // Request the first question on component mount

//         async function resetI() {
//             await fetch('http://localhost:5000/reset_interview/harshkoshti12@gmail.com', {
//                 method: 'post'
//             })
//         }
//         // Listen for new questions and feedback from the server
//         socketRef.current.on('new_question', async (data) => {
//             if (data.interview_finished) {

//                 await resetI()
//                 window.location.href = '/hrfeedback'
//             } else {
//                 setHrQuestion(data.question);
//                 setTranscriptCleared(false); // Reset transcriptCleared for the new question
//             }
//         });

//         socketRef.current.on('transcript_feedback', (data) => setFeedback(data));

//         return () => {
//             // Clean up event listeners on component unmount
//             socketRef.current.off('new_question');
//             socketRef.current.off('transcript_feedback');
//         };
//     }, []);

//     const handleStopListening = () => {
//         setResetCounter(prev => prev + 1);
//         const userId = 1;
//         SpeechRecognition.stopListening();

//         setPrevTs(0)

//         if (!transcriptCleared) {
//             socketRef.current.emit('send_transcript', { transcript, hrQuestion, email, overAllEmotion });
//         }


//         setShow('feedback');

//         setTranscriptCleared(true);
//         resetTranscript(); // Clear the transcript for the next question

//         if (userData) {
//             let job_role = userData.customJobRole.length > 0 ? userData.customJobRole : userData.jobRole;
//             let specialization = userData.specialization;
//             let degree = userData.degree;
//             socketRef.current.emit('request_question', { userId: userId, email, job_role, specialization, degree }); // Request the next question
//         }
//         setFeedback(null); // Reset feedback for the new question

//         // Analyze emotions and update feedback
//         let most;
//         let mostc = 0;
//         Object.keys(emotionCounts).forEach((key) => {
//             if (emotionCounts[key] > mostc) {
//                 most = key;
//                 mostc = emotionCounts[key];
//             }
//         });

//         setEmotionCounts({ ...emotionCounts, [most]: 0 }); // Reset the count for the most detected emotion
//         setFeedback_emotion('Most of the time ' + feedbackMap.get(most));

//         setTimeout(() => {
//             setOverAllEmotion([])
//         }, 2000)

//     };

//     useEffect(() => {
//         console.log("the state checking ", ans)
//         if (ans == 'no') {
//             handleStopListening();
//             setModel(false)
//             setAns('notset')
//         } // Call the function when `state` changes
//     }, [ans]);


//     useEffect(() => {
//         let silenceTimeout;
//         if (silenceDetected) {
//             silenceTimeout = setTimeout(() => {
//                 handleStopListening();
//                 setModel(false)
//                 setAns('notset')
//             }, 5000)
//         } else {
//             setSilenceDetected(false);
//             clearTimeout(silenceTimeout)
//         }

//         return () => clearTimeout(silenceTimeout);

//     }, [silenceDetected])

//     //start trigger 

//     useEffect(() => {

//         if (start) {
//             handleStopListening();
//         }
//     }, [start])

//     if (!browserSupportsSpeechRecognition) {
//         return <p>Speech Recognition is not supported in this browser. Please try using Chrome.</p>;
//     }
//     const styles = "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-2  "

//     return (
//         <div>



//             <div className={`p-4 mx-auto w-[90%]  bg-blue-400 ${styles} mt-4 rounded-lg`}>

//                 <div className="emotion ">
//                     <span className="text-white  font-bold text-xl">Detected Emotion :</span> <span className="text-slate-600 inline-block font-bold text-xl p-1 ml-3 text-center w-[180px] bg-amber-200 rounded-lg"> {emotion}</span>
//                 </div>
//             </div>
//             {/* <div className={`p-4 mx-auto w-[90%] r bg-gray-100 ${styles} mt-4 rounded-lg`}>
//                 <h2>Tips : </h2>
//                 <div className="bg-gray-300 p-2 m-1 rounded-lg">
//                     <ul class=" list-disc pl-8 texthw">
//                         <li>Speak clearly and at a moderate pace.</li>
//                         <li>Look at the camera, not the screen.</li>
//                         <li>Avoid speaking too quickly.</li>
//                         <li>Keep answers short and focused.</li>
//                         <li>Sit up straight and gesture naturally.</li>
//                     </ul>
//                 </div>

//             </div> */}

//             <div className={`p-4 mx-auto w-[90%] text-center bg-gray-100 ${styles} mt-4 rounded-lg `}>


//                 <div className="flex justify-center space-x-4 mt-4">

//                     {/* <button onClick={startListening} className="px-4 py-2 bg-green-500 text-white rounded-lg">Start Listening</button> */}
//                     <button onClick={handleStopListening} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700">Next Question</button>

//                 </div>

//                 {/* {feedback && (
//                     <div className="mt-4 bg-yellow-100 p-3 rounded-lg text-yellow-800">
//                         <h4 className="font-semibold">Feedback:</h4>
//                         <p className="text-justify">{feedback.feedback} </p>
//                     </div>
//                 )} */}
//                 <SpeakingPaceIndicator userTranscript={transcript} isInterviewInProgress={true} resetTrigger={resetCounter} />
//                 <div className="mt-4 p-3 bg-gray-100 border rounded-lg">
//                 </div>
//             </div>


//         </div>
//     );
// };

// export default VoiceDetection;
import React, { useContext, useEffect, useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { context } from "../context/Context";
import SpeakingPaceIndicator from "./PaceIndicator";
import 'regenerator-runtime/runtime';
const feedbackMap = new Map([
    ["Angry", "You seem to be feeling defensive. This could be a sign that you are stressed or overwhelmed. Consider taking a moment to relax your facial muscles and breathe deeply. Practicing mindfulness can also help manage feelings of anger."],
    ["Fearful", "It looks like you're experiencing some nervousness or anxiety. This might be affecting your confidence. Try to ground yourself by focusing on your breathing and reminding yourself of your strengths. Visualization techniques can also help ease fear."],
    ["Happy", "Fantastic! Your expressions show confidence and excitement, which can positively influence those around you. Continue to embrace this positivity, and consider sharing your happiness with others, as it can uplift their spirits too."],
    ["Neutral", "Your expressions indicate curiosity or calmness. This can be a great state for listening and absorbing information. Stay open-minded, and engage with your surroundings. You might also explore new ideas or ask questions to deepen your understanding."],
    ["Sad", "It seems you might be feeling frustration or disappointment. Acknowledging these feelings is the first step to overcoming them. Consider reflecting on what may have caused these emotions and think about actions you can take to improve your situation."],
    ["Surprised", "You appear to be curious about the unknown, which is a great mindset for learning! Embrace this curiosity and use it to explore new topics or ask questions. Consider keeping a journal to document your thoughts and discoveries."],
]);

const VoiceDetection = ({ model, setModel, feedback_emotion, socketRef, setFeedback_emotion, show, setShow, setEmotionCounts, emotionCounts }) => {
    // State management
    const [transcript, setTranscript] = useState("");

    const [listening, setListening] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [resetCounter, setResetCounter] = useState(0);

    // Refs for stable references
    const recognitionRef = useRef(null);
    const transcriptSavedRef = useRef(true); // Used to track if we should preserve the transcript
    const resultsRef = useRef([]);

    // Context
    const {
        transcriptCleared, setTranscriptCleared,
        hrQuestion, setHrQuestion,
        ts, setTs,
        emotion, setEmotion,
        prevTs, setPrevTs,
        ans, setAns,
        start, email,
        overAllEmotion, setOverAllEmotion,
        userData, interimTranscript, setInterimTranscript
    } = useContext(context);

    // Initialize SpeechRecognition
    useEffect(() => {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error("Speech recognition not supported in this browser");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        // Configure recognition
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        // Set up event handlers
        recognitionRef.current.onstart = () => {
            setListening(true);
        };

        recognitionRef.current.onend = () => {
            setListening(false);
            // Auto-restart if we're supposed to be listening
            if (listening && !transcriptCleared) {
                try {
                    recognitionRef.current.start();
                } catch (error) {
                    console.error("Error restarting speech recognition:", error);
                }
            }
        };

        recognitionRef.current.onresult = (event) => {
            let finalText = "";
            let interimText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript + " ";
                } else {
                    interimText += result[0].transcript + " ";
                }
            }

            // Only update the transcript if there's new final text
            if (finalText.trim().length > 0) {
                setTranscript(prev => prev + " " + finalText.trim());
            }

            setInterimTranscript(interimText.trim());
            setModel(false);
        };


        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        return () => {
            // Clean up
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Update context with transcript
    useEffect(() => {
        setTs(transcript);
    }, [transcript, setTs]);

    // Handle HR question speech synthesis
    useEffect(() => {
        if (hrQuestion) {
            let prePend = "";
            if (hrQuestion !== "Tell me about yourself.") {
                prePend = "Let's move to next question...";
            }

            // Stop listening while speaking
            stopRecognition();

            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(prePend + hrQuestion);

            // Customize settings
            utterance.lang = 'en-US';
            utterance.pitch = 1;
            utterance.rate = 1;

            // Calculate appropriate timing
            const baseTimeout = 2000;
            const charReadTime = 40;
            const questionLength = (prePend + hrQuestion).length;
            const dynamicTimeout = baseTimeout + (questionLength * charReadTime);
            const finalTimeout = Math.min(Math.max(dynamicTimeout, 2000), 15000);

            console.log(`Question length: ${questionLength}, Timeout: ${finalTimeout}ms`);

            synth.speak(utterance);

            // Start listening when speech ends
            utterance.onend = function () {
                setTimeout(() => {
                    // Reset transcript before starting new question
                    resetTranscript();
                    startRecognition();
                }, 500);
            };

            // Fallback in case onend doesn't trigger
            setTimeout(() => {
                if (!listening) {
                    // Reset transcript before starting new question
                    resetTranscript();
                    startRecognition();
                }
            }, finalTimeout);
        }
    }, [hrQuestion]);

    // Socket communication setup
    useEffect(() => {
        async function resetInterview() {
            await fetch('http://localhost:5000/reset_interview/harshkoshti12@gmail.com', {
                method: 'post'
            });
        }

        // Listen for new questions and feedback from the server
        socketRef.current.on('new_question', async (data) => {
            if (data.interview_finished) {
                await resetInterview();
                window.location.href = '/hrfeedback';
            } else {
                setHrQuestion(data.question);
                setTranscriptCleared(false); // Reset for the new question
            }
        });

        socketRef.current.on('transcript_feedback', (data) => setFeedback(data));

        return () => {
            // Clean up listeners
            socketRef.current.off('new_question');
            socketRef.current.off('transcript_feedback');
        };
    }, []);

    // Handle "No" answer
    useEffect(() => {
        if (ans === 'no') {
            handleStopListening();
            setModel(false);
            setAns('notset');
        }
    }, [ans]);

    // Handle start trigger
    useEffect(() => {
        if (start) {
            handleStopListening();
        }
    }, [start]);

    // Utility functions for recognition control
    const startRecognition = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setListening(true);
            } catch (error) {
                console.error("Error starting speech recognition:", error);
            }
        }
    };

    const stopRecognition = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                setListening(false);
            } catch (error) {
                console.error("Error stopping speech recognition:", error);
            }
        }
    };

    const resetTranscript = () => {
        resultsRef.current = [];
        setTranscript("");
        setInterimTranscript("");
        transcriptSavedRef.current = false; // Mark that we're not preserving transcript
    };

    const handleStopListening = () => {
        setResetCounter(prev => prev + 1);
        stopRecognition();
        setPrevTs(0);

        if (!transcriptCleared) {
            socketRef.current.emit('send_transcript', {
                transcript,
                hrQuestion,
                email,
                overAllEmotion
            });
        }

        setShow('feedback');
        setTranscriptCleared(true);
        resetTranscript();

        if (userData) {
            let job_role = userData.customJobRole.length > 0 ? userData.customJobRole : userData.jobRole;
            let specialization = userData.specialization;
            let degree = userData.degree;
            socketRef.current.emit('request_question', {
                userId: 1,
                email,
                job_role,
                specialization,
                degree
            });
        }

        setFeedback(null);

        // Analyze emotions and update feedback
        let most;
        let mostc = 0;
        Object.keys(emotionCounts).forEach((key) => {
            if (emotionCounts[key] > mostc) {
                most = key;
                mostc = emotionCounts[key];
            }
        });

        setEmotionCounts({ ...emotionCounts, [most]: 0 }); // Reset the count
        setFeedback_emotion('Most of the time ' + feedbackMap.get(most));

        setTimeout(() => {
            setOverAllEmotion([]);
        }, 2000);
    };

    // Toggle microphone without resetting transcript
    const toggleListening = () => {
        if (listening) {
            stopRecognition();
            // Set flag to keep transcript when restarted
            transcriptSavedRef.current = true;
        } else {
            // Start recognition without resetting transcript
            transcriptSavedRef.current = true; // Keep existing transcript
            startRecognition();
        }
    };

    const styles = "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-2";

    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return <p>Speech Recognition is not supported in this browser. Please try using Chrome.</p>;
    }

    return (
        <div>
            <div className={`p-4 mx-auto w-[90%] bg-blue-400 ${styles} mt-4 rounded-lg`}>
                <div className="emotion">
                    <span className="text-white font-bold text-xl">Detected Emotion:</span>
                    <span className="text-slate-600 inline-block font-bold text-xl p-1 ml-3 text-center w-[180px] bg-amber-200 rounded-lg">
                        {emotion}
                    </span>
                </div>
            </div>

            <div className={`p-4 mx-auto w-[90%] text-center bg-gray-100 ${styles} mt-4 rounded-lg`}>
                <div className="flex justify-center items-center space-x-4 mt-4">
                    <button
                        onClick={toggleListening}
                        className={`px-4 py-2 flex items-center gap-2 text-white rounded-lg ${listening ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}
                    >
                        {listening ? (
                            <>
                                <MicOff size={20} />
                                Stop Listening
                            </>
                        ) : (
                            <>
                                <Mic size={20} />
                                Start Listening
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleStopListening}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700"
                    >
                        Next Question
                    </button>
                </div>

                {/* <div className="mt-4 p-3 bg-gray-200 border rounded-lg text-left">
                    <div className="font-semibold mb-2">Current Transcript:</div>
                    <div className="mb-2">{transcript}</div>
                    {interimTranscript && (
                        <div className="text-gray-500 italic">{interimTranscript}</div>
                    )}
                </div> */}

                <SpeakingPaceIndicator
                    userTranscript={transcript}
                    interimTranscript ={interimTranscript}
                    isInterviewInProgress={true}
                    resetTrigger={resetCounter}
                />
            </div>
        </div>
    );
};

export default VoiceDetection;