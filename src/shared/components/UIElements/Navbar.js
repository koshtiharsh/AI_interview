import React from 'react'
import './Navbar.css'
const Navbar = () => {
  return (
    <div>
    <header className='header'>
         <a href='/' className='logo'>logo</a>

         <nav className='navbar'>
             <a href='/home'>Home</a>
             <a href='/contactus'>Contact us</a>
             <a href='/aboutus'>About us</a>
             <a href='/login'>Login</a>
             <a href='/hr'>Hr Interview</a> 
             <a href='/resume'>Upload Resume</a> 
         </nav>
    </header>
 </div>

  )
}

export default Navbar
