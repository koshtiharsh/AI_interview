import React, { useContext, useState } from 'react'
import { context } from '../context/Context'
import { useNavigate } from 'react-router-dom'

const Resume = () => {

  const [data, setData] = useState({
    jobDescription: '',
    file: ''
  })

  const navigate = useNavigate();

  const { htmlContent, setHtmlContent } = useContext(context)



  const handleSubmit = async (e) => {

    e.preventDefault();

    const formData = new FormData()
    formData.append('jobDescription', data.jobDescription)
    formData.append('file', data.file)

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
  function handlefilechange(e) {
    setData({ ...data, file: e.target.files[0] })
  }

  return (
    <div>
      <form action="" onSubmit={handleSubmit} onChange={handlefilechange} name='jobDescription' >

        <input type="file" name="file" />
        <input type="text" name='jobDescription' value={data.jobDescription} onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })} />
        <button>submit</button>
      </form>
      <input type="text" onChange={(e) => setHtmlContent(e.target.value)} value={htmlContent} />
      {htmlContent}
    </div>


  )
}

export default Resume;
