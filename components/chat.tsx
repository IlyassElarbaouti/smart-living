"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SmilePlus,
  Send,
  CheckCheck,
  Check,
  Users,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default function Chat() {
  const [messageInput, setMessageInput] = useState("");
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    isChatOpen, 
    toggleChat, 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    loadMessages 
  } = useChat();

  // Load messages when chat opens
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get unique senders from messages
  const uniqueSenders = Array.from(
    new Map(messages.map((m) => [m.sender.id, m.sender])).values()
  );

  // Filter messages by selected sender or show all
  const filteredMessages = selectedSender
    ? messages.filter((m) => m.sender.id === selectedSender)
    : messages;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || isLoading) return;

    const message = messageInput.trim();
    setMessageInput("");
    
    await sendMessage(message);
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-3 right-3 w-full max-w-5xl mx-auto p-6 bg-white dark:bg-black rounded-3xl shadow-lg flex flex-col h-[550px] border border-gray-300 dark:border-gray-700 z-50">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-3 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-black dark:text-white" />
          <div>
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Concierge Support
            </h2>
            <p className="italic text-sm text-gray-600 dark:text-gray-400">
              Your personal assistant, available 24/7
            </p>
          </div>
        </div>
        <button
          onClick={toggleChat}
          aria-label="Close chat"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Body */}
      <main className="flex flex-1 overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
        {/* Participants List */}
        {uniqueSenders.length > 1 && (
          <aside className="w-56 bg-gray-50 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
            {uniqueSenders.map((sender) => {
              const isSelected = selectedSender === sender.id;
              return (
                <button
                  key={sender.id}
                  onClick={() =>
                    setSelectedSender(isSelected ? null : sender.id)
                  }
                  className={cn(
                    "flex items-center gap-3 w-full p-3 mb-3 rounded-lg transition-colors",
                    isSelected
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-300"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      {sender.id === 'assistant' ? (
                        <Image 
                          src={sender.avatar} 
                          alt={sender.name} 
                          width={40} 
                          height={40}
                          className="h-full w-full"
                        />
                      ) : (
                        <>
                          <AvatarImage src={sender.avatar} alt={sender.name} />
                          <AvatarFallback>{getInitials(sender.name)}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-black",
                        sender.isOnline ? "bg-green-500" : "bg-gray-400"
                      )}
                    />
                  </div>
                  <span className="text-left font-medium truncate text-sm">
                    {sender.name}
                  </span>
                </button>
              );
            })}
          </aside>
        )}

        {/* Messages */}
        <section className="flex-1 p-6 overflow-y-auto bg-white dark:bg-black">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No messages yet. Start a conversation!
              </p>
            </div>
          ) : (
            <>
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="mb-6 last:mb-0 group border-b border-gray-200 dark:border-gray-800 pb-4"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <Avatar className="h-10 w-10">
                      {message.sender.id === 'assistant' ? (
                        <Image 
                          src={message.sender.avatar} 
                          alt={message.sender.name} 
                          width={40} 
                          height={40}
                          className="h-full w-full"
                        />
                      ) : (
                        <>
                          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                          <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-semibold text-black dark:text-white">
                        {message.sender.name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 text-lg mb-1 ml-14">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 ml-14">
                    <div className="flex items-center gap-1">
                      {message.status === "read" && (
                        <CheckCheck className="w-4 h-4 text-green-500" />
                      )}
                      {message.status === "delivered" && (
                        <Check className="w-4 h-4" />
                      )}
                      {message.status === "sent" && (
                        <Check className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-6 flex items-center gap-4 border-t border-gray-300 dark:border-gray-700 pt-4">
        <button
          aria-label="Add emoji"
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          disabled={isLoading}
        >
          <SmilePlus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <form onSubmit={handleSendMessage} className="flex-1 flex gap-4">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Write your message..."
            disabled={isLoading}
            className={cn(
              "flex-1 px-5 py-3 rounded-full border border-gray-300 dark:border-gray-700",
              "bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={isLoading || !messageInput.trim()}
            className={cn(
              "p-3 rounded-full bg-black dark:bg-white text-white dark:text-black hover:brightness-90 transition",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}
