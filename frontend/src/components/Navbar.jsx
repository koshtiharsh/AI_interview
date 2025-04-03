import React from 'react'
import { useResolvedPath } from 'react-router-dom'
import logo from '../assets/logo-final.png'

const Navbar = () => {
  const Url = useResolvedPath()

  return (
    <header className="top-0 left-0 w-full p-1 shadow-md flex justify-between items-center z-50 bg-transparent">
      {/* Logo */}
      <a href="/" className="text-2xl font-bold ">
        <img src={logo} alt="Logo" className="w-[250px]" />
      </a>

      {/* Navigation Links */}
      <nav className="hidden md:flex space-x-10">
        <a href="/home" className="relative font-medium text-lg  hover:text-gray-300 transition duration-300">
          Home
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 hover:w-full"></span>
        </a>
        <a href="/contactus" className="relative font-medium text-lg  hover:text-gray-300 transition duration-300">
          Contact us
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 hover:w-full"></span>
        </a>
       
        <a href="/technical" className="relative font-medium text-lg  hover:text-gray-300 transition duration-300">
          Technical
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 hover:w-full"></span>
        </a>
        <a href="/login" className="relative font-medium text-lg  hover:text-gray-300 transition duration-300">
          Login
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 hover:w-full"></span>
        </a>
        <a href="/hr" className="relative font-medium text-lg  hover:text-gray-300 transition duration-300">
          Hr Interview
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 hover:w-full"></span>
        </a>
        <a href="/resume" className="relative font-medium text-lg  hover:text-gray-300 transition duration-300">
          Upload Resume
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 hover:w-full"></span>
        </a>
        {localStorage.getItem('resumeresult') && (
          <a href="/resume/result" target="_blank" className="relative font-medium text-lg  hover:text-gray-300 transition duration-300">
            Resume Report
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 hover:w-full"></span>
          </a>
        )}
      </nav>

      {/* Responsive Hamburger Menu */}
      <button className="md:hidden p-2 focus:outline-none ">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>
    </header>
  )
}

export default Navbar;
