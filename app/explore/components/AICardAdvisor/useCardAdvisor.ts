import { useState, useEffect, useCallback } from "react";
import cardsData from "../../data/cardsData";
import { enrichMessage, buildSystemPrompt } from "./utils";

export type MessageRole = "user" | "assistant" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  contextTags?: string[];
}

interface ChatSession {
  messages: ChatMessage[];
  lastUpdated: number;
}

export function useCardAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTags, setSessionTags] = useState<string[]>([]);
  const [showSessionToast, setShowSessionToast] = useState(false);

  // Load session on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("cardAdvisorSession");
      if (saved) {
        const session: ChatSession = JSON.parse(saved);
        if (session.messages.length >= 2) {
          setShowSessionToast(true);
        }
      }
    } catch (e) {
      console.error("Failed to load session", e);
    }
  }, []);

  const restoreSession = () => {
    try {
      const saved = sessionStorage.getItem("cardAdvisorSession");
      if (saved) {
        const session: ChatSession = JSON.parse(saved);
        setMessages(session.messages);
        
        // Extract tags from history
        const tags = new Set<string>();
        session.messages.forEach(m => {
          if (m.contextTags) m.contextTags.forEach(t => tags.add(t));
        });
        setSessionTags(Array.from(tags).slice(0, 3));
      }
    } catch (e) {}
    setShowSessionToast(false);
  };

  const clearSession = () => {
    setMessages([]);
    setSessionTags([]);
    sessionStorage.removeItem("cardAdvisorSession");
    setShowSessionToast(false);
  };

  // Save session when messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("cardAdvisorSession", JSON.stringify({
        messages,
        lastUpdated: Date.now()
      }));
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const { enrichedMessage, tags } = enrichMessage(content);
    
    // Update session tags
    if (tags.length > 0) {
      setSessionTags(prev => {
        const newTags = Array.from(new Set([...prev, ...tags])).slice(-3);
        return newTags;
      });
    }

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content, // Display original, not enriched
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contextTags: tags
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(cardsData);

      // Prepare a single 'contents' array with system prompt as the first user message.
      // This is the most compatible way across all Gemini versions/models.
      const contents = [
        { 
          role: "user", 
          parts: [{ text: `SYSTEM INSTRUCTIONS: ${systemPrompt}\n\nUser Question: ${enrichedMessage}` }] 
        }
      ];

      // Add a few previous messages for context if they exist
      if (messages.length > 0) {
        const history = messages.slice(-6)
          .filter(m => m.role !== "error")
          .map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }));
        
        // Replace the simple contents with the full history
        // but ensure the FIRST message has the system prompt
        contents.length = 0;
        contents.push(
          { role: "user", parts: [{ text: `SYSTEM INSTRUCTIONS: ${systemPrompt}` }] },
          { role: "model", parts: [{ text: "Understood. I will provide expert Indian credit card recommendations based strictly on your card database." }] },
          ...history,
          { role: "user", parts: [{ text: enrichedMessage }] }
        );
      }

      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "AI request failed");
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error("Empty response from AI");
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      
      let errorMessage = "Couldn't reach the AI advisor right now. Please try again in a moment.";
      if (error?.message && error.message.includes("AI Failed")) {
        errorMessage = `API Configuration Issue:\n${error.message}`;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "error",
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sessionTags,
    showSessionToast,
    sendMessage,
    restoreSession,
    clearSession,
    setShowSessionToast
  };
}
