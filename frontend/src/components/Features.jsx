import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTrophy } from "react-icons/fa";

const Features = () => {
  const sections = [
    {
      title: "Features",
      icon: <FaCheckCircle className="text-blue-400 text-3xl mb-3" />,
      items: [
        "AI-driven HR & Technical Interviews",
        "Real-time AI Feedback on Answers",
        "Resume Optimization with AI Suggestions",
        "Mock Coding Challenges & Solutions",
      ],
      bgColor: "bg-blue-900/40",
    },
    {
      title: "Challenges",
      icon: <FaExclamationTriangle className="text-yellow-400 text-3xl mb-3" />,
      items: [
        "Handling Multiple Question Formats",
        "Ensuring AI Provides Accurate Feedback",
        "Creating Realistic Interview Simulations",
        "Improving Resume Scoring Algorithms",
      ],
      bgColor: "bg-yellow-900/40",
    },
    {
      title: "Benefits",
      icon: <FaTrophy className="text-green-400 text-3xl mb-3" />,
      items: [
        "Increased Hiring Chances",
        "Personalized Interview Preparation",
        "Instant Resume Improvements",
        "Confidence Boost for Real Interviews",
      ],
      bgColor: "bg-green-900/40",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pt-0 pb-12 text-white text-center">  
      <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-0">
        Why Choose Our Platform?
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl shadow-lg backdrop-blur-lg ${section.bgColor} transform transition duration-300 hover:scale-105`}
          >
            {section.icon}
            <h3 className="text-2xl font-semibold mb-4">{section.title}</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              {section.items.map((item, idx) => (
                <li key={idx} className="flex items-center justify-center gap-2">
                  🔹 {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
