import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";
import MessageBubble from "./MessageBubble";
import { useChat } from "../context/ChatContext";

const exampleQuestions = [
  "What should I bring to court?",
  "How do I check my court date?",
  "What happens at my first hearing?",
  "How can I get a Simplified Divorce?",
];

function ChatWindow() {
  const { messages, setMessages } = useChat();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const hasUserMessage = messages.some((msg) => msg.role === "user");
  const [showWelcome, setShowWelcome] = useState(true);
  const chatRef = useRef(null);
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (hasUserMessage) {
      setTimeout(() => {
        setShowWelcome(false);
      }, 500);
    }
  }, [hasUserMessage]);

  useEffect(() => {
  if (!chatRef.current) return;

  const lastMessage = chatRef.current.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [messages, loading]);

  const handleSend = async (customInput) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim()) return;

    const userMessage = { role: "user", content: messageToSend };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(messageToSend);

      const botMessage = {
        role: "assistant",
        content: data.answer,
        followups: data.followups || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Cannot connect to backend" },
      ]);
    }

    setLoading(false);
  };

  const handleExampleClick = (question) => {
    setInput(question);
    handleSend(question);
  };

  const handleFollowupClick = (question, msg) => {
    setMessages((prev) =>
      prev.map((m) => (m === msg ? { ...m, followups: [] } : m))
    );

    handleSend(question);
  };

  const buttonStyle = {
    padding: "8px 12px",
    borderRadius: 20,
    cursor: "pointer",
    background: "#e5effd",
    border: "none",
    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
  };


  return (
    <div>
      <div
        style={{
          border: "2px solid #666",
          padding: 10,
          height: "calc(100vh - 230px)",
          width: "97%",
          margin: "20px auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {showWelcome && (
          <div
            style={{
              textAlign: "center",
              marginTop: "10vh",
              fontSize: "clamp(20px, 3vw, 28px)",
              color: "#515050",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              opacity: hasUserMessage ? 0 : 1,
              transform: hasUserMessage
                ? "translateY(-10px)"
                : "translateY(0)",
            }}
          >
            Simplifying the court experience, so you can go in fearless.
          </div>
        )}

        <div
          ref={chatRef}
          style={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: 20,
          }}
        >
          {messages.map((msg, index) => (
            <div key={index}>
              <MessageBubble message={msg} />
            </div>
          ))}
          {loading && <p>Waiting for response...</p>}
        </div>

        <div style={{ textAlign: "center", paddingTop: 10 }}>
          {/* Followup buttons */}
          {lastMessage?.role === "assistant" && lastMessage.followups?.length > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  You might want to ask:
                </p>

                {lastMessage.followups.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleFollowupClick(q, lastMessage)}
                    style={buttonStyle}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", paddingTop: 10 }}>
          {messages.filter((m) => m.role === "user").length === 0 && (
            <>
              <p style={{ fontWeight: 700, fontSize: 20 }}>
                Try asking:
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 30,
                  justifyContent: "center",
                }}
              >
                {exampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(q)}
                    style={buttonStyle}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", width: "95%", margin: "10px auto" }}>
        <input
          style={{
            flex: 1,
            padding: 10,
            fontSize: 18,
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleSend();
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={loading}
          style={{
            marginLeft: 10,
            opacity: loading ? 0.5 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;