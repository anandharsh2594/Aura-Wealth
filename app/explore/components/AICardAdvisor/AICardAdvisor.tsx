"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Minus, Trash2, Send, Copy, Check, ChevronRight } from "lucide-react";
import { useAdvisor } from "./AdvisorContext";
import { useCardAdvisor, ChatMessage } from "./useCardAdvisor";
import { parseMarkdown } from "./utils";
import clsx from "clsx";

const SUGGESTIONS = [
  "Book a flight to Dubai for ₹2 lakhs",
  "Monthly grocery shopping of ₹15,000",
  "I spend ₹8,000/month on dining out",
  "Buying a laptop for ₹80,000 online"
];

export default function AICardAdvisor() {
  const { isOpen, setIsOpen, initialQuery, clearInitialQuery } = useAdvisor();
  const { 
    messages, 
    isLoading, 
    sessionTags, 
    showSessionToast, 
    sendMessage, 
    restoreSession, 
    clearSession,
    setShowSessionToast 
  } = useCardAdvisor();

  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle initial query from context
  useEffect(() => {
    if (initialQuery && isOpen) {
      setInput(initialQuery);
      clearInitialQuery();
      // small delay to let UI render before sending
      setTimeout(() => {
        handleSend(initialQuery);
      }, 100);
    }
  }, [initialQuery, isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !showSessionToast) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, showSessionToast]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    
    const messageToSend = text;
    setInput("");
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-[85vh] md:h-[600px] bg-surface border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 pb-[env(safe-area-inset-bottom)]"
          role="dialog"
          aria-label="AI Card Advisor"
        >
          {/* Header */}
          <div className="bg-surface border-b border-white/10 p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gold-gradient opacity-10 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white">AI Card Advisor</h3>
                <p className="text-xs text-slate-400">Tell me what you're buying — I'll find your best card</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button 
                onClick={clearSession}
                className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                aria-label="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Memory Chips */}
          {sessionTags.length > 0 && messages.length > 0 && (
            <div className="bg-surface/50 border-b border-white/5 px-4 py-2 flex flex-wrap gap-2">
              {sessionTags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider font-label-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6" aria-live="polite">
            
            {/* Session Restore Toast */}
            {showSessionToast && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-sm text-white mb-3">Chat saved — previous recommendations available</p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={restoreSession}
                    className="px-4 py-1.5 bg-primary text-on-primary rounded-full text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Continue chat
                  </button>
                  <button 
                    onClick={() => setShowSessionToast(false)}
                    className="px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-semibold hover:bg-white/20 transition-colors"
                  >
                    Start fresh
                  </button>
                </div>
              </div>
            )}

            {!showSessionToast && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-slate-300 text-sm mb-6">
                  I can analyze your specific purchases and recommend the exact card that maximizes your rewards. Try a suggestion below!
                </p>
                <div className="flex flex-col gap-2 w-full">
                  {SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sug)}
                      className="text-left text-sm text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors flex items-center justify-between"
                    >
                      <span>{sug}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showSessionToast && messages.map((msg) => (
              <div 
                key={msg.id} 
                className={clsx(
                  "flex max-w-[85%]",
                  msg.role === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
                )}
              >
                {msg.role !== "user" && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                )}
                
                <div className="flex flex-col relative group">
                  <div 
                    className={clsx(
                      "px-4 py-3 rounded-2xl text-sm",
                      msg.role === "user" 
                        ? "bg-primary text-on-primary rounded-tr-sm" 
                        : msg.role === "error"
                          ? "bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-sm"
                          : "bg-white/5 border border-white/10 text-white rounded-tl-sm"
                    )}
                  >
                    {msg.role === "user" ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div className="ai-markdown">
                        {parseMarkdown(msg.content)}
                      </div>
                    )}
                  </div>
                  
                  <span className={clsx(
                    "text-[10px] text-slate-500 mt-1",
                    msg.role === "user" ? "text-right" : "text-left ml-1"
                  )}>
                    {msg.timestamp}
                  </span>

                  {/* Copy Button for AI */}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute -right-8 bottom-4 p-1.5 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all bg-surface border border-white/10 rounded-md"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  
                  {/* View Card Button - naive implementation based on bold text match */}
                  {msg.role === "assistant" && msg.content.includes("🏆 Best Card for This:**") && (
                     <button 
                       className="mt-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full px-4 py-1.5 text-xs font-semibold self-start transition-colors"
                       onClick={() => {
                          const pattern = new RegExp("\\*\\*🏆 Best Card for This:\\*\\* (.*?)\\n");
                          const match = msg.content.match(pattern);
                          if (match) {
                            // Quick scroll hack if on explore page
                            const el = document.evaluate(`//h3[contains(text(), "${match[1].trim()}")]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              setIsOpen(false);
                            } else {
                              window.location.href = '/explore';
                            }
                          }
                       }}
                     >
                       View Recommended Card
                     </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex mr-auto max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-10">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface border-t border-white/10">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                onKeyDown={handleKeyDown}
                placeholder={isShaking ? "Describe what you'd like to buy..." : "e.g. Book a flight for ₹2 lakhs..."}
                disabled={isLoading}
                className={clsx(
                  "w-full bg-white/5 border rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all",
                  isShaking ? "border-red-500/50 placeholder-red-400/50 animate-[shake_0.5s_ease-in-out]" : "border-white/10",
                  isLoading && "opacity-50"
                )}
                rows={2}
              />
              <div className="absolute right-3 bottom-3 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500">{input.length}/500</span>
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="p-1.5 bg-primary text-on-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-500">AI can make mistakes. Verify critical limits before spending.</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
