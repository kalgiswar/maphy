import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const Domain = process.env.REACT_APP_API_URL || "http://localhost:3309";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I can help with Maphy questions." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("maphytoken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${Domain}/api/v1/chatbot/chat`,
        { message: userMsg.text },
        { headers }
      );
      setMessages(prev => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <span>Maphy Assistant</span>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.sender}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {loading && <div className="msg bot">Typing...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>
    </div>
  );
};

export default Chatbot;