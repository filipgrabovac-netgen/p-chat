import { useState, useRef, useEffect, useCallback } from "react";
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

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Alternative scroll method as fallback
    setTimeout(() => {
      const chatContainer = document.querySelector(".flex-1.overflow-y-auto");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (messagesHistory && messagesHistory.length > 0) {
      setMessages(messagesHistory);
      // Scroll to bottom after loading history with multiple attempts
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      setTimeout(() => {
        scrollToBottom();
      }, 300);
      setTimeout(() => {
        scrollToBottom();
      }, 500);
      setTimeout(() => {
        scrollToBottom();
      }, 1000);
      setTimeout(() => {
        scrollToBottom();
      }, 2000);
    }
  }, [messagesHistory, scrollToBottom]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
      // Additional scroll attempts for initial load
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    }
  }, [messages, typingText, scrollToBottom]);

  // Focus input on component mount and scroll to bottom
  useEffect(() => {
    inputRef.current?.focus();

    // Scroll to bottom when component first mounts (after loading screen)
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    setTimeout(() => {
      scrollToBottom();
    }, 300);
    setTimeout(() => {
      scrollToBottom();
    }, 1000);

    // Use MutationObserver to detect DOM changes and scroll
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    // Observe the chat container for changes
    const chatContainer = document.querySelector(".flex-1.overflow-y-auto");
    if (chatContainer) {
      observer.observe(chatContainer, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [scrollToBottom]);

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

    // Scroll to bottom after adding user message
    setTimeout(() => {
      scrollToBottom();
    }, 50);

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

        // Scroll to bottom after adding assistant message
        setTimeout(() => {
          scrollToBottom();
        }, 50);
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
