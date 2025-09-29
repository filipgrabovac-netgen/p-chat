"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ConversationLoadingState {
  isLoading: boolean;
  typingMessageId: string | null;
  typingText: string;
}

interface ConversationLoadingContextType {
  loadingStates: Record<number, ConversationLoadingState>;
  setLoadingState: (
    conversationId: number,
    state: Partial<ConversationLoadingState>
  ) => void;
  clearLoadingState: (conversationId: number) => void;
  getLoadingState: (conversationId: number) => ConversationLoadingState;
}

const ConversationLoadingContext = createContext<
  ConversationLoadingContextType | undefined
>(undefined);

export const ConversationLoadingProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loadingStates, setLoadingStates] = useState<
    Record<number, ConversationLoadingState>
  >({});

  const setLoadingState = (
    conversationId: number,
    state: Partial<ConversationLoadingState>
  ) => {
    setLoadingStates((prev) => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        ...state,
      },
    }));
  };

  const clearLoadingState = (conversationId: number) => {
    setLoadingStates((prev) => {
      const newStates = { ...prev };
      delete newStates[conversationId];
      return newStates;
    });
  };

  const getLoadingState = (
    conversationId: number
  ): ConversationLoadingState => {
    return (
      loadingStates[conversationId] || {
        isLoading: false,
        typingMessageId: null,
        typingText: "",
      }
    );
  };

  return (
    <ConversationLoadingContext.Provider
      value={{
        loadingStates,
        setLoadingState,
        clearLoadingState,
        getLoadingState,
      }}
    >
      {children}
    </ConversationLoadingContext.Provider>
  );
};

export const useConversationLoading = () => {
  const context = useContext(ConversationLoadingContext);
  if (context === undefined) {
    throw new Error(
      "useConversationLoading must be used within a ConversationLoadingProvider"
    );
  }
  return context;
};
