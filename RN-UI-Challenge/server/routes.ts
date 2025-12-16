import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";

interface ChatRequest {
  message: string;
  conversationHistory?: CohereMessage[];
  userProfile: {
    city?: string;
    dietaryRestrictions?: Record<string, boolean>;
    budgetRange?: string;
    preferredCuisines?: string[];
    allergies?: string[];
  };
}

interface CohereMessage {
  role: "user" | "assistant";
  content: string;
}

async function callCohereAPI(
  message: string, 
  userProfile: ChatRequest["userProfile"],
  conversationHistory: CohereMessage[] = []
) {
  const apiKey = process.env.COHERE_API_KEY;
  const model = process.env.COHERE_MODEL || "command-r-08-2024";

  if (!apiKey) {
    throw new Error("COHERE_API_KEY not configured");
  }

  const dietaryPrefs = userProfile.dietaryRestrictions
    ? Object.entries(userProfile.dietaryRestrictions)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(", ")
    : "none specified";

  const systemPrompt = `You are CityWhisper, a friendly AI assistant that helps users discover restaurants, cafes, and attractions in their city. You provide personalized recommendations based on their dietary preferences and budget.

User Context:
- City: ${userProfile.city || "not specified"}
- Dietary Preferences: ${dietaryPrefs}
- Budget Range: ${userProfile.budgetRange || "moderate"}
- Preferred Cuisines: ${userProfile.preferredCuisines?.join(", ") || "open to all"}
- Allergies: ${userProfile.allergies?.join(", ") || "none"}

Guidelines:
- Be warm, helpful, and conversational
- Provide specific restaurant or cafe recommendations when asked
- Consider their dietary restrictions in all food recommendations
- Suggest budget-appropriate options
- When comparing places, highlight key differences
- For itinerary requests, organize by time of day
- Always be encouraging and helpful

Respond naturally as a local guide who knows the city well.`;

  const recentHistory = conversationHistory.slice(-10);
  
  const messages = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: message },
  ];

  try {
    const response = await fetch("https://api.cohere.ai/v2/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cohere API error:", response.status, errorText);
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.message?.content?.[0]?.text || "I apologize, but I couldn't process your request. Please try again.";

    return {
      message: assistantMessage,
      updatedHistory: [
        ...recentHistory,
        { role: "user" as const, content: message },
        { role: "assistant" as const, content: assistantMessage },
      ],
    };
  } catch (error) {
    console.error("Cohere API call failed:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, conversationHistory = [], userProfile } = req.body as ChatRequest;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const result = await callCohereAPI(message, userProfile, conversationHistory);

      res.json({
        message: result.message,
        conversationHistory: result.updatedHistory,
        businesses: [],
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({
        message: "I'm having trouble connecting right now. Please try again in a moment.",
        conversationHistory: [],
        businesses: [],
      });
    }
  });

  app.get("/api/businesses", async (req: Request, res: Response) => {
    const category = req.query.category as string || "food";
    
    res.json({
      businesses: [],
      category,
    });
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
