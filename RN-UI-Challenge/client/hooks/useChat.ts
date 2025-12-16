import { useState, useCallback, useRef } from "react";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { Business } from "@/hooks/useBusinesses";

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  businesses?: Business[];
  timestamp: Date;
}

interface CohereMessage {
  role: "user" | "assistant";
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationHistoryRef = useRef<CohereMessage[]>([]);
  const { profile } = useUserProfile();

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/chat", {
        message: content,
        conversationHistory: conversationHistoryRef.current,
        userProfile: {
          city: profile.city,
          dietaryRestrictions: profile.dietaryRestrictions,
          budgetRange: profile.budgetRange,
          preferredCuisines: profile.preferredCuisines,
          allergies: profile.allergies,
        },
      });

      const data = await response.json();
      
      if (data.conversationHistory) {
        conversationHistoryRef.current = data.conversationHistory;
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isUser: false,
        businesses: data.businesses,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationHistoryRef.current = [];
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
