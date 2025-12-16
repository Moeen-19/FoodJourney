import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { db } from "./db";
import { businesses, itineraryDays, itineraryStops, reservations } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { seedDatabase } from "./seed";

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

function generateBudgetRecommendations(transactions: any[], totalSpent: number): string[] {
  const recommendations: string[] = [];
  
  if (totalSpent > 500) {
    recommendations.push("Consider meal prepping on weekends to save on weekday dining costs");
  }
  if (totalSpent > 300) {
    recommendations.push("Try happy hour specials for dining out savings");
  }
  recommendations.push("Your top spending category suggests exploring budget-friendly alternatives in that area");
  recommendations.push("Set a weekly dining budget to better track your food expenses");
  
  return recommendations;
}

export async function registerRoutes(app: Express): Promise<Server> {
  await seedDatabase();

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
    try {
      const category = req.query.category as string;
      const city = req.query.city as string;
      const businessList = await storage.getBusinesses(category, city);
      res.json({ businesses: businessList, category });
    } catch (error) {
      console.error("Get businesses error:", error);
      res.json({ businesses: [], category: req.query.category });
    }
  });

  app.get("/api/businesses/:id", async (req: Request, res: Response) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Get business error:", error);
      res.status(500).json({ error: "Failed to fetch business" });
    }
  });

  app.post("/api/reservations", async (req: Request, res: Response) => {
    try {
      const { userId, businessId, date, partySize, specialRequests } = req.body;
      
      if (!businessId || !date || !partySize) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const reservation = await storage.createReservation({
        userId,
        businessId,
        date: new Date(date),
        partySize,
        specialRequests,
      });

      res.json({ 
        success: true, 
        reservation,
        message: `Reservation confirmed for ${partySize} guests!`
      });
    } catch (error) {
      console.error("Create reservation error:", error);
      res.status(500).json({ error: "Failed to create reservation" });
    }
  });

  app.get("/api/reservations/:userId", async (req: Request, res: Response) => {
    try {
      const reservations = await storage.getReservations(req.params.userId);
      res.json({ reservations });
    } catch (error) {
      console.error("Get reservations error:", error);
      res.json({ reservations: [] });
    }
  });

  app.patch("/api/reservations/:id/cancel", async (req: Request, res: Response) => {
    try {
      const reservation = await storage.cancelReservation(req.params.id);
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json({ success: true, reservation });
    } catch (error) {
      console.error("Cancel reservation error:", error);
      res.status(500).json({ error: "Failed to cancel reservation" });
    }
  });

  app.get("/api/reservations/:businessId/availability", async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const businessId = req.params.businessId;
      const requestedDate = date ? new Date(date as string) : new Date();
      
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingReservations = await db.select()
        .from(reservations)
        .where(and(
          eq(reservations.businessId, businessId),
          gte(reservations.date, startOfDay),
          lte(reservations.date, endOfDay),
          eq(reservations.status, 'confirmed')
        ));

      const bookedTimes = existingReservations.map(r => {
        const d = new Date(r.date);
        return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
      });

      const allSlots = [
        { time: "11:00 AM", hour: 11, minute: 0 },
        { time: "11:30 AM", hour: 11, minute: 30 },
        { time: "12:00 PM", hour: 12, minute: 0 },
        { time: "12:30 PM", hour: 12, minute: 30 },
        { time: "1:00 PM", hour: 13, minute: 0 },
        { time: "5:00 PM", hour: 17, minute: 0 },
        { time: "5:30 PM", hour: 17, minute: 30 },
        { time: "6:00 PM", hour: 18, minute: 0 },
        { time: "6:30 PM", hour: 18, minute: 30 },
        { time: "7:00 PM", hour: 19, minute: 0 },
        { time: "7:30 PM", hour: 19, minute: 30 },
        { time: "8:00 PM", hour: 20, minute: 0 },
        { time: "8:30 PM", hour: 20, minute: 30 },
      ];

      const slots = allSlots.map(slot => {
        const timeKey = `${slot.hour}:${slot.minute.toString().padStart(2, '0')}`;
        const reservationCount = bookedTimes.filter(t => t === timeKey).length;
        return {
          time: slot.time,
          available: reservationCount < 5,
        };
      });

      res.json({ date: requestedDate.toISOString(), slots, businessId });
    } catch (error) {
      console.error("Get availability error:", error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  app.post("/api/itineraries", async (req: Request, res: Response) => {
    try {
      const { userId, title, description, duration, city, stops } = req.body;
      
      const totalBudget = stops?.reduce((sum: number, day: any) => 
        sum + (day.stops?.reduce((daySum: number, stop: any) => daySum + (stop.estimatedCost || 0), 0) || 0), 0
      ) || 0;

      const itinerary = await storage.createItinerary({
        userId,
        title,
        description,
        duration,
        city,
        totalBudget: String(totalBudget),
      });

      if (stops && itinerary) {
        for (let i = 0; i < stops.length; i++) {
          const dayData = stops[i];
          const [day] = await db.insert(itineraryDays)
            .values({
              itineraryId: itinerary.id,
              dayNumber: i + 1,
              title: dayData.title || `Day ${i + 1}`,
            })
            .returning();

          if (dayData.stops && day) {
            for (let j = 0; j < dayData.stops.length; j++) {
              const stopData = dayData.stops[j];
              await db.insert(itineraryStops).values({
                dayId: day.id,
                businessId: stopData.businessId,
                time: stopData.time,
                title: stopData.title,
                description: stopData.description,
                type: stopData.type,
                estimatedCost: String(stopData.estimatedCost || 0),
                orderIndex: j,
              });
            }
          }
        }
      }

      res.json({ success: true, itinerary });
    } catch (error) {
      console.error("Create itinerary error:", error);
      res.status(500).json({ error: "Failed to create itinerary" });
    }
  });

  app.get("/api/itineraries/:userId", async (req: Request, res: Response) => {
    try {
      const itinerariesList = await storage.getItineraries(req.params.userId);
      res.json({ itineraries: itinerariesList });
    } catch (error) {
      console.error("Get itineraries error:", error);
      res.json({ itineraries: [] });
    }
  });

  app.get("/api/itinerary/:id", async (req: Request, res: Response) => {
    try {
      const itinerary = await storage.getItineraryById(req.params.id);
      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }

      const days = await db.select().from(itineraryDays)
        .where(eq(itineraryDays.itineraryId, itinerary.id));

      const daysWithStops = await Promise.all(days.map(async (day) => {
        const stops = await db.select().from(itineraryStops)
          .where(eq(itineraryStops.dayId, day.id));
        return { ...day, stops };
      }));

      res.json({ ...itinerary, days: daysWithStops });
    } catch (error) {
      console.error("Get itinerary error:", error);
      res.status(500).json({ error: "Failed to fetch itinerary" });
    }
  });

  app.get("/api/itinerary/share/:code", async (req: Request, res: Response) => {
    try {
      const itinerary = await storage.getItineraryByShareCode(req.params.code);
      if (!itinerary || !itinerary.isPublic) {
        return res.status(404).json({ error: "Itinerary not found or not shared" });
      }
      res.json(itinerary);
    } catch (error) {
      console.error("Get shared itinerary error:", error);
      res.status(500).json({ error: "Failed to fetch shared itinerary" });
    }
  });

  app.post("/api/itinerary/:id/export", async (req: Request, res: Response) => {
    try {
      const { format } = req.body;
      const itinerary = await storage.getItineraryById(req.params.id);
      
      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }

      const days = await db.select().from(itineraryDays)
        .where(eq(itineraryDays.itineraryId, itinerary.id));

      const daysWithStops = await Promise.all(days.map(async (day) => {
        const stops = await db.select().from(itineraryStops)
          .where(eq(itineraryStops.dayId, day.id));
        return { ...day, stops };
      }));

      if (format === 'ics') {
        let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CityWhisper//Itinerary//EN\n`;
        daysWithStops.forEach((day, dayIndex) => {
          day.stops.forEach((stop) => {
            const eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + dayIndex);
            const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            icsContent += `BEGIN:VEVENT\nDTSTART:${dateStr}\nSUMMARY:${stop.title}\nDESCRIPTION:${stop.description || ''}\nEND:VEVENT\n`;
          });
        });
        icsContent += 'END:VCALENDAR';
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="${itinerary.title}.ics"`);
        return res.send(icsContent);
      }

      let textContent = `${itinerary.title}\n${'='.repeat(50)}\n\n`;
      textContent += `${itinerary.description || ''}\n\n`;
      textContent += `Duration: ${itinerary.duration} days\n`;
      textContent += `City: ${itinerary.city || 'Not specified'}\n`;
      textContent += `Estimated Budget: $${itinerary.totalBudget || 0}\n\n`;
      
      daysWithStops.forEach((day) => {
        textContent += `\n--- ${day.title || `Day ${day.dayNumber}`} ---\n\n`;
        day.stops.forEach((stop) => {
          textContent += `${stop.time} - ${stop.title}\n`;
          if (stop.description) textContent += `   ${stop.description}\n`;
          if (stop.estimatedCost) textContent += `   Estimated: $${stop.estimatedCost}\n`;
          textContent += '\n';
        });
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${itinerary.title}.txt"`);
      return res.send(textContent);
    } catch (error) {
      console.error("Export itinerary error:", error);
      res.status(500).json({ error: "Failed to export itinerary" });
    }
  });

  app.post("/api/budget/transaction", async (req: Request, res: Response) => {
    try {
      const { userId, businessId, amount, category, description, type } = req.body;
      
      if (!userId || !amount || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const transaction = await storage.addBudgetTransaction({
        userId,
        businessId,
        amount: String(amount),
        category,
        description,
        type: type || 'expense',
      });

      res.json({ success: true, transaction });
    } catch (error) {
      console.error("Add transaction error:", error);
      res.status(500).json({ error: "Failed to add transaction" });
    }
  });

  app.get("/api/budget/:userId", async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const transactions = await storage.getBudgetHistory(req.params.userId, days);
      
      const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      const categoryBreakdown: Record<string, number> = {};
      
      transactions.forEach(t => {
        const cat = t.category || 'Other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + parseFloat(t.amount || '0');
      });

      const recommendations = generateBudgetRecommendations(transactions, totalSpent);

      res.json({
        transactions,
        summary: {
          totalSpent,
          categoryBreakdown,
          averagePerDay: totalSpent / days,
          transactionCount: transactions.length,
        },
        recommendations,
      });
    } catch (error) {
      console.error("Get budget history error:", error);
      res.json({ transactions: [], summary: { totalSpent: 0, categoryBreakdown: {} }, recommendations: [] });
    }
  });

  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      const { userId, businessId } = req.body;
      
      if (!userId || !businessId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const favorite = await storage.addFavorite(userId, businessId);
      res.json({ success: true, favorite });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites", async (req: Request, res: Response) => {
    try {
      const { userId, businessId } = req.body;
      await storage.removeFavorite(userId, businessId);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/:userId", async (req: Request, res: Response) => {
    try {
      const favoritesList = await storage.getFavorites(req.params.userId);
      res.json({ favorites: favoritesList });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.json({ favorites: [] });
    }
  });

  app.get("/api/friends/:userId", async (req: Request, res: Response) => {
    try {
      const friendsList = await storage.getFriends(req.params.userId);
      res.json({ friends: friendsList });
    } catch (error) {
      console.error("Get friends error:", error);
      res.json({ friends: [] });
    }
  });

  app.post("/api/friends", async (req: Request, res: Response) => {
    try {
      const { userId, friendId } = req.body;
      await storage.addFriend(userId, friendId);
      res.json({ success: true });
    } catch (error) {
      console.error("Add friend error:", error);
      res.status(500).json({ error: "Failed to add friend" });
    }
  });

  app.get("/api/cache/snapshot", async (req: Request, res: Response) => {
    try {
      const allBusinesses = await storage.getBusinesses();
      res.json({
        version: Date.now(),
        businesses: allBusinesses,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get cache snapshot error:", error);
      res.json({ version: 0, businesses: [], timestamp: new Date().toISOString() });
    }
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
