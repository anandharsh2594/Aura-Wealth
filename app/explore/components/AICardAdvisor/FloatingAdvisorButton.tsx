"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useAdvisor } from "./AdvisorContext";

export default function FloatingAdvisorButton() {
  const { isOpen, setIsOpen } = useAdvisor();

  if (isOpen) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-full shadow-[0_4px_20px_rgba(242,202,80,0.3)] hover:shadow-[0_4px_25px_rgba(242,202,80,0.5)] hover:-translate-y-1 transition-all duration-300 group"
      aria-label="Ask AI Advisor"
    >
      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      <span className="font-heading font-semibold text-sm">Ask AI Advisor</span>
    </button>
  );
}
