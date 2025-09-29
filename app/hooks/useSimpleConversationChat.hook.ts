import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { usePostPrompt } from "./usePostPrompt.hook";
import { useConversationMessages } from "./useConversationMessages.hook";
import { Message } from "../types/chat";

export const useSimpleConversationChat = (conversationId?: number) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: postPrompt } = usePostPrompt(conversationId);
  const {
    messages: conversationMessages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useConversationMessages(conversationId);

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
    }, 10);
  }, []);

  // Convert conversation messages to Message format
  const backendMessages: Message[] = conversationMessages.map((msg) => ({
    id: msg.id.toString(),
    content: msg.content,
    role: msg.role,
    timestamp: msg.timestamp,
  }));

  // Combine backend messages with local messages
  const messages: Message[] = useMemo(
    () => [...backendMessages, ...localMessages],
    [backendMessages, localMessages]
  );

  // Clear local messages when conversation changes
  useEffect(() => {
    setLocalMessages([]);
    setTypingText("");
  }, [conversationId]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
      // Additional scroll attempts for initial load
      setTimeout(() => {
        scrollToBottom();
      }, 20);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, scrollToBottom]);

  // Focus input on component mount and scroll to bottom
  useEffect(() => {
    inputRef.current?.focus();

    // Scroll to bottom when component first mounts
    setTimeout(() => {
      scrollToBottom();
    }, 20);
    setTimeout(() => {
      scrollToBottom();
    }, 50);
    setTimeout(() => {
      scrollToBottom();
    }, 100);

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
        }, 20);
      }
    }, 10);

    return () => clearInterval(typeInterval);
  }, [typingMessageId, messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date().toISOString(),
    };

    // Add user message to local state immediately
    setLocalMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      scrollToBottom();
    }, 10);

    // Focus the input field after sending message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 20);

    postPrompt(inputValue.trim(), {
      onSuccess: (response) => {
        const assistantMessageId = Date.now().toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: response?.response || "",
          role: "assistant",
          timestamp: new Date().toISOString(),
        };

        // Add assistant message to local state
        setLocalMessages((prev) => [...prev, assistantMessage]);
        setTypingMessageId(assistantMessageId);
        setIsLoading(false);

        // Scroll to bottom after adding assistant message
        setTimeout(() => {
          scrollToBottom();
        }, 10);

        // Refetch messages from backend to get the persisted messages
        setTimeout(() => {
          refetchMessages();
          // Clear local messages after refetch to avoid duplicates
          setLocalMessages([]);
        }, 500);
      },
      onError: (error) => {
        console.error("Error sending message:", error);
        setIsLoading(false);
        // Remove the user message from local state on error
        setLocalMessages((prev) => prev.slice(0, -1));
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
    isLoading: isLoading || isLoadingMessages,
    typingMessageId,
    typingText,
    inputRef,
    messagesEndRef,
    setInputValue,
    handleSendMessage,
    handleKeyPress,
  };
};
