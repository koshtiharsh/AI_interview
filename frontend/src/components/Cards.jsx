import React from "react";
import { useNavigate } from "react-router-dom";

const Cards = () => {
  const navigate = useNavigate();

  const cardItems = [
    { name: "HR Interview", path: "/hr" },
    { name: "Technical Interview", path: "/technical" },
    { name: "Resume Optimization", path: "/resume" }
  ];

  return (
    <div className="flex flex-col space-y-3 items-center mt-2">
      {cardItems.map((card, index) => (
        <div
          key={index}
          className="w-40 h-32 rounded-full border border-gray-500 shadow-lg bg-opacity-10 backdrop-blur-lg 
          text-white flex flex-col items-center justify-center text-center p-3"
        >
          <h3 className="text-lg font-bold">{card.name}</h3>
          <button
            onClick={() => navigate(card.path)}
            className="mt-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition"
          >
            Take Test
          </button>
        </div>
      ))}
    </div>
  );
};

export default Cards;
