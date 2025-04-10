
import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { context } from "../context/Context";
import InterviewFeedbackDashboard from "./HrfeedbackComponent";
import EmotionInsightsFeedback from "./EmotionFeedback";

const Hrfeedback = () => {
    const [feedbackData, setFeedbackData] = useState([]);
    const userID = "1"; // Replace with actual userID

    const { email } = useContext(context)

    const [allEmotion, setAllEmotion] = useState({
        "Neutral": 16,
        "Angry": 0,
        "Happy": 13,
        "Surprised": 5,
        "Fearful": 1,
        "Sad": 0,
        "Disgusted": 0
    })

   

    return (
        <>

            <Navbar />
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
                        className="px-4 py-2  text-blue-600 border-b-2 border-blue-600 "
                    >
                        HR Interview Feedback
                    </a>
                    <a
                        href="/techfeedback"
                        className="px-4 py-2  hover:text-blue-600 font-medium"
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
                <EmotionInsightsFeedback
                    emotions={allEmotion}
                />

                <InterviewFeedbackDashboard allEmotion={allEmotion} setAllEmotion={setAllEmotion} />

            </div>
        </>
    );
};

export default Hrfeedback;
