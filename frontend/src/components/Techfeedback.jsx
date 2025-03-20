// import React from "react";

// const TechFeedback = ({ answeredQuestions }) => {
//   return (
//     <div className="feedback-container" style={{ padding: "20px" }}>
//       <h2>Technical Interview Feedback</h2>
//       {answeredQuestions.length > 0 ? (
//         <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr>
//               <th>Question</th>
//               <th>Your Answer</th>
//               <th>Ideal Answer</th>
//               <th>Feedback</th>
//             </tr>
//           </thead>
//           <tbody>
//             {answeredQuestions.map((q, index) => (
//               <tr key={index}>
//                 <td style={{ padding: "10px" }}>{q.question}</td>
//                 <td style={{ padding: "10px", color: "blue" }}>
//                   {q.userAnswer}
//                 </td>
//                 {/*<td style={{ padding: "10px", color: "green" }}>
//                   {q.idealAnswer}
//                  </td> */}
//                 <td style={{ padding: "10px", color: "red" }}>{q.feedback}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No feedback available yet.</p>
//       )}
//     </div>
//   );
// };

// export default TechFeedback;

// ***************************************************************************************************************************************************************************************
// import React from "react";

// const TechFeedback = ({ answeredQuestions = [] }) => {
//   if (!answeredQuestions) {
//     return <p>Loading feedback...</p>;
//   }

//   return (
//     <div className="feedback-container" style={{ padding: "20px" }}>
//       <h2>Technical Interview Feedback</h2>
//       {answeredQuestions.length > 0 ? (
//         <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr>
//               <th>Question</th>
//               <th>Your Answer</th>
//               {/* <th>Ideal Answer</th> */}
//               <th>Feedback</th>
//             </tr>
//           </thead>
//           <tbody>
//             {answeredQuestions.map((q, index) => (
//               <tr key={index}>
//                 <td style={{ padding: "10px" }}>{q.question}</td>
//                 <td style={{ padding: "10px", color: "blue" }}>
//                   {q.userAnswer}
//                 </td>
//                 <td style={{ padding: "10px", color: "red" }}>{q.feedback}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No feedback available yet.</p>
//       )}
//     </div>
//   );
// };

// export default TechFeedback;

import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { context } from "../context/Context";

const Techfeedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const userID = "1"; // Replace with actual userID

  const {email} = useContext(context)

  useEffect(() => {
    if(email){
      fetch(`http://localhost:5001/get_feedback?email=${email}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.feedback && Array.isArray(data.feedback)) {
          setFeedbackData(data.feedback);
        } else {
          setFeedbackData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching feedback:", error);
        setFeedbackData([]); // Ensure fallback data
      });
    }
  }, [email]);

  return (
    <>

    <Navbar/>
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">Interview Feedback Report</h2>
        {/* <span className="bg-white text-blue-600 px-3 py-1 rounded-lg text-sm font-bold"> 
          Overall Score: 78%
        </span>*/}
      </div>

      {/* Navigation Tabs */}
      <nav className="flex border-b mt-4">
        <a
          href="/hrfeedback"
          className="px-4 py-2 text-gray-500 hover:text-blue-600"
        >
          HR Interview Feedback
        </a>
        <a
          href="/techfeedback"
          className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium"
        >
          Technical Interview Feedback
        </a>
        <a
          href="/resume/result"
          className="px-4 py-2 text-gray-500 hover:text-blue-600"
        >
          Resume Report
        </a>
      </nav>

      {/* Section Title */}
      <h3 className="mt-6 text-xl font-semibold">
        Technical Interview Feedback
      </h3>
      <p className="text-gray-600">
        Assessment of your technical knowledge, problem-solving skills, and
        coding abilities.
      </p>

      {/* Feedback Cards */}
      <div className="mt-4 space-y-6">
        {feedbackData.length > 0 ? (
          feedbackData.map((item, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg shadow">
              {/* Question Title */}
              <h4 className="text-lg font-semibold">{item.question}</h4>

              {/* User Answer */}
              <div className="bg-white p-3 rounded mt-2 shadow-inner">
                <p className="text-gray-700 font-semibold">Your answer:</p>
                <pre className="text-sm text-gray-900">{item.user_answer}</pre>
              </div>

              {/* Feedback Section */}
              {typeof item.feedback === "object" && item.feedback !== null ? (
                <>
                  {/* Correct Answer */}
                  <p className="mt-2 text-gray-700">
                    <span className="font-semibold">Correct Answer: </span>
                    <span className="text-green-600">
                      {item.feedback.correct_answer}
                    </span>
                  </p>

                  {/* Missing Keywords */}
                  {item.feedback.missing_keywords?.length > 0 && (
                    <p className="mt-2 text-gray-700">
                      <span className="font-semibold">Missing Keywords: </span>
                      <span className="text-red-600">
                        {item.feedback.missing_keywords.join(", ")}
                      </span>
                    </p>
                  )}

                  {/* Evaluation */}
                  <p className="mt-2 text-gray-700">
                    <span className="font-semibold">Evaluation: </span>
                    <span className="text-blue-600">
                      {item.feedback.evaluation}
                    </span>
                  </p>
                </>
              ) : (
                <p className="mt-2 text-gray-700">
                  <span className="font-semibold">Feedback: </span>{" "}
                  {item.feedback}
                </p>
              )}

              {/* How to Improve Section 
              {typeof item.improvement === "object" &&
              item.improvement !== null ? (
                <div className="bg-blue-50 p-3 rounded mt-3 border-l-4 border-blue-500">
                  <p className="text-blue-600 font-semibold">How to improve:</p>
                  <p className="text-gray-700">
                    {item.improvement.suggestions}
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 p-3 rounded mt-3 border-l-4 border-blue-500">
                  <p className="text-blue-600 font-semibold">How to improve:</p>
                  <p className="text-gray-700">{item.improvement}</p>
                </div>
              )}*/}
            </div>
          ))
        ) : (
          <p className="text-gray-600 mt-4">No feedback available.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <button className="bg-gray-200 px-4 py-2 rounded-lg">
          Download PDF
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Send to Candidate
        </button>
      </div>
    </div>
    </>
  );
};

export default Techfeedback;
