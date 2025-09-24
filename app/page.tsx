"use client";
import { ChatContainer } from "./components";
import { LoadingScreen } from "./components/LoadingScreen";
import { useChat } from "./hooks/useChat.hook";
import { useLoadingScreen } from "./hooks/useLoadingScreen.hook";

export default function Home() {
  const { showLoading, handleLoadingComplete } = useLoadingScreen(3000);
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

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

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
