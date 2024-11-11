import { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import './Hr.css';
import Face_Emotion_detection from './Face_Emotion_detection';
import Voice_detection from './Voice_detection';
import loader from '../assets/loader.gif'
import Navbar from './Navbar';
function Hr() {

  const socketRef = useRef(null);
  const [check, setCheck] = useState(false)
  const [feedback, setFeedback] = useState('');
  const [show, setShow] = useState('off')
  const [emotionCounts, setEmotionCounts] = useState({
    Angry: 0,
    Fearful: 0,
    Happy: 0,
    Neutral: 0,
    Sad: 0,
    Surprised: 0,
  });
  // Ref to track video stream status

  // {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}

  /*
  facial emotion        interview emotion     facial indicators
  Angry->               Defensiveness         Squinting, clenched jaw, crossed arms  
  Fearful->             Nervousness/Anxietys      Furrowed brows, pursed lips, fidgeting, sweating
  Happy->               Confidence/Excitement       Bright eyes, animated expressions, frequent smiling Relaxed facial muscles, direct eye contact, slight smile
  Neutral->               Curiosity/normal         Slight head tilts, raised eyebrows
  Sad->                Frustration/Disappointment     Frowning, lip biting, tense jaw
  Surprised->               Curiosity/unknownto ans        Raised eyebrows, wide-open eyes, slightly parted lips 
  Angry->                     
  */console.log(show)

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    if (socketRef.current) {
      setTimeout(() => {
        setCheck(true)
      }, 3000);
    }

    return () => {

      socketRef.current.disconnect(); // Disconnect the WebSocket

    };
  }, []);

  return (
    <div>
      <Navbar />
      {check == false ? <div className='loaderDiv'>
        <img className='loader' src={loader} alt="" />
        <p>Setting Up for You...</p>
      </div> : ''}

      <div className=" grid grid-cols-[1.5fr_1fr] gap-4 ">
        {check ? <div className='relative'>
          <Face_Emotion_detection socketRef={socketRef} feedback={feedback} setFeedback={setFeedback} show={show} emotionCounts={emotionCounts} setEmotionCounts={setEmotionCounts} />
        </div> : ''}
        {check ? <Voice_detection socketRef={socketRef} show={show} setShow={setShow} feedback_emotion={feedback} setFeedback_emotion={setFeedback} emotionCounts={emotionCounts} setEmotionCounts={setEmotionCounts} /> : ''}

      </div>
    </div>
  );
}

export default Hr;

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