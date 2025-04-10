import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode instead of jsonwebtoken

export const context = createContext(null);

export default function Context({ children }) {
  const [session, setSession] = useState(false);
  const [email, setEmail] = useState(null); // Store email centrally

  const [skills, setSkills] = useState(['html', 'css', "javascript"]);
  const [tech_stack, set_tech_stack] = useState('html, css, javascript');
  const [userData, setUserData] = useState(null);
  const [showCustomJobRole, setShowCustomJobRole] = useState(false);


  useEffect(() => {

    async function getSkills() {

      if (email) {
        const res = await fetch(`http://localhost:2000/api/skills/${email}`);

        const data = await res.json();

        setSkills(data.skills)

        const joined = data.skills.join(", ");
        set_tech_stack(joined)
        console.log(data)
      }
    }
    getSkills()

  }, [email])



  useEffect(() => {
    const fetchUserData = async () => {
      try {

        const response = await fetch(`http://localhost:2000/user?email=${encodeURIComponent(email)}`, {
          headers: {
            'x-user-email': email
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);



        // Check if job role is 'Other' to display custom job role field
        if (data.customJobRole.length > 0) {
          setShowCustomJobRole(true);
        }
      } catch (err) {

      }
    };

    if (email) {
      fetchUserData();
    }
  }, [email]);





  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Check token validity and decode it
      try {
        const decoded = jwtDecode(token); // Use jwt-decode to decode the token
        if (decoded && decoded.exp * 1000 > Date.now()) { // Check if token is not expired
          setSession(true);
          setEmail(decoded.email); // Extract email from decoded token
        } else {
          // Token is expired
          setSession(false);
          setEmail(null);
          localStorage.removeItem("token");
        }
      } catch (error) {
        // Invalid token
        setSession(false);
        setEmail(null);
        localStorage.removeItem("token");
        console.error("Token decoding failed:", error);
      }
    } else {
      setSession(false);
      setEmail(null);
    }
  }, []); // Run only on mount


  // Optional backend verification (recommended for security)
  const verifyTokenWithBackend = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSession(true);
        setEmail(data.email); // Set email from backend response
      } else {
        setSession(false);
        setEmail(null);
        localStorage.removeItem("token");
      }
    } catch (error) {
      setSession(false);
      setEmail(null);
      localStorage.removeItem("token");
      console.error("Token verification failed:", error);
    }
  };

  // Uncomment to use backend verification instead
  /*
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyTokenWithBackend(token);
    }
  }, []);
  */
  const [overAllEmotion, setOverAllEmotion] = useState([])
  const [ans, setAns] = useState("notset");
  const [start, setStart] = useState(false);
  const [prevTs, setPrevTs] = useState(0);
  const [htmlContent, setHtmlContent] = useState(() => {
    const saveData = localStorage.getItem("resumeresult");
    return saveData ? JSON.parse(saveData) : "";
  });
  const [transcriptCleared, setTranscriptCleared] = useState(false);
  const [hrQuestion, setHrQuestion] = useState("");
  const [ts, setTs] = useState("");
  const [emotion, setEmotion] = useState("");
  console.log(userData)

  const values = {
    session,
    email, // Email is now available centrally
    htmlContent,
    setHtmlContent,
    transcriptCleared,
    setTranscriptCleared,
    hrQuestion,
    setHrQuestion,
    ts,
    setTs,
    emotion,
    setEmotion,
    prevTs,
    setPrevTs,
    ans,
    setAns,
    start,
    setStart,
    skills,
    overAllEmotion, setOverAllEmotion,
    tech_stack, set_tech_stack,
    userData,
  };

  return <context.Provider value={values}>{children}</context.Provider>;
}