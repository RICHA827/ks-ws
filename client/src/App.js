import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  const handleLogin = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/session",
        { email, password },
        { withCredentials: true }
      );
      connectWebSocket();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) return;

    const socket = new WebSocket("ws://localhost:8000/api/graphql");

    socket.onopen = () => {
      setIsConnected(true);
      wsRef.current = socket;
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    socket.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      setTimeout(() => {
        if (!isConnected) connectWebSocket();
      }, 1000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error", error);
      setIsConnected(false);
      wsRef.current = null;
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const sendMessage = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "message", message }));
      setMessage("");
    }
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="App">
      <h1>Keystone WebSocket Client</h1>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
      <div>
        <button onClick={isConnected ? disconnectWebSocket : connectWebSocket}>
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!isConnected}
        />
        <button onClick={sendMessage} disabled={!isConnected}>
          Send Message
        </button>
      </div>
      <div>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{JSON.stringify(msg)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
