import React from 'react'
import { useResolvedPath } from 'react-router-dom'

import logo from '../assets/logo-final.png'

const Navbar = () => {

  const Url = useResolvedPath()

  if (Url.pathname === 'resume') {

  }
  return (
    <>



      <header className="top-0 left-0 w-full p-4 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] flex justify-between items-center z-50 ">
        <a href="/" className="text-2xl font-bold text-black"><img src={logo} alt=""className='w-[250px]'/></a>

        <nav className="hidden md:flex space-x-10">
          <a href="/home" className="relative font-medium text-lg text-black hover:text-white transition duration-300">
            Home
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-all duration-300 hover:w-full"></span>
          </a>
          <a href="/contactus" className="relative font-medium text-lg text-black hover:text-white transition duration-300">
            Contact us
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-all duration-300 hover:w-full"></span>
          </a>
          <a href="/aboutus" className="relative font-medium text-lg text-black hover:text-white transition duration-300">
            About us
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-all duration-300 hover:w-full"></span>
          </a>
          <a href="/technical" className="relative font-medium text-lg text-black hover:text-white transition duration-300">
            technical
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-all duration-300 hover:w-full"></span>
          </a>
          <a href="/login" className="relative font-medium text-lg text-black hover:text-white transition duration-300">
            Login
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-all duration-300 hover:w-full"></span>
          </a>
          <a href="/hr" className="relative font-medium text-lg text-black hover:text-white transition duration-300">
            Hr Interview
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-all duration-300 hover:w-full"></span>
          </a>
          <a href="/resume" className="relative font-medium text-lg text-black hover:text-white transition duration-300">
            Upload Resume
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-all duration-300 hover:w-full"></span>
          </a>
          {
            localStorage.getItem('resumeresult') ? <a href="/resume/result" target='_blank' className="relative font-medium text-lg text-black hover:text-white transition duration-300">
              Resume Report
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black transition-all duration-300 hover:w-full"></span>
            </a> : ''
          }
        </nav>

        {/* Responsive Hamburger Menu */}
        <button className="md:hidden p-2 focus:outline-none">
          {/* Icon for a hamburger menu */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </header>

    </>
  )
}

export default Navbar;