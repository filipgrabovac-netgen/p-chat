"use client";
import {
  ConversationsSidebar,
  ChatHeader,
  ChatMessages,
  ChatInput,
} from "./components";
import { LoadingScreen } from "./components/LoadingScreen";
import { useChat } from "./hooks/useChat.hook";
import { useLoadingScreen } from "./hooks/useLoadingScreen.hook";
import { useConversationsSidebar } from "./hooks/useConversationsSidebar.hook";
import { useConversationChat } from "./hooks/useConversationChat.hook";

export default function Home() {
  const { showLoading, handleLoadingComplete } = useLoadingScreen(500);
  const { currentConversationId, selectConversation } =
    useConversationsSidebar();
  // Use conversation chat hook if a conversation is selected, otherwise use regular chat
  const conversationChat = useConversationChat(currentConversationId);
  const regularChat = useChat();

  const {
    messages,
    inputValue,
    isLoading,
    typingMessageId,
    typingText,
    inputRef,
    messagesEndRef,
    setInputValue,
    handleSendMessage,
    handleKeyPress,
  } = currentConversationId ? conversationChat : regularChat;

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden">
        <ConversationsSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={selectConversation}
        />
        <div className="flex-1 flex flex-col">
          <ChatMessages
            messages={messages || []}
            isLoading={isLoading}
            typingMessageId={typingMessageId}
            typingText={typingText}
            messagesEndRef={messagesEndRef}
          />
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
}
