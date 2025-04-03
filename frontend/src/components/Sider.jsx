import React, { useState } from "react";
import Cards from "./Cards";

const Sider = () => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { name: "HR Interview", info: "Practice HR interview questions with AI feedback.", details: "Get real-time AI-based feedback on common HR questions." },
    { name: "Technical Interview", info: "Prepare for technical rounds with coding challenges.", details: "Solve real-world coding problems with AI evaluation." },
 
    { name: "Resume Optimization", info: "Enhance your resume with AI-powered suggestions.", details: "Get resume formatting tips and keyword optimization." },
    
  ];

  return (
    <div className="flex min-h-screen">
      <div className="w-1/4 text-white p-6">
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="p-3 hover:bg-gray-700 cursor-pointer"
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-1/2 flex items-center justify-center text-white p-6 relative">
        <div
          className={`absolute transition-transform duration-500 ease-in-out transform ${hoveredItem ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-full translate-y-full opacity-0'}`}
        >
          {hoveredItem && (
            <div className="text-center p-6 border border-gray-500 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-10">
              <h3 className="text-2xl font-bold">{hoveredItem.name}</h3>
              <p className="mt-2">{hoveredItem.info}</p>
              <p className="mt-2 text-gray-300">{hoveredItem.details}</p>
            </div>
          )}
        </div>
      </div>
     
      <div className="w-1/4 p-6">
        <Cards />
      </div>
    </div>
  );
};

export default Sider;
