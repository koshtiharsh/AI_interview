import { useEffect, useRef } from 'react';
import io from "socket.io-client";
import './App.css';

function App() {
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const isVideoActive = useRef(false); // Ref to track video stream status

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        isVideoActive.current = true; // Set video stream status to active

        // Listen for 'ended' event to detect when the stream is closed
        stream.getVideoTracks()[0].onended = () => {
          isVideoActive.current = false; // Update video status
        };

      } catch (error) {
        console.log("Error in accessing webcam", error);
      }
    };

    const captureFrame = () => {
      if (isVideoActive.current && videoRef.current.srcObject) { // Check if video is active
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imgData = canvas.toDataURL('image/png'); // Convert canvas frame to base64 format
        socketRef.current.emit('image_frame', imgData); // Emit image only if video is active
      } else {
        startVideo();
      }
    };

    startVideo();

    const intervalId = setInterval(captureFrame, 10000); // Capture frame every 10 seconds

    socketRef.current.on('emotion_result', (data) => {
      console.log('Emotion detected:', data);
      // Handle the received data (update UI, display emotions, etc.)
    });

    return () => {
      clearInterval(intervalId); // Stop the frame capture timer
      socketRef.current.disconnect(); // Disconnect the WebSocket
      isVideoActive.current = false; // Reset video status
    };
  }, []);

  return (
    <div>
      <h1>Emotion Detection</h1>
      {/* Video element where the webcam stream will be displayed */}
      <video ref={videoRef} autoPlay muted style={{ width: '600px' }} />
      <p>Open your webcam to start emotion detection.</p>
    </div>
  );
}

export default App;

// import React, { useState, useEffect, useRef } from 'react';

// const App = () => {
//   const [isVideoOn, setIsVideoOn] = useState(false);
//   const videoRef = useRef(null);
//   const mediaStreamRef = useRef(null);

//   const startVideo = async () => {
//     try {
//       mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = mediaStreamRef.current;
//       videoRef.current.play();
//       setIsVideoOn(true);
//     } catch (err) {
//       console.error("Error accessing the camera: ", err);
//     }
//   };

//   const stopVideo = () => {
//     if (mediaStreamRef.current) {
//       mediaStreamRef.current.getTracks().forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//       setIsVideoOn(false);
//     }
//   };

//   const toggleVideo = () => {
//     if (isVideoOn) {
//       stopVideo();
//     } else {
//       startVideo();
//     }
//   };

//   useEffect(() => {
//     return () => {
//       Cleanup when the component unmounts
//       stopVideo();
//     };
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} width="640" height="480" autoPlay muted />
//       <button onClick={toggleVideo}>
//         {isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
//       </button>
//     </div>
//   );
// };

// export default App;