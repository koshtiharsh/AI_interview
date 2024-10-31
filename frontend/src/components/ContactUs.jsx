import React from 'react'

const ContactUs = () => {
  return (
    <section className="flex justify-center min-h-screen">
      <form className="max-w-lg w-full bg-transparent p-6 rounded-[30px] border-2 border-white border-opacity-10 backdrop-blur-[30px] shadow-[0_0_10px_rgba(0,0,0,0.5)] text-gray-800 my-6">
        <h2 className="text-[30px] font-semibold text-center mb-4">Contact Us</h2>

        <div className="mt-5">
          <label className="ml-5 block font-medium">Full name</label>
          <input
            type="text"
            className="w-full h-[50px] bg-transparent border-2 border-black rounded-[30px] px-5 mt-2 text-gray-800 outline-none focus:ring-0"
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="mt-5">
          <label className="ml-5 block font-medium">Email Address</label>
          <input
            type="email"
            className="w-full h-[50px] bg-transparent border-2 border-black rounded-[30px] px-5 mt-2 text-gray-800 outline-none focus:ring-0"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mt-5">
          <label className="ml-5 block font-medium">Phone number</label>
          <input
            type="tel"
            className="w-full h-[50px] bg-transparent border-2 border-black rounded-[30px] px-5 mt-2 text-gray-800 outline-none focus:ring-0"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="mt-5">
          <label className="ml-5 block font-medium">Enter message</label>
          <textarea
            className="w-full h-[200px] bg-transparent border-2 border-black rounded-[30px] p-5 mt-2 text-gray-800 resize-none outline-none focus:ring-0"
            placeholder="Enter your message"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full h-[55px] bg-white border-2 border-black rounded-[30px] shadow-[0_0_10px_rgba(0,0,0,0.1)] cursor-pointer font-medium text-black hover:bg-black hover:text-white transition-colors duration-300 mt-6"
        >
          Send message
        </button>
      </form>
    </section>
  )
}

export default ContactUs
