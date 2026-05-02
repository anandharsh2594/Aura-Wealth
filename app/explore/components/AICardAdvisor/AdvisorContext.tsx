"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdvisorContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openWithQuery: (query: string) => void;
  initialQuery: string;
  clearInitialQuery: () => void;
}

const AdvisorContext = createContext<AdvisorContextType | undefined>(undefined);

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const openWithQuery = (query: string) => {
    setInitialQuery(query);
    setIsOpen(true);
  };

  const clearInitialQuery = () => {
    setInitialQuery("");
  };

  return (
    <AdvisorContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openWithQuery,
        initialQuery,
        clearInitialQuery,
      }}
    >
      {children}
    </AdvisorContext.Provider>
  );
}

export function useAdvisor() {
  const context = useContext(AdvisorContext);
  if (context === undefined) {
    throw new Error("useAdvisor must be used within an AdvisorProvider");
  }
  return context;
}
