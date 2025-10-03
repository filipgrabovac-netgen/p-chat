"use client";

import { LoadingScreen } from "./components/loading_screen/LoadingScreen";
import { useLoadingScreen } from "./hooks/useLoadingScreen.hook";
import { useConversationsSidebar } from "./hooks/useConversationsSidebar.hook";
import { useSimpleConversationChat } from "./hooks/useSimpleConversationChat.hook";
import { ChatHeader } from "./components/chat_header/ChatHeader";
import { ChatInput } from "./components/chat_input/ChatInput";
import { ChatMessages } from "./components/chat_messages/ChatMessages";
import { ConversationsSidebar } from "./components/conversations_sidebar/ConversationsSidebar";

export default function Home() {
  const { showLoading, handleLoadingComplete } = useLoadingScreen(500);
  const { currentConversationId, selectConversation } =
    useConversationsSidebar();
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
