import React, { useContext, useState } from 'react'
import { context } from '../context/Context'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import loader from '../assets/loader-1.gif'
import photo from '../assets/rmphoto.png'
const Resume = () => {



  const [file, setFile] = useState(null)

  const navigate = useNavigate();

  const { htmlContent, setHtmlContent } = useContext(context)
  const [jobRole, setJobRole] = useState('')
  const [subRole, setSubRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)



  const handleSubmit = async (e) => {

    if (subRole.length == 0 && file == null) return;
    setIsLoading(true)
    e.preventDefault();

    const formData = new FormData()
    formData.append('role', subRole)
    formData.append('file', file)

    fetch('http://localhost:5000/upload', {
      method: 'post',
      body: formData
    }).then((res) => {
      if (res.ok) {
        return res.text()
      } else {
        throw new Error('server error')
      }
    }).then((res) => {
      setHtmlContent(res)
      navigate('/resume/result')
    })

  }

  // console.log(file)
  return (
    <div className=''>
      <div className="" >
        <Navbar />
      </div>

      <div className="flex justify-around items-center flex-row-reverse md:w-[700px]  h-[50vh]  m-auto border rounded-md mt-5 w-[80%]">

        <img src={photo} className='w-[50%] h-full flex-1 hidden md:block' alt="" />
        <div className="h-[300px] flex flex-col items-center justify-center flex-1 relative">

          <h1 className='font-bold text-xl absolute top-0' >Resume Analysis</h1>
          <input id='fileselect' type="file" onChange={(e) => setFile(e.target.files[0])} hidden />
          <label htmlFor='fileselect' className='rounded-md w-36 h-10 p-2 m-2 cursor-pointer shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]'>Select Pdf or Doc</label>
          {file && <p>{file.name}</p>}
          <select name="" id="" className=' rounded-md w-36 h-10 p-2 m-2 cursor-pointer shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]' onChange={(e) => setJobRole(e.target.value)}>
            <option value="">Select</option>
            <option value="webdev">Web Dev</option>
          </select>

          {
            jobRole.length > 0 ? (
              <>
                <select name="" id="" className=' rounded-md w-36 h-10 p-2 m-2 cursor-pointer shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]' onChange={(e) => setSubRole(e.target.value)}>
                  <option value="">Select</option>
                  <option value="mern">MERN Stack</option>
                </select>
                <button onClick={handleSubmit} className='bg-blue-500 rounded-md flex items-center justify-center  text-white font-semibold w-36 h-10 p-2 m-2 cursor-pointer shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]' disabled={isLoading}>{isLoading ? <img className='w-6' src={loader} alt="" /> : 'Generate Report'}</button>
              </>
            ) :
              ''
          }
        </div>
      </div>


    </div>


  )
}

export default Resume;
