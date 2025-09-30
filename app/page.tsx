"use client";
import {
  ConversationsSidebar,
  ChatHeader,
  ChatMessages,
  ChatInput,
} from "./components";
import { LoadingScreen } from "./components/LoadingScreen";
import { useLoadingScreen } from "./hooks/useLoadingScreen.hook";
import { useConversationsSidebar } from "./hooks/useConversationsSidebar.hook";
import { useSimpleConversationChat } from "./hooks/useSimpleConversationChat.hook";

export default function Home() {
  const { showLoading, handleLoadingComplete } = useLoadingScreen(500);
  const { currentConversationId, selectConversation } =
    useConversationsSidebar();
  // Use simple conversation chat hook - always call it (React rules)
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
  } = useSimpleConversationChat(currentConversationId, !!currentConversationId);

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
          {currentConversationId ? (
            <>
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
            </>
          ) : (
            <div className="flex-1 bg-gray-50" />
          )}
        </div>
      </div>
    </div>
  );
}
