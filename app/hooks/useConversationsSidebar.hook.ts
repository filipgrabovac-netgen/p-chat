import { useState } from "react";

export const useConversationsSidebar = () => {
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);

  const selectConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
  };

  return {
    currentConversationId,
    selectConversation,
  };
};
