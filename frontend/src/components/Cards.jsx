import React from 'react';
import img1 from '../assets/Resume2.jpg'
import img2 from '../assets/Tech1.jpg'
import img3 from '../assets/Interview3.jpg'
const Cards = () => {
  return (
    <div className="flex justify-center flex-wrap gap-6 mt-24">
      
      {/* Card 1 */}
      <div className="w-[350px] bg-gray-200 rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-5">
        <img
          src={img1}
          alt="Card Image"
          className="w-full h-auto object-cover"
        />
        <div className="p-5">
          <h1 className="text-xl mb-2 text-center">Resume Optimization</h1>
          <p className="text-sm text-gray-600 mb-5">Description for the first card goes here.</p>
          <a href="#" className="inline-block bg-blue-600 text-white rounded px-4 py-2">
            Learn More
          </a>
        </div>
      </div>

      {/* Card 2 */}
      <div className="w-[350px] bg-gray-200 rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-5">
        <img
          src={img2}
          alt="Card Image"
          className="w-full h-auto object-cover"
        />
        <div className="p-5">
          <h1 className="text-xl mb-2 text-center">Technical Interview</h1>
          <p className="text-sm text-gray-600 mb-5">Description for the second card goes here.</p>
          <a href="#" className="inline-block bg-blue-600 text-white rounded px-4 py-2">
            Learn More
          </a>
        </div>
      </div>

      {/* Card 3 */}
      <div className="w-[350px] bg-gray-200 rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-5">
        <img
          src={img3}
          alt="Card Image"
          className="w-full h-auto object-cover"
        />
        <div className="p-5">
          <h1 className="text-xl mb-2 text-center">Hr Interview</h1>
          <p className="text-sm text-gray-600 mb-5">Description for the third card goes here.</p>
          <a href="#" className="inline-block bg-blue-600 text-white rounded px-4 py-2">
            Learn More
          </a>
        </div>
      </div>
      
    </div>
  );
};

export default Cards;
