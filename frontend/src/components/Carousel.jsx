import React from 'react'
import image1 from '../assets/img1.jpg';
import image2 from '../assets/img2.jpg';
import image3 from '../assets/img3.jpg';
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
            <h3 className="text-xl font-semibold">First slide label</h3>
            <p className="text-sm">Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="w-full h-[90vh] object-cover"
            src={image2}
            alt="Second slide"
          />
          <Carousel.Caption>
            <h3 className="text-xl font-semibold">Second slide label</h3>
            <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="w-full h-[90vh] object-cover"
            src={image3}
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3 className="text-xl font-semibold">Third slide label</h3>
            <p className="text-sm">Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default CarouselPage
