import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export interface ItineraryStop {
  id: string;
  time: string;
  title: string;
  description?: string;
  type: "breakfast" | "lunch" | "dinner" | "activity" | "transport";
  estimatedCost?: number;
  businessId?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  stops: ItineraryStop[];
}

export interface MultiDayItinerary {
  id?: string;
  title: string;
  description?: string;
  duration: number;
  city?: string;
  days: ItineraryDay[];
  totalBudget?: number;
  shareCode?: string;
  isPublic?: boolean;
}

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  (typeof window !== "undefined" && window.location?.origin) ||
  "http://localhost:5000";

const generateMockItinerary = (
  duration: number,
  style: string,
): MultiDayItinerary => {
  const days: ItineraryDay[] = [];

  const activities: Record<string, any[]> = {
    relaxed: [
      { type: "breakfast", title: "Leisurely Brunch", cost: 25 },
      { type: "activity", title: "Walking Tour", cost: 0 },
      { type: "lunch", title: "Cafe Lunch", cost: 18 },
      { type: "activity", title: "Museum Visit", cost: 15 },
      { type: "dinner", title: "Fine Dining", cost: 55 },
    ],
    adventure: [
      { type: "breakfast", title: "Quick Energy Breakfast", cost: 12 },
      { type: "activity", title: "Hiking Trail", cost: 5 },
      { type: "lunch", title: "Picnic Lunch", cost: 15 },
      { type: "activity", title: "Adventure Sports", cost: 75 },
      { type: "dinner", title: "Local Grill", cost: 35 },
    ],
    foodie: [
      { type: "breakfast", title: "Artisan Bakery", cost: 18 },
      { type: "activity", title: "Food Market Tour", cost: 25 },
      { type: "lunch", title: "Michelin Star Lunch", cost: 85 },
      { type: "activity", title: "Cooking Class", cost: 65 },
      { type: "dinner", title: "Chef's Table Experience", cost: 150 },
    ],
    budget: [
      { type: "breakfast", title: "Hostel Breakfast", cost: 5 },
      { type: "activity", title: "Free Walking Tour", cost: 0 },
      { type: "lunch", title: "Street Food", cost: 8 },
      { type: "activity", title: "Park Exploration", cost: 0 },
      { type: "dinner", title: "Budget-Friendly Eatery", cost: 12 },
    ],
  };

  const styleActivities = activities[style] || activities.relaxed;
  const times = ["8:00 AM", "10:30 AM", "12:30 PM", "3:00 PM", "7:00 PM"];

  for (let d = 1; d <= duration; d++) {
    const dayStops: ItineraryStop[] = styleActivities.map((act, index) => ({
      id: `${d}-${index}`,
      time: times[index],
      title: `Day ${d}: ${act.title}`,
      description: `${act.title} experience`,
      type: act.type,
      estimatedCost: act.cost,
    }));

    days.push({
      dayNumber: d,
      title: `Day ${d}`,
      stops: dayStops,
    });
  }

  return {
    title: `${duration}-Day ${style.charAt(0).toUpperCase() + style.slice(1)} Trip`,
    description: `A ${duration}-day itinerary designed for ${style} travelers`,
    duration,
    city: "Your City",
    days,
    isPublic: false,
  };
};

export function useMultiDayItinerary() {
  const [itinerary, setItinerary] = useState<MultiDayItinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<MultiDayItinerary[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const getUserId = async (): Promise<string> => {
    let userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      userId = `user_${Date.now()}`;
      await AsyncStorage.setItem("userId", userId);
    }
    return userId;
  };

  const generateItinerary = useCallback(
    async (duration: number, style: string) => {
      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const generated = generateMockItinerary(duration, style);
      setItinerary(generated);
      setIsLoading(false);
    },
    [],
  );

  const saveItinerary = useCallback(
    async (data: MultiDayItinerary): Promise<MultiDayItinerary> => {
      const userId = await getUserId();

      try {
        const response = await fetch(`${API_URL}/api/itineraries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title: data.title,
            description: data.description,
            duration: data.duration,
            city: data.city,
            stops: data.days,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save itinerary");
        }

        const result = await response.json();

        const saved = await AsyncStorage.getItem("savedItineraries");
        const savedList = saved ? JSON.parse(saved) : [];
        savedList.push({ ...data, id: result.itinerary.id });
        await AsyncStorage.setItem(
          "savedItineraries",
          JSON.stringify(savedList),
        );
        setSavedItineraries(savedList);

        return result.itinerary;
      } catch (error) {
        const saved = await AsyncStorage.getItem("savedItineraries");
        const savedList = saved ? JSON.parse(saved) : [];
        const newItinerary = { ...data, id: `local_${Date.now()}` };
        savedList.push(newItinerary);
        await AsyncStorage.setItem(
          "savedItineraries",
          JSON.stringify(savedList),
        );
        setSavedItineraries(savedList);
        return newItinerary;
      }
    },
    [],
  );

  const loadSavedItineraries = useCallback(async () => {
    try {
      const userId = await getUserId();
      const response = await fetch(`${API_URL}/api/itineraries/${userId}`);
      const data = await response.json();

      if (data.itineraries && data.itineraries.length > 0) {
        setSavedItineraries(data.itineraries);
      } else {
        const saved = await AsyncStorage.getItem("savedItineraries");
        if (saved) {
          setSavedItineraries(JSON.parse(saved));
        }
      }
    } catch (error) {
      const saved = await AsyncStorage.getItem("savedItineraries");
      if (saved) {
        setSavedItineraries(JSON.parse(saved));
      }
    }
  }, []);

  const exportItinerary = useCallback(
    async (id: string, format: "ics" | "text") => {
      try {
        const response = await fetch(`${API_URL}/api/itinerary/${id}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format }),
        });

        if (!response.ok) {
          throw new Error("Failed to export itinerary");
        }

        return await response.text();
      } catch (error) {
        console.error("Export failed:", error);
        throw error;
      }
    },
    [],
  );

  const shareItinerary = useCallback(
    async (data: MultiDayItinerary): Promise<string> => {
      if (data.shareCode) {
        return data.shareCode;
      }
      let id = data.id;
      if (!id) {
        const saved = await saveItinerary(data);
        id = saved.id;
      }
      const response = await fetch(`${API_URL}/api/itinerary/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to publish itinerary");
      }
      const result = await response.json();
      return result.shareCode;
    },
    [],
  );

  return {
    itinerary,
    savedItineraries,
    isLoading,
    generateItinerary,
    saveItinerary,
    loadSavedItineraries,
    exportItinerary,
    shareItinerary,
  };
}
