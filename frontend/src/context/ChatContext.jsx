import { createContext, useContext, useState } from "react";

const ChatContext = createContext();


export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: `👋 **Hi! Welcome to MyCourtPal!**

I can help you with any questions about court processes, logistics, and resources.

💡 **Tips for MyCourtPal**
- You can upload your court document so I have more context about your case.
- If your case has been assigned to a judge, I can share observations reported by other courtgoers.
- Feel free to ask follow-up questions if anything is unclear.

**You're not alone in this process. Ready to get started?**`,
    },
  ]);

  return (
    <ChatContext.Provider value={{ messages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
