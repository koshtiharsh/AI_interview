import { createContext, useState } from "react"


export const context = createContext(null)
export default function Context({ children }) {



  const [htmlContent, setHtmlContent] = useState('');
  const [transcriptCleared, setTranscriptCleared] = useState(false);
  const [hrQuestion, setHrQuestion] = useState("");

  const [ts , setTs] = useState('')

  const [emotion, setEmotion] = useState('');
  const values = { htmlContent, setHtmlContent, transcriptCleared, setTranscriptCleared, hrQuestion, setHrQuestion ,ts,setTs,emotion, setEmotion}


  return (
    <context.Provider value={values}>
      {children}
    </context.Provider>
  )
};