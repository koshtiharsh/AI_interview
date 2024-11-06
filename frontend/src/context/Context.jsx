import { createContext, useState } from "react"


export const context = createContext(null)
export default function Context({ children }) {



  const [htmlContent, setHtmlContent] = useState('');

  const values = { htmlContent, setHtmlContent }
  return (
    <context.Provider value={values}>
      {children}
    </context.Provider>
  )
};