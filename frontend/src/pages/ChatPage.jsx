import ChatWindow from "../components/ChatWindow";
import PageContainer from "../components/PageContainer";
import DisclaimerModal from "../components/DisclaimerModal";

function ChatPage() {
  return (
    <PageContainer>
      <DisclaimerModal />
      <ChatWindow />
    </PageContainer>
  );
}

export default ChatPage;