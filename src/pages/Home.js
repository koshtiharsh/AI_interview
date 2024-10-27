import React from 'react'
import Navbar from '../shared/components/UIElements/Navbar'
import './Home.css'
import Footer from '../shared/components/UIElements/Footer'
import CarouselPage from '../shared/components/UIElements/CarouselPage'
import Card from '../shared/components/UIElements/Card'
const Home = () => {
  return (
    <div>
      <Navbar/>
      <CarouselPage/>
      <Card/>
      <Footer/>
    </div>
  )
}

export default Home
