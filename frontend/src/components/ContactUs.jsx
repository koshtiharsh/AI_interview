import React from "react";

const ContactUs = () => {
  return (
    <div className="flex justify-center items-center min-h-screen relative overflow-hidden">
    <div className="absolute inset-0 bg-white" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 50%)" }}></div>
    <div className="absolute inset-0 bg-gradient-to-br from-[#647CFB] to-[#8A63F9]" style={{ clipPath: "polygon(0 100%, 50% 50%, 100% 0, 100% 100%)" }}></div>
    
      <form className="relative z-10 max-w-lg w-full bg-white p-6 rounded-[30px] shadow-lg text-gray-900 my-6">
        <h2 className="text-[30px] font-semibold text-center mb-3">Contact Us</h2>

        <div className="mt-3">
          <label className="ml-5 block font-medium">Full Name</label>
          <input
            type="text"
            className="w-full h-[50px] bg-gray-100 border border-gray-300 rounded-[30px] px-5 mt-1 outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="mt-3">
          <label className="ml-5 block font-medium">Email Address</label>
          <input
            type="email"
            className="w-full h-[50px] bg-gray-100 border border-gray-300 rounded-[30px] px-5 mt-1 outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mt-3">
          <label className="ml-5 block font-medium">Enter Message</label>
          <textarea
            className="w-full h-[200px] bg-gray-100 border border-gray-300 rounded-[30px] p-5 mt-1 resize-none outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter your message"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full h-[55px] bg-gradient-to-r from-purple-400 to-purple-600 text-white font-medium rounded-[30px] shadow-lg hover:opacity-90 transition mt-4"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
  