"use client";
import { ChatContainer } from "./components";
import { useChat } from "./hooks/useChat.hook";

export default function Home() {
  const {
    messages,
    inputValue,
    isLoading,
    typingMessageId,
    typingText,
    inputRef,
    setInputValue,
    handleSendMessage,
    handleKeyPress,
  } = useChat();

  return (
    <ChatContainer
      messages={messages}
      inputValue={inputValue}
      isLoading={isLoading}
      typingMessageId={typingMessageId}
      typingText={typingText}
      onInputChange={setInputValue}
      onSendMessage={handleSendMessage}
      onKeyPress={handleKeyPress}
      inputRef={inputRef}
    />
  );
}
