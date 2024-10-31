import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import CarouselPage from './Carousel'
import Cards from './Cards'
const Home = () => {
  return (
    <div>
      <Navbar/>
        <CarouselPage/>
        <Cards/>
      <Footer/>
    </div>
  )
}

export default Home
