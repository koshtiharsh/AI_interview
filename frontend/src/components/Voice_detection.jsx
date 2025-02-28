

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
const VoiceDetection = ({ model, setModel, feedback_emotion, socketRef, setFeedback_emotion, show, setShow, setEmotionCounts, emotionCounts }) => {
    const [textToCopy, setTextToCopy] = useState();
    const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });

    const [feedback, setFeedback] = useState(null);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition, stopListening, interimTranscript, listening } = useSpeechRecognition();
    // const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });


    const { transcriptCleared, setTranscriptCleared, hrQuestion, setHrQuestion, ts, setTs, emotion, setEmotion, prevTs, setPrevTs, ans, setAns, start } = useContext(context)


    const [silenceDetected, setSilenceDetected] = useState(false);


    useEffect(() => {
        const silenceDuration = 3000; // 10 seconds of silence
        let silenceTimeout;

        if (listening) {
            if (!interimTranscript) {
                // If there's no interim transcript for 10 seconds, trigger operation
                silenceTimeout = setTimeout(() => {
                    setSilenceDetected(true);
                    setModel(true)

                }, silenceDuration);
            } else {
                // If speech is being detected, clear the timeout
                setSilenceDetected(false);
                setModel(false)
                clearTimeout(silenceTimeout);
            }

            if (ans == 'yes') {
                setSilenceDetected(false);
                setAns('notset')
                clearTimeout(silenceTimeout);
            }
            if (ans == 'no') {
                setSilenceDetected(false);
                setModel(false)
                clearTimeout(silenceTimeout);
            }
        }

        return () => clearTimeout(silenceTimeout); // Clean up timeout when component unmounts
    }, [interimTranscript, listening, silenceDetected, ans]);




    // useEffect(() => {
    //     // Set the timeout when the component mounts
    //     const timer = setTimeout(() => {
    //         SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
    //     }, 3000); // Waits for 5 seconds

    //     // Cleanup function to clear the timeout when the component unmounts
    //     return () => {
    //         clearTimeout(timer);
    //     };
    // }, [hrQuestion]);

    useEffect(() => {
        setTs(transcript)
    }, [transcript])

    useEffect(() => {
        if (hrQuestion) {
            let prePend = "";
            if (hrQuestion != "Tell me about yourself.") {
                prePend = "Lets Move to next question , , ,"

            }
            SpeechRecognition.stopListening()
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(prePend + hrQuestion);

            // Customize settings if needed
            utterance.lang = 'en-US'; // Language
            utterance.pitch = 1;      // Pitch (0 to 2)
            utterance.rate = 1;       // Rate (0.1 to 10)

            synth.speak(utterance);

            setTimeout(() => {
                SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
            }, 3000);
        }


    }, [hrQuestion])



    useEffect(() => {
        // Request the first question on component mount


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
        const userId = 1;
        SpeechRecognition.stopListening();

        setPrevTs(0)

        if (!transcriptCleared) {
            socketRef.current.emit('send_transcript', { transcript, hrQuestion, userId });
        }


        setShow('feedback');
        setTranscriptCleared(true);
        resetTranscript(); // Clear the transcript for the next question
        socketRef.current.emit('request_question', { userId: userId }); // Request the next question
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


    };

    useEffect(() => {
        console.log("the state checking ", ans)
        if (ans == 'no') {
            handleStopListening();
            setModel(false)
            setAns('notset')
        } // Call the function when `state` changes
    }, [ans]);


    useEffect(() => {
        let silenceTimeout;
        if (silenceDetected) {
            silenceTimeout = setTimeout(() => {
                handleStopListening();
                setModel(false)
                setAns('notset')
            }, 5000)
        } else {
            setSilenceDetected(false);
            clearTimeout(silenceTimeout)
        }

        return () => clearTimeout(silenceTimeout);

    }, [silenceDetected])

    //start trigger 

    useEffect(() => {

        if (start) {
            handleStopListening();
        }
    }, [start])

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

            <div className={`p-4 mx-auto w-[90%] text-center bg-gray-100 ${styles} mt-4 rounded-lg `}>


                <div className="flex justify-center space-x-4 mt-4">

                    {/* <button onClick={startListening} className="px-4 py-2 bg-green-500 text-white rounded-lg">Start Listening</button> */}
                    <button onClick={handleStopListening} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700">Next Question</button>

                </div>

                {feedback && (
                    <div className="mt-4 bg-yellow-100 p-3 rounded-lg text-yellow-800">
                        <h4 className="font-semibold">Feedback:</h4>
                        <p className="text-justify">{feedback.feedback} </p>
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
