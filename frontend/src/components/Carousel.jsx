import React from 'react'
import image1 from '../assets/Ml6.jpg'
import image2 from '../assets/Interview2.jpg'
import image3 from '../assets/Ml7.jpg'
import Carousel from 'react-bootstrap/Carousel';

const CarouselPage = () => {
  return (
    <div className="w-full">
      <Carousel>
        <Carousel.Item>
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
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="w-full h-[90vh] object-cover"
            src={image3}
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3 className="text-xl font-semibold"></h3>
            <p className="text-sm"></p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default CarouselPage
