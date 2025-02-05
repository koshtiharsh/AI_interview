import React from 'react'
import image1 from '../assets/Ml6.jpg'
import image2 from '../assets/Interview2.jpg'
import image3 from '../assets/home.jpg'
import Carousel from 'react-bootstrap/Carousel';

const CarouselPage = () => {
  return (
    <div className="w-full relative z-0" >

      <div className='absolute w-full h-full z-10  '>
        {/* <div className='z-100'>
          <h1 className='text-slate-900 font-bold text-2xl z-100'>AI Interview By InterviewXpert</h1>
        </div> */}
      </div>
      <Carousel>
        {/* <Carousel.Item>
          <img
            className="w-full h-[90vh] object-cover"
            src={image1}
            alt="First slide"
          />
          <Carousel.Caption>
            <h3 className="text-xl font-semibold"></h3>
            <p className="text-sm"></p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="w-full h-[90vh] object-cover"
            src={image2}
            alt="Second slide"
          />
          <Carousel.Caption>
            <h3 className="text-xl font-semibold"></h3>
            <p className="text-sm"></p>
          </Carousel.Caption>
        </Carousel.Item> */}
        <Carousel.Item>
          <img
            className="w-full h-[90vh] object-cover"
            src={image3}
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3 className="text-xl font-semibold">InterviewXpert</h3>
            <p className="text-sm"></p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default CarouselPage
