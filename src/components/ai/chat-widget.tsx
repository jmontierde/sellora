"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AIChatWidgetProps {
  storeId: Id<"stores">;
  storeName: string;
  onClose: () => void;
}

export function AIChatWidget({ storeId, storeName, onClose }: AIChatWidgetProps) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.chat.getMessages, { storeId, sessionId });
  const sendMessage = useMutation(api.chat.sendMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Save user message
    await sendMessage({
      storeId,
      sessionId,
      role: "user",
      content: userMessage,
    });

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          storeId,
          storeName,
        }),
      });
      const data = await res.json();

      await sendMessage({
        storeId,
        sessionId,
        role: "assistant",
        content: data.reply ?? "Sorry, I couldn't process that request.",
      });
    } catch {
      await sendMessage({
        storeId,
        sessionId,
        role: "assistant",
        content: "Sorry, I'm having trouble right now. Please try again.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[380px] overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl animate-scale-in">
      {/* Header */}
      <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-3.5">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-fuchsia-300/30 blur-2xl" />
        </div>
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/20">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">AI Assistant</p>
            <p className="flex items-center gap-1 text-[10px] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online · Powered by Sellora AI
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="relative flex h-7 w-7 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 space-y-3 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white p-4">
        {(!messages || messages.length === 0) && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-semibold tracking-tight text-gray-900">Hi! How can I help?</p>
            <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-gray-500">
              Ask me about products, recommendations, or anything else.
            </p>
          </div>
        )}
        {messages?.map((msg) => (
          <div
            key={msg._id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-tr-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm"
                  : "rounded-tl-md bg-white text-gray-800 ring-1 ring-gray-200/70"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 ring-1 ring-gray-200">
                <User className="h-3.5 w-3.5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 ring-1 ring-gray-200/70">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" />
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.15s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            className="flex-1 border-gray-200 bg-gray-50 focus:bg-white"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
