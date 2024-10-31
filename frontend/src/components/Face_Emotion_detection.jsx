import { useEffect, useRef, useState } from 'react';

function Face_Emotion_detection({ socketRef, feedback, setFeedback, show, setEmotionCounts, emotionCounts }) {
    const videoRef = useRef(null);
    const [emotion, setEmotion] = useState('');
    const isVideoActive = useRef(false);




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
            console.log('Emotion detected:', data);
            if (data.emotions && data.emotions.length > 0) {
                const detectedEmotion = data.emotions[0];
                setEmotion(detectedEmotion);

                setEmotionCounts(prevCounts => {
                    const newCounts = {
                        ...prevCounts,
                        [detectedEmotion]: prevCounts[detectedEmotion] + 1
                    };
                    // console.log('Updated emotion counts:', newCounts);
                    return newCounts;
                });

                // if (feedbackMap.has(detectedEmotion)) {
                //     setFeedback(prevFeedback => prevFeedback + ' ' + feedbackMap.get(detectedEmotion));
                // } else {
                //     setFeedback(prevFeedback => prevFeedback + ' No clear emotion detected. Remember, it\'s always good to reflect on how you\'re feeling!');
                // }
            }
        };

        socketRef.current.on('emotion_result', handleEmotionResult);

        return () => {
            clearInterval(intervalId);
            if (videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null; // Clear srcObject on unmount
            }
            isVideoActive.current = false;
            socketRef.current.off('emotion_result', handleEmotionResult);
        };
    }, [socketRef, setEmotionCounts]);

    return (
        <div>
            <video ref={videoRef} autoPlay muted />
            <p>Detected Emotion: {emotion}</p>
            <h3>Emotion Counts:</h3>
            <ul>
                {Object.entries(emotionCounts).map(([em, count]) => (
                    <li key={em}>{em}: {count}</li>
                ))}
            </ul>
        </div>
    );
}

export default Face_Emotion_detection;