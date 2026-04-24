import ReactMarkdown from "react-markdown";

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        textAlign: isUser ? "right" : "left",
        position: "relative",
        marginTop: 4,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "8px 12px",
          borderRadius: 15,
          backgroundColor: isUser ? "#96c7d4" : "#74c7de",
          maxWidth: isUser ? "70%" : "90%",
          lineHeight: 1.2,
          fontSize: 18,
          wordBreak: "break-word",
          borderTopRightRadius: isUser ? 4 : 16,
          borderTopLeftRadius: isUser ? 16 : 4,
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        }}
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;