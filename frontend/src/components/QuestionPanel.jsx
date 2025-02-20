import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function QuestionPanel({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  onSubmitAnswer,
  detectedEmotion, // Pass detectedEmotion from the parent component
  videoRef, // Pass the videoRef from parent
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [userAnswers, setUserAnswers] = useState(
    new Array(questions.length).fill("") // Initialize with empty answers
  );
  const [submittedAnswers, setSubmittedAnswers] = useState(
    new Array(questions.length).fill(false) // Track which answers are submitted
  );
  const [viewFeedback, setViewFeedback] = useState(false);

  // Automatically start listening for speech recognition
  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [browserSupportsSpeechRecognition]);

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  // Handle the answer input change (for speaking the answer)
  useEffect(() => {
    if (!submittedAnswers[currentQuestionIndex]) {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = transcript; // Store the transcript as the current answer
      setUserAnswers(newAnswers);
    }
  }, [transcript, currentQuestionIndex, submittedAnswers, userAnswers]);

  // Prevent submission if the answer is empty
  const handleSubmitAnswer = () => {
    const currentAnswer = userAnswers[currentQuestionIndex] || transcript;
    
    if (currentAnswer.trim() === "") {
      // If answer is blank, don't submit, show an error or placeholder message
      alert("Please provide an answer before submitting.");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    onSubmitAnswer(currentQuestion, currentAnswer); // Submit the answer
    const newSubmittedAnswers = [...submittedAnswers];
    newSubmittedAnswers[currentQuestionIndex] = true; // Mark this question as submitted
    setSubmittedAnswers(newSubmittedAnswers);
  };

  // Move to the next question, ensuring that we store the current answer before moving forward
  const handleNextQuestion = () => {
    // Save the current answer (spoken)
    const currentAnswer = userAnswers[currentQuestionIndex] || transcript;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = currentAnswer; // Save the current answer
    setUserAnswers(newAnswers);

    // Reset the transcript and prepare for the next question
    resetTranscript();

    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  // Go back to the previous question
  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  // Show feedback for the test after submission
  if (viewFeedback) {
    return (
      <Feedback
        questions={questions.map((q, idx) => ({
          questionText: q["Question text"],
          userAnswer: userAnswers[idx] || "Not Answered", // Ensure answer is passed here
          feedback: submittedAnswers[idx] ? q.feedback : null,
        }))}
        onBack={() => setViewFeedback(false)}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasSubmitted = submittedAnswers[currentQuestionIndex];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-200 rounded-md">
      {/* Left Section */}
      <div className="w-full md:w-1/2 bg-white p-6 shadow-lg rounded-md border border-gray-300">
        <div className="flex flex-col gap-4">
          {/* User video feed */}
          <div className="bg-gray-200 p-4  border  rounded-md">
          {/* Video element to show user's camera feed */}
          <video
            ref={videoRef} // Connect the video ref to display the webcam feed
            autoPlay
            muted
            className="w-full h-300 object-cover rounded-md"
          />
          </div>


          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Question {currentQuestionIndex + 1}:
          </h2>
          <p className="text-gray-700 text-lg font-medium bg-gray-100 p-4 border rounded-md">
            {currentQuestion["Question text"]}
          </p>

          <textarea
            value={userAnswers[currentQuestionIndex] || transcript} // Display current answer or transcript
            onChange={() => {}}
            placeholder="Answer will be spoken here..."
            className="w-full h-32 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
            disabled={hasSubmitted} // Disable after submission
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`${
              currentQuestionIndex === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-2 rounded-md shadow`}
          >
            Previous
          </button>
          {currentQuestionIndex === questions.length - 1 && hasSubmitted ? (
            <>
              <button
                onClick={() => setViewFeedback(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow"
              >
                See All Feedback
              </button>
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded-md shadow ml-2 cursor-not-allowed"
                disabled
              >
                Finish Test
              </button>
            </>
          ) : hasSubmitted ? (
            <button
              onClick={handleNextQuestion}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmitAnswer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-gray-100 p-4 shadow-lg rounded-md border border-gray-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Feedback
        </h3>
        <div className="space-y-4">
          {/* Detected Emotion in blue box */}
          <p className="text-white text-lg bg-blue-500 p-2 border rounded-md">
            <strong>Detected Emotion:</strong> {detectedEmotion}
          </p>
          {hasSubmitted && currentQuestion.feedback ? (
            <>
              <p
                className={`text-gray-800 text-lg bg-gray-50 p-2 border rounded-md ${{
                  correct: "bg-green-100 border-green-500",
                  incorrect: "bg-yellow-100 border-yellow-500",
                }[currentQuestion.feedback.evaluation]}`}
              >
                <strong>Evaluation:</strong> {currentQuestion.feedback.evaluation}
              </p>
              {currentQuestion.feedback.evaluation === "incorrect" && (
                <div className="space-y-2">
                  <p className="text-gray-800 text-lg bg-gray-50 p-2 border rounded-md">
                    <strong>Correct Answer:</strong> {currentQuestion.feedback.correct_answer}
                  </p>
                  <p className="text-gray-800 text-lg bg-gray-50 p-2 border rounded-md">
                    <strong>Missing Keywords:</strong>{" "}
                    {currentQuestion.feedback.missing_keywords.join(", ")}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-md">Submit your answer to see feedback.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPanel;
