import React from 'react'
import Navbar from './Navbar'
import backgroundImage from '../assets/back1.jpeg' 
import Sider from './Sider'
import Footer from './Footer'
import Features from './Features'

const Home = () => {
  return (
    <>
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
    
      <img 
        src={backgroundImage} 
        alt="Background" 
        style={{ 
          width: '100%', 
          height: '700px', 
          objectFit: 'fill', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          zIndex: -1 
        
        }} 
      />
      
     
      <Navbar />
      <Sider />
     
     
    </div>
    <Features/>
    <Footer/>
    </>
  )
}

export default Home
