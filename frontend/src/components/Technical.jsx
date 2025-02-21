import React, { useState, useEffect, useRef } from "react";
import QuestionPanel from "./QuestionPanel";
import Navbar from "./Navbar";
import io from "socket.io-client";
import Alert from "./Alert";

function Technical() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [detectedEmotion, setDetectedEmotion] = useState("Neutral");
  const [emotionHistory, setEmotionHistory] = useState([]); // Keep last few emotions
  const socketRef = useRef(null);
  const videoRef = useRef(null);

  const fixedSkills = ["java", "css", "python"]; // Fixed array of skills

  useEffect(() => {
    fetch("http://localhost:5001/get_questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skills: fixedSkills }),
    })
      .then((response) => response.json())
      .then((data) => {
        const limitedQuestions = data.questions.slice(0, 5);
        setQuestions(limitedQuestions);
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("emotion_result", (data) => {
      if (data.emotions && data.emotions.length > 0) {
        const newEmotion = data.emotions[0];

        // Keep only the last 3 emotions in history
        setEmotionHistory((prevHistory) => {
          const updatedHistory = [...prevHistory, newEmotion];
          if (updatedHistory.length > 3) updatedHistory.shift(); // Keep only the last 3 emotions
          return updatedHistory;
        });
      }
    });
    
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startVideo();

    const captureFrame = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imgData = canvas.toDataURL("image/png");
        socketRef.current.emit("image_frame", imgData); // Send frame to backend
      }
    };

    const intervalId = setInterval(captureFrame, 1000); // Capture frame every 1 second

    return () => {
      clearInterval(intervalId);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Update detected emotion based on the most recent data
  useEffect(() => {
    if (emotionHistory.length > 0) {
      const emotionCounts = emotionHistory.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});

      // Choose the most frequent emotion in the last 3 detected emotions
      const mostFrequentEmotion = Object.keys(emotionCounts).reduce((a, b) =>
        emotionCounts[a] > emotionCounts[b] ? a : b
      );

      setDetectedEmotion(mostFrequentEmotion); // Set the most frequent emotion
    }
  }, [emotionHistory]);

  const handleSubmitAnswer = (question, userAnswer) => {
    fetch("http://localhost:5001/evaluate_answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, user_answer: userAnswer }),
    })
      .then((response) => response.json())
      .then((feedback) => {
        setQuestions((prev) =>
          prev.map((q, index) =>
            index === currentQuestionIndex ? { ...q, feedback } : q
          )
        );
      })
      .catch((error) => console.error("Error submitting answer:", error));
  };

  return (
    
    <div className="App">
      <Navbar />
      {questions.length > 0 ? (
        <QuestionPanel
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          onSubmitAnswer={handleSubmitAnswer}
          detectedEmotion={detectedEmotion}
          socketRef={socketRef}
        />
      ) : (
        <p>Loading questions...</p>
      )}

      {/* Video feed displaying the user's face */}
      <div
  style={{
    position: "absolute",
    top: 165,  // Position it 10px from the top
    left: 150, // Position it 10px from the left
     // Increase the height of the camera window
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  }}
>
        <video ref={videoRef} autoPlay muted style={{
      width: "430px",  // Make the video stretch to fill the container
      height: "330px", // Make the video stretch to fill the container
      objectFit: "cover"  // Ensure the video covers the entire area without distortion
    }} />
      </div>

      {/* Emotion Display */}
      <div style={{
       
      }}>
        
      </div>
    </div>
  );
}

export default Technical;
