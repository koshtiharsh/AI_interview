import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'; 
import teamImage from '../assets/gd.jpg';
import Navbar from './Navbar'; 
import Footer from './Footer';

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-100 py-5 mt-20">
        <div className="container mx-auto space-y-10">

          {/* About Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-10 rounded-lg shadow-lg">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl font-bold mb-3 text-black">ABOUT US</h1>
              <h3 className="text-lg font-normal text-gray-600 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing
              </h3>
              <p className="text-base text-gray-800 leading-relaxed mb-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <button className="bg-black text-white px-5 py-2 rounded-md mb-4 hover:bg-gray-700 transition">Read More</button>
              <div className="flex justify-center lg:justify-start mt-4">
                <a href="#" className="text-2xl text-gray-800 hover:text-blue-500 transition ml-4"><FaFacebook /></a>
                <a href="#" className="text-2xl text-gray-800 hover:text-blue-400 transition ml-4"><FaTwitter /></a>
                <a href="#" className="text-2xl text-gray-800 hover:text-pink-500 transition ml-4"><FaInstagram /></a>
              </div>
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <img src={teamImage} alt="Team Member" className="rounded-md h-64 w-full object-cover" />
            </div>
          </div>

          {/* Mission Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-10 rounded-lg shadow-lg">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl font-bold mb-3 text-black">OUR MISSION</h1>
              <h3 className="text-lg font-normal text-gray-600 mb-4">
                Making a Difference, One Solution at a Time
              </h3>
              <p className="text-base text-gray-800 leading-relaxed mb-5">
                Our mission is to provide innovative solutions that improve the lives of our customers. We aim to make a positive impact by focusing on customer satisfaction and product excellence.
              </p>
              <button className="bg-black text-white px-5 py-2 rounded-md mb-4 hover:bg-gray-700 transition">Discover More</button>
              <div className="flex justify-center lg:justify-start mt-4">
                <a href="#" className="text-2xl text-gray-800 hover:text-blue-500 transition ml-4"><FaFacebook /></a>
                <a href="#" className="text-2xl text-gray-800 hover:text-blue-400 transition ml-4"><FaTwitter /></a>
                <a href="#" className="text-2xl text-gray-800 hover:text-pink-500 transition ml-4"><FaInstagram /></a>
              </div>
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <img src={teamImage} alt="Mission" className="rounded-md h-64 w-full object-cover" />
            </div>
          </div>

          {/* Team Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-10 rounded-lg shadow-lg">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl font-bold mb-3 text-black">OUR TEAM</h1>
              <h3 className="text-lg font-normal text-gray-600 mb-4">
                A Passionate Team of Professionals
              </h3>
              <p className="text-base text-gray-800 leading-relaxed mb-5">
                We are a group of dedicated individuals who work hard to meet the needs of our customers. Our team is committed to innovation, creativity, and excellence in everything we do.
              </p>
              <button className="bg-black text-white px-5 py-2 rounded-md mb-4 hover:bg-gray-700 transition">Meet the Team</button>
              <div className="flex justify-center lg:justify-start mt-4">
                <a href="#" className="text-2xl text-gray-800 hover:text-blue-500 transition ml-4"><FaFacebook /></a>
                <a href="#" className="text-2xl text-gray-800 hover:text-blue-400 transition ml-4"><FaTwitter /></a>
                <a href="#" className="text-2xl text-gray-800 hover:text-pink-500 transition ml-4"><FaInstagram /></a>
              </div>
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <img src={teamImage} alt="Our Team" className="rounded-md h-64 w-full object-cover" />
            </div>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-10 rounded-lg shadow-lg">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl font-bold mb-3 text-black">CONTACT US</h1>
              <h3 className="text-lg font-normal text-gray-600 mb-4">
                We’re Here to Help
              </h3>
              <p className="text-base text-gray-800 leading-relaxed mb-5">
                Have any questions? Get in touch with us! Our support team is available around the clock to assist you with any queries.
              </p>
              <button className="bg-black text-white px-5 py-2 rounded-md mb-4 hover:bg-gray-700 transition">Contact Now</button>
              <div className="flex justify-center lg:justify-start mt-4">
                <a href="#" className="text-2xl text-gray-800 hover:text-blue-500 transition ml-4"><FaFacebook /></a>
                <a href="#" className="text-2xl text-gray-800 hover:text-blue-400 transition ml-4"><FaTwitter /></a>
                <a href="#" className="text-2xl text-gray-800 hover:text-pink-500 transition ml-4"><FaInstagram /></a>
              </div>
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <img src={teamImage} alt="Contact Us" className="rounded-md h-64 w-full object-cover" />
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
