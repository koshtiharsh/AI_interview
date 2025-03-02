import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function QuestionPanel({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  onSubmitAnswer,
  detectedEmotion,
  videoRef,
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [userAnswers, setUserAnswers] = useState(
    new Array(questions.length).fill("")
  );
  const [submittedAnswers, setSubmittedAnswers] = useState(
    new Array(questions.length).fill(false)
  );

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

  useEffect(() => {
    if (!submittedAnswers[currentQuestionIndex]) {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = transcript;
      setUserAnswers(newAnswers);
    }
  }, [transcript, currentQuestionIndex, submittedAnswers, userAnswers]);

  const handleSubmitAnswer = () => {
    const currentAnswer = userAnswers[currentQuestionIndex] || transcript;

    if (currentAnswer.trim() === "") {
      alert("Please provide an answer before submitting.");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    onSubmitAnswer(currentQuestion, currentAnswer);
    const newSubmittedAnswers = [...submittedAnswers];
    newSubmittedAnswers[currentQuestionIndex] = true;
    setSubmittedAnswers(newSubmittedAnswers);
  };

  const handleNextQuestion = () => {
    resetTranscript();
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handleFinishTest = () => {
    alert("Test Finished!"); // Replace this with your final test logic
  };

  const currentQuestion = questions[currentQuestionIndex];
  const hasSubmitted = submittedAnswers[currentQuestionIndex];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-md">
      {/* Left Section */}
      <div className="w-full md:w-3/4 p-2">
        {/* Camera Box */}
        <div className="h-[370px] bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center border-l-[6px] border-blue-500 mt-0">
          <video ref={videoRef} className="h-auto rounded-md p-2 overflow-hidden" autoPlay muted />
        </div>

        {/* Question Box */}
        <div className="rounded-lg mt-6 bg-gray-100 border-l-[6px] border-blue-500 p-4">
          <h2 className="text-xl font-semibold text-gray-800">Question:</h2>
          {currentQuestion && (
            <div className="bg-gray-300 text-center text-white p-2 rounded-lg mt-4 text-xl">
              <p className="text-slate-800 font-bold text-lg">{currentQuestion["Question text"]}</p>
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-600 mt-3">Your Answer:</h2>
          <div className="p-3 bg-gray-300 border rounded-lg">
            {transcript}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 p-6 shadow-none rounded-md border-none bg-transparent">
        {/* Detected Emotion Box */}
        <div className="bg-blue-500 text-white text-lg font-bold rounded-md px-4 py-3 flex items-center" style={{ marginTop: '5px', height: '80px' }}>
          <span>Detected Emotion :</span>
          <span className="bg-yellow-300 text-gray-800 font-semibold px-4 py-2 rounded-md ml-2">
            {detectedEmotion}
          </span>
        </div>

        {/* Answer Submission and Feedback Box (Silver Box - NO Left Border) */}
        <div className="bg-gray-100 p-4 rounded-lg mt-6 shadow-md">
          {/* Next Question / Finish Test Button */}
          <div className="flex justify-center">
            {hasSubmitted ? (
              currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleFinishTest}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md shadow text-lg"
                >
                  Finish Test
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow text-lg"
                >
                  Next Question
                </button>
              )
            ) : (
              <button
                onClick={handleSubmitAnswer}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow text-lg"
              >
                Submit Answer
              </button>
            )}
          </div>

          {/* Feedback Section (Inside the Silver Box) */}
          {hasSubmitted && currentQuestion.feedback && (
            <div className="bg-yellow-100 border border-yellow-500 p-4 mt-4 rounded-md shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Feedback:</h3>

              {/* Evaluation */}
              <p className="text-gray-800 font-semibold">
                <strong>Evaluation:</strong> {currentQuestion.feedback.evaluation}
              </p>

              {/* Correct Answer */}
              <p className="text-gray-800 mt-2">
                <strong>Correct Answer:</strong> {currentQuestion.feedback.correct_answer}
              </p>

              {/* Missing Keywords */}
              {/* <p className="text-gray-800 mt-2">
                <strong>Missing Keywords:</strong> {Array.isArray(currentQuestion.feedback?.missing_keywords) ? currentQuestion.feedback.missing_keywords.join(", ") : "N/A"}
              </p> */}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPanel;
