"use client";

import { useState, useEffect, useRef } from "react";
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

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleConversationSelect = (conversationId: number) => {
    selectConversation(conversationId);
    // Close sidebar on mobile after selecting a conversation
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Drag functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSidebarOpen) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isSidebarOpen) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    // Only allow dragging down (positive deltaY)
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // If dragged more than 100px down, close the sidebar
    if (dragY > 100) {
      setIsSidebarOpen(false);
    }

    // Reset drag position
    setDragY(0);
  };

  // Calculate transform based on drag (mobile only)
  const getTransform = () => {
    // On mobile, use drag-based transforms
    if (!isSidebarOpen) return "translateY(100%)";
    if (isDragging) {
      return `translateY(${Math.min(dragY, 200)}px)`;
    }
    return "translateY(0)";
  };

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isSidebarOpen]);

  // Add dragging class when dragging
  useEffect(() => {
    if (isDragging) {
      document.body.classList.add("dragging");
    } else {
      document.body.classList.remove("dragging");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("dragging");
    };
  }, [isDragging]);

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <ChatHeader
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            className={`fixed inset-0 z-40 lg:hidden transition-all duration-200 ${
              isDragging
                ? "bg-white/10 backdrop-blur-none"
                : "bg-white/20 backdrop-blur-sm"
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`
          ${isSidebarOpen ? "translate-y-0" : "translate-y-full"}
          lg:translate-y-0 lg:translate-x-0
          fixed lg:relative
          bottom-0 left-0 lg:top-0
          w-full lg:w-80 h-[85vh] lg:h-full
          z-50 lg:z-auto
          ${
            isDragging
              ? "transition-none"
              : "transition-transform duration-300 ease-in-out"
          }
          lg:transition-none
        `}
          style={{
            transform: isDragging ? getTransform() : undefined,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ConversationsSidebar
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            isDragging={isDragging}
          />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
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
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-slate-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Welcome to AI Assistant
                </h3>
                <p className="text-slate-600 mb-6">
                  Select a conversation from the sidebar or start a new one to
                  begin chatting.
                </p>
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Open Conversations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
