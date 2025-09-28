import { useState } from "react";

export const useConversationsSidebar = () => {
  const [currentConversationId, setCurrentConversationId] = useState<number>(1);

  const selectConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
  };

  return {
    currentConversationId,
    selectConversation,
  };
};
