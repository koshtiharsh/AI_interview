// import React, { useState } from 'react';

// const QuestionDisplay = ({ questions }) => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

//   const nextQuestion = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const prevQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   return (
//     <div className="p-4 border rounded shadow-md">
//       <h2 className="text-lg font-bold">Question:</h2>
//       <p className="mt-2 text-gray-700">{questions[currentQuestionIndex]}</p>
//       <div className="mt-4">
//         <button
//           onClick={prevQuestion}
//           disabled={currentQuestionIndex === 0}
//           className="px-4 py-2 mr-2 text-white bg-blue-500 rounded disabled:bg-gray-400"
//         >
//           Previous
//         </button>
//         <button
//           onClick={nextQuestion}
//           disabled={currentQuestionIndex === questions.length - 1}
//           className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-400"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionDisplay;
/*
import React from "react";

const QuestionDisplay = ({ questions, onBack }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Generated Questions</h2>
      {questions.length > 0 ? (
        <ul className="list-disc pl-6">
          {questions.map((question, index) => (
            <li key={index} className="mb-2">
              {question}
            </li>
          ))}
        </ul>
      ) : (
        <p>No questions generated. Please try again.</p>
      )}
      <button
        onClick={onBack}
        className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
      >
        Back to Resume Upload
      </button>
    </div>
  );
};

export default QuestionDisplay;
*/


import React from "react";


const QuestionDisplay = ({ questions, onBack }) => {
  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Generated Questions</h2>
      {questions.length > 0 ? (
        <ul className="list-disc pl-8 space-y-3">
          {questions.map((question, index) => (
            <li key={index} className="text-gray-700">
              {question}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No questions generated. Please try again.</p>
      )}
      <button
        onClick={onBack}
        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md mt-6"
      >
        Back to Resume Upload
      </button>
    </div>
  );
};

export default QuestionDisplay;

