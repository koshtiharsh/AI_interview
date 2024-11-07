// import { useEffect, useRef, useState } from 'react';

// function Face_Emotion_detection({ socketRef, feedback, setFeedback, show, setEmotionCounts, emotionCounts }) {
//     const videoRef = useRef(null);
//     const [emotion, setEmotion] = useState('');
//     const isVideoActive = useRef(false);




//     useEffect(() => {
//         const startVideo = async () => {
//             try {
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//                 videoRef.current.srcObject = stream;
//                 isVideoActive.current = true;

//                 stream.getVideoTracks()[0].onended = () => {
//                     isVideoActive.current = false;
//                 };
//             } catch (error) {
//                 console.error("Error accessing webcam:", error);
//             }
//         };

//         const captureFrame = () => {
//             if (isVideoActive.current && videoRef.current.srcObject) {
//                 const canvas = document.createElement('canvas');
//                 canvas.width = videoRef.current.videoWidth;
//                 canvas.height = videoRef.current.videoHeight;

//                 const context = canvas.getContext('2d');
//                 context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

//                 const imgData = canvas.toDataURL('image/png');
//                 socketRef.current.emit('image_frame', imgData);
//             }
//         };

//         startVideo();

//         const intervalId = setInterval(captureFrame, 1000);

//         const handleEmotionResult = (data) => {
//             console.log('Emotion detected:', data);
//             if (data.emotions && data.emotions.length > 0) {
//                 const detectedEmotion = data.emotions[0];
//                 setEmotion(detectedEmotion);

//                 setEmotionCounts(prevCounts => {
//                     const newCounts = {
//                         ...prevCounts,
//                         [detectedEmotion]: prevCounts[detectedEmotion] + 1
//                     };
//                     // console.log('Updated emotion counts:', newCounts);
//                     return newCounts;
//                 });

//                 // if (feedbackMap.has(detectedEmotion)) {
//                 //     setFeedback(prevFeedback => prevFeedback + ' ' + feedbackMap.get(detectedEmotion));
//                 // } else {
//                 //     setFeedback(prevFeedback => prevFeedback + ' No clear emotion detected. Remember, it\'s always good to reflect on how you\'re feeling!');
//                 // }
//             }
//         };

//         socketRef.current.on('emotion_result', handleEmotionResult);

//         return () => {
//             clearInterval(intervalId);
//             if (videoRef.current.srcObject) {
//                 const tracks = videoRef.current.srcObject.getTracks();
//                 tracks.forEach(track => track.stop());
//             }
//             if (videoRef.current) {
//                 videoRef.current.srcObject = null; // Clear srcObject on unmount
//             }
//             isVideoActive.current = false;
//             socketRef.current.off('emotion_result', handleEmotionResult);
//         };
//     }, [socketRef, setEmotionCounts]);

//     return (
//         <div>
//             <video ref={videoRef} autoPlay muted />
//             <p>Detected Emotion: {emotion}</p>
//             <h3>Emotion Counts:</h3>
//             <ul>
//                 {Object.entries(emotionCounts).map(([em, count]) => (
//                     <li key={em}>{em}: {count}</li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// export default Face_Emotion_detection;

import { useContext, useEffect, useRef, useState } from 'react';
import { context } from '../context/Context';

function FaceEmotionDetection({ socketRef, feedback, setFeedback, show, setEmotionCounts, emotionCounts, }) {
    const videoRef = useRef(null);

    const isVideoActive = useRef(false);
    const { hrQuestion, transcriptCleared, ts, emotion, setEmotion } = useContext(context)


    useEffect(() => {
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                isVideoActive.current = true;

                stream.getVideoTracks()[0].onended = () => {
                    isVideoActive.current = false;
                };
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        const captureFrame = () => {
            if (isVideoActive.current && videoRef.current.srcObject) {
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;

                const context = canvas.getContext('2d');
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                const imgData = canvas.toDataURL('image/png');
                socketRef.current.emit('image_frame', imgData);
            }
        };

        startVideo();
        const intervalId = setInterval(captureFrame, 1000);

        const handleEmotionResult = (data) => {
            if (data.emotions && data.emotions.length > 0) {
                const detectedEmotion = data.emotions[0];
                setEmotion(detectedEmotion);

                setEmotionCounts(prevCounts => {
                    const newCounts = {
                        ...prevCounts,
                        [detectedEmotion]: prevCounts[detectedEmotion] + 1
                    };
                    return newCounts;
                });
            }
        };

        socketRef.current.on('emotion_result', handleEmotionResult);

        return () => {
            clearInterval(intervalId);
            if (videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            socketRef.current.off('emotion_result', handleEmotionResult);
        };
    }, [socketRef, setEmotionCounts]);

    const styles = "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-2  "


    return (
        <>
            <div className={`${styles}  h-[370px] bg-gray-100 rounded-lg p-2 ml-10 flex flex-col items-center justify-center mt-4 border-l-[6px]  border-blue-500`}>
                <video ref={videoRef} className=" h-auto rounded-md p-2 overflow-hidden" autoPlay muted />
                {/* <p className="text-white text-center mt-2">Emotion: {emotion}</p> */}

            </div>
            <div className={` ml-10 ${styles} rounded-lg mt-4 bg-gray-100 border-l-[6px]  border-blue-500 p-4`}>
                <h2 className="text-xl font-semibold text-gray-800"> Question:</h2>
                {hrQuestion && (
                    <div className={`bg-gray-300 text-center  text-white p-2 rounded-lg mt-2 text-xl ${styles}  rounded-lg`}>
                        <p className='text-slate-800 font-bold text-lg' >{hrQuestion}</p>
                    </div>
                )}
                <h2 className="text-xl font-semibold text-gray-600 mt-4 "> Your Answer:</h2>

                <div className="p-3 bg-gray-300 border rounded-lg cursor-pointer" >
                    {transcriptCleared ? '' : ts}
                </div>

            </div>

        </>
    );
}

export default FaceEmotionDetection;
