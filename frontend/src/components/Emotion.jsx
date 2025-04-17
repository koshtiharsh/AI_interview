
import { useContext, useEffect, useRef, useState } from 'react';
import { context } from '../context/Context';
import { io } from 'socket.io-client';

function Emotion({ socketRef }) {

    const videoRef = useRef(null);
    const isVideoActive = useRef(false);
    const [lightingWarning, setLightingWarning] = useState('');
    const { hrQuestion, transcriptCleared, ts, emotion, setEmotion, email, overAllEmotion, setOverAllEmotion } = useContext(context);


    const checkLightingConditions = (imageData) => {
        const width = imageData.width;
        const height = imageData.height;
        const pixels = imageData.data;

        // Define center region (40% of width and height)
        const centerXStart = Math.floor(width * 0.3);
        const centerXEnd = Math.floor(width * 0.7);
        const centerYStart = Math.floor(height * 0.3);
        const centerYEnd = Math.floor(height * 0.7);

        // Multiple lighting metrics
        let centerBrightness = 0;
        let centerContrast = 0;
        let centerVariance = 0;
        let centerPixelCount = 0;

        // Arrays to track brightness values for variance calculation
        const brightnessValues = [];

        // Analyze center region
        for (let y = centerYStart; y < centerYEnd; y++) {
            for (let x = centerXStart; x < centerXEnd; x++) {
                const index = (y * width + x) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];

                // Luminance calculation
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

                centerBrightness += luminance;
                brightnessValues.push(luminance);
                centerPixelCount++;
            }
        }

        // Calculate average brightness
        const avgCenterBrightness = centerBrightness / centerPixelCount;

        // Calculate variance of brightness
        const variance = brightnessValues.reduce((acc, val) => {
            return acc + Math.pow(val - avgCenterBrightness, 2);
        }, 0) / brightnessValues.length;

        // Determine lighting conditions with multiple parameters
        let warningMessage = '';

        // Check average brightness
        if (avgCenterBrightness < 30) {
            warningMessage += 'Too dark. ';
        } else if (avgCenterBrightness > 220) {
            warningMessage += 'Extremely bright. ';
        }

        // Check brightness variance (indicates uneven lighting)
        if (variance > 5000) {
            warningMessage += 'Uneven lighting detected. ';
        }

        console.log(variance + "this is var")
        console.log(overAllEmotion)
        // Check extreme brightness variations
        const maxBrightness = Math.max(...brightnessValues);
        const minBrightness = Math.min(...brightnessValues);
        if (maxBrightness - minBrightness > 250) {
            warningMessage += 'High lighting inconsistency. ';
        }

        console.log(maxBrightness - minBrightness + "this is diff")


        // Set warning if any issues detected
        setLightingWarning(warningMessage.trim());
    };

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

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                checkLightingConditions(imageData);

                const imgData = canvas.toDataURL('image/png');

                if (email) {
                    socketRef.current.emit('image_frame', { imgData, email });
                }
            }
        };

        startVideo();
        const intervalId = setInterval(captureFrame, 1000);

        const handleEmotionResult = (data) => {
            if (data.emotions && data.emotions.length > 0) {
                const detectedEmotion = data.emotions[0];
                setEmotion(detectedEmotion);
                // Create a new emotion data point

                const newEmotionData = {
                    time: Date.now(), // Current timestamp in milliseconds
                    emotion: detectedEmotion
                };

                // Update the state correctly
                setOverAllEmotion(prevEmotions => [...prevEmotions, newEmotionData]);



                // setEmotionCounts(prevCounts => {
                //     const newCounts = {
                //         ...prevCounts,
                //         [detectedEmotion]: prevCounts[detectedEmotion] + 1
                //     };
                //     return newCounts;
                // });
            }
        };

        socketRef.current.on('emotion_result', handleEmotionResult);

        return () => {
            clearInterval(intervalId);
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            socketRef.current.off('emotion_result', handleEmotionResult);
        };
    }, [socketRef]);

    const styles = "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-2  ";

    return (
        <>
            <div className={`${styles}  h-[300px] bg-gray-100 rounded-lg p-2 ml-10 flex flex-col items-center justify-center mt-4 border-l-[6px]  border-blue-500`}>
                <video ref={videoRef} className=" h-auto rounded-md p-2 overflow-hidden" autoPlay muted />
                {lightingWarning && (
                    <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded-md text-center">
                        {lightingWarning}
                    </div>
                )}
            </div>

        </>
    );
}

export default Emotion;