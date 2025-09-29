import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { usePostPrompt } from "./usePostPrompt.hook";
import { useConversationMessages } from "./useConversationMessages.hook";
import { useConversationLoading } from "../contexts/ConversationLoadingContext";
import { Message } from "../types/chat";

export const useConversationChat = (
  conversationId?: number,
  isActive: boolean = false
) => {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [localTypingText, setLocalTypingText] = useState("");
  const [pendingRequestConversationId, setPendingRequestConversationId] =
    useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { setLoadingState, getLoadingState } = useConversationLoading();
  const loadingState = conversationId
    ? getLoadingState(conversationId)
    : { isLoading: false, typingMessageId: null, typingText: "" };

  const stableSetLoadingState = useCallback(
    (
      id: number,
      state: Partial<{
        isLoading: boolean;
        typingMessageId: string | null;
        typingText: string;
      }>
    ) => setLoadingState(id, state),
    [setLoadingState]
  );

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
    }, 50);
  }, []);

  // Convert conversation messages to Message format
  const backendMessages: Message[] = useMemo(
    () =>
      conversationMessages.map((msg) => ({
        id: msg.id.toString(),
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
      })),
    [conversationMessages]
  );

  // Use backend messages as base, then add any local messages
  const allMessages = useMemo(
    () => [...backendMessages, ...localMessages],
    [backendMessages, localMessages]
  );

  // Clear local messages when conversation changes, but only if we're not in the middle of a request
  useEffect(() => {
    // Clear pending request tracking when conversation changes
    setPendingRequestConversationId(null);

    // Only clear if we're not currently loading (no pending request)
    if (!loadingState.isLoading) {
      setLocalMessages([]);
      setLocalTypingText("");
    }
  }, [conversationId, loadingState.isLoading]);

  useEffect(() => {
    if (allMessages && allMessages.length > 0) {
      scrollToBottom();
      // Additional scroll attempts for initial load
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    }
  }, [allMessages, localTypingText, scrollToBottom]);

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
    if (!loadingState.typingMessageId || !conversationId) {
      setLocalTypingText("");
      return;
    }

    const message = allMessages?.find(
      (m) => m.id === loadingState.typingMessageId
    );
    if (!message || message.role !== "assistant") {
      setLocalTypingText("");
      return;
    }

    const fullText = message.content;
    let currentIndex = 0;
    setLocalTypingText("");

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setLocalTypingText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setLocalTypingText("");
        stableSetLoadingState(conversationId, {
          typingMessageId: null,
          typingText: "",
        });
        // Focus the input field after typing is complete
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, 20);

    return () => clearInterval(typeInterval);
  }, [
    loadingState.typingMessageId,
    allMessages,
    conversationId,
    stableSetLoadingState,
  ]);

  const handleSendMessage = async () => {
    if (
      !inputValue.trim() ||
      loadingState.isLoading ||
      !isActive ||
      !conversationId
    )
      return;

    // Double-check that we're still in the same conversation
    if (!isActive) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date().toISOString(),
    };

    // Add user message to local state immediately (only if still active)
    if (isActive && conversationId) {
      setLocalMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setPendingRequestConversationId(conversationId);
      setLoadingState(conversationId, { isLoading: true });
    } else {
      return;
    }

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
        // Only add the response if we're still in the same conversation that made the request
        if (
          !isActive ||
          !conversationId ||
          conversationId !== pendingRequestConversationId
        ) {
          setLoadingState(conversationId, { isLoading: false });
          setPendingRequestConversationId(null);
          return;
        }

        const assistantMessageId = Date.now().toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: response?.response || "",
          role: "assistant",
          timestamp: new Date().toISOString(),
        };

        // Add the assistant message to local state
        setLocalMessages((prev) => [...prev, assistantMessage]);
        setLoadingState(conversationId, {
          isLoading: false,
          typingMessageId: assistantMessageId,
          typingText: "",
        });

        // Scroll to bottom after adding assistant message
        setTimeout(() => {
          scrollToBottom();
        }, 50);

        // Refetch messages from backend to get the persisted messages
        setTimeout(() => {
          refetchMessages();
          // Clear local messages after refetch
          setLocalMessages([]);
        }, 1000);
      },
      onError: (error) => {
        console.error("Error sending message:", error);
        setLoadingState(conversationId, { isLoading: false });
        setPendingRequestConversationId(null);
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
    messages: allMessages,
    inputValue,
    isLoading: isActive ? loadingState.isLoading || isLoadingMessages : false,
    typingMessageId: isActive ? loadingState.typingMessageId : null,
    typingText: isActive ? localTypingText : "",
    inputRef,
    messagesEndRef,
    setInputValue,
    handleSendMessage,
    handleKeyPress,
  };
};
