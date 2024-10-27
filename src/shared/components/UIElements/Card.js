import React from 'react'
import img1 from './assets/img1.jpg'
import img2 from './assets/img2.jpg'
import img3 from './assets/img3.jpg'
import './Card.css'
const Card = () => {
  return (
    <div className='card-container'>
        <div className='card'>
            <img src={img1}/>
            <div className='card-content'>
            <h1 >Title one</h1>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Atque dolorum distinctio tempore aut pariatur minima illum voluptates saepe fugiat provident? Quas dolorem dolores rerum nostrum deserunt consequuntur. Iste, beatae! Recusandae.</p>
            <a href="" className='card-button'>Read more</a>
            </div>
        </div>  

          <div className='card'>
            <img src={img2}/>
            <div className='card-content'>
            <h1 >Title one</h1>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Atque dolorum distinctio tempore aut pariatur minima illum voluptates saepe fugiat provident? Quas dolorem dolores rerum nostrum deserunt consequuntur. Iste, beatae! Recusandae.</p>
            <a href="" className='card-button'>Read more</a>
            </div>
        </div> 

          <div className='card'>
            <img src={img3}/>
            <div className='card-content'>
            <h1>Title one</h1>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Atque dolorum distinctio tempore aut pariatur minima illum voluptates saepe fugiat provident? Quas dolorem dolores rerum nostrum deserunt consequuntur. Iste, beatae! Recusandae.</p>
            <a href="" className='card-button'>Read more</a>
            </div>
        </div>    
    </div>
  )
}

export default Card
