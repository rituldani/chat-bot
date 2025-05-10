import './App.css'
import { useState } from "react";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]); 

  async function generateAnswer() {
    if (!question.trim()) return;
    setChatHistory([...chatHistory, { question, answer: "Loading..." }]);

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyD-cV0Wqtxz9WXdzzGauRLn4QJ9l8_9HBQ",
        {
          contents: [{ parts: [{ text: question }] }],
        }
      );

      const newAnswer = response.data.candidates[0].content.parts[0].text;

      setChatHistory((prevChat) =>
        prevChat.map((chat, index) =>
          index === prevChat.length - 1 ? { ...chat, answer: newAnswer } : chat
        )
      );
    } catch (error) {
      console.error("Error fetching answer:", error);
    }

    setQuestion("");
  }

  return (
    <div className='container'>
      <h1>Chat API</h1>
      <div className="main-box">
        <div className="chat-history">
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <pre className="question">{chat.question}</pre>
              <pre className="answer">{chat.answer}</pre>
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask Anything..."
          />
          <button onClick={generateAnswer}>&uarr;</button>
        </div>
      </div>
    </div>
  );
}

export default App;
