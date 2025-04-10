import React, { useState } from 'react';

const ProgressionPathsDisplay = ({ progressionPaths }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Career Progression</h2>
      <div className="space-y-4">
        {progressionPaths.map((path, index) => (
          <PathCard key={index} path={path} />
        ))}
      </div>
    </div>
  );
};

const PathCard = ({ path }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      <div className="bg-indigo-600 text-white py-3 px-4">
        <h3 className="text-lg font-medium">{path.pathName}</h3>
      </div>
      <div className="p-2">
        {path.stages.map((stage, index) => (
          <StageItem key={index} stage={stage} />
        ))}
      </div>
    </div>
  );
};

const StageItem = ({ stage }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors ${
          isOpen ? 'bg-indigo-50' : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center mr-3">
            <span className="text-white font-medium">{stage.level.charAt(0)}</span>
          </div>
          <span className="font-medium text-gray-800">{stage.level}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs font-medium text-indigo-600 mr-3">{stage.timeframe}</span>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="mt-2 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
          {/* Skills Section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {stage.requiredSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {/* Responsibilities Section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Responsibilities</h4>
            <div className="space-y-1">
              {stage.responsibilities.map((resp, i) => (
                <div key={i} className="flex items-start">
                  <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 mr-2"></div>
                  <p className="text-sm text-gray-600">{resp}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Salary Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Salary</h4>
            <div className="px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-green-700 font-medium">{stage.salary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressionPathsDisplay;