import { useState, useRef, useEffect } from "react";
import { usePostPrompt } from "./usePostPrompt.hook";

import { Message } from "../types/chat";
import { useGetConversation } from "./useGetConversation.hook";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: postPrompt } = usePostPrompt();
  const { data: messagesHistory } = useGetConversation();
  useEffect(() => {
    if (messagesHistory && messagesHistory.length > 0) {
      setMessages(messagesHistory);
      console.log("Loaded conversation history:", messagesHistory);
    }
  }, [messagesHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Typewriter effect for assistant messages
  useEffect(() => {
    if (!typingMessageId) return;

    const message = messages?.find((m) => m.id === typingMessageId);
    if (!message || message.role !== "assistant") return;

    const fullText = message.content;
    let currentIndex = 0;
    setTypingText("");

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypingText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTypingMessageId(null);
        setTypingText("");
        // Focus the input field after typing is complete
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, 20);

    return () => clearInterval(typeInterval);
  }, [typingMessageId, messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...(prev || []), userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Focus the input field after sending message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    postPrompt(inputValue.trim(), {
      onSuccess: (response) => {
        const assistantMessageId = Date.now().toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: response?.response || "",
          role: "assistant",
          timestamp: new Date().toISOString(),
        };

        // Add the message with full content
        setMessages((prev) => [...(prev || []), assistantMessage]);
        setTypingMessageId(assistantMessageId);
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error sending message:", error);
        setIsLoading(false);
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
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
  };
};
