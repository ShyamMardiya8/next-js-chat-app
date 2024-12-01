import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Retrieve username from localStorage or prompt the user to enter one
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      const newUsername = prompt("Enter your username:");
      if (newUsername) {
        localStorage.setItem("username", newUsername);
        setUsername(newUsername);
      }
    }

    // Connect to the Socket.IO backend
    const socketIo = io();

    // Listen for 'message' events
    socketIo.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // Save messages to localStorage for persistence
      const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
      localStorage.setItem("messages", JSON.stringify([...storedMessages, msg]));
    });

    // Save socket instance to state
    setSocket(socketIo);

    // Retrieve stored messages from localStorage on load
    const savedMessages = JSON.parse(localStorage.getItem("messages")) || [];
    setMessages(savedMessages);

    // Cleanup on unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (socket && input.trim()) {
      const messageData = {
        username,
        text: input,
      };
      socket.emit("message", messageData); // Send message to the server
      setInput(""); 
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Socket.IO Chat</h1>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}
          style={
            {
              display: 'flex',
              justifyContent: `${msg.username === username ? "flex-end" : "flex-start"}`
            }
          }>
            <strong>{msg.username=== username ? "you" : msg.username }:</strong> 
            <div 
            
            >
              {msg.text}
              </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            width: "80%",
            padding: "10px",
            marginRight: "10px",
            border: "1px solid #ccc",
          }}
        />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Send
        </button>
      </form>
    </div>
  );
}
