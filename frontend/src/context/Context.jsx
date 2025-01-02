import { createContext, useState } from "react"


export const context = createContext(null)
export default function Context({ children }) {

  const [ans, setAns] = useState('notset')
  const [start, setStart] = useState(false);

  const [prevTs, setPrevTs] = useState(0)

  const [htmlContent, setHtmlContent] = useState(() => {
    const saveData = localStorage.getItem('resumeresult')
    return saveData ? JSON.parse(saveData) : '';

  });
  const [transcriptCleared, setTranscriptCleared] = useState(false);
  const [hrQuestion, setHrQuestion] = useState("");

  const [ts, setTs] = useState('')

  const [emotion, setEmotion] = useState('');
  const values = { htmlContent, setHtmlContent, transcriptCleared, setTranscriptCleared, hrQuestion, setHrQuestion, ts, setTs, emotion, setEmotion, prevTs, setPrevTs, ans, setAns }


  return (
    <context.Provider value={values}>
      {children}
    </context.Provider>
  )
};