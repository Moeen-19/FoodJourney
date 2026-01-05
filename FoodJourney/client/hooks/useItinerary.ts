import { useState, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

export interface ItineraryStop {
  id: string;
  time: string;
  title: string;
  description?: string;
  type: "breakfast" | "lunch" | "dinner" | "activity" | "transport";
  price?: number;
  businessId?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const mockItineraries: Record<string, ItineraryStop[]> = {
  day: [
    {
      id: "1",
      time: "8:00 AM",
      title: "Breakfast at Brew & Bean",
      description: "Start your day with artisan coffee and fresh pastries",
      type: "breakfast",
      price: 12,
      businessId: "4",
    },
    {
      id: "2",
      time: "10:00 AM",
      title: "Explore Downtown Market",
      description: "Browse local vendors and street food",
      type: "activity",
      price: 0,
    },
    {
      id: "3",
      time: "12:30 PM",
      title: "Lunch at The Green Garden",
      description: "Healthy vegetarian cuisine with organic ingredients",
      type: "lunch",
      price: 18,
      businessId: "1",
    },
    {
      id: "4",
      time: "2:00 PM",
      title: "Visit Art Museum",
      description: "Contemporary art exhibits and installations",
      type: "activity",
      price: 15,
    },
    {
      id: "5",
      time: "5:00 PM",
      title: "Coffee Break at The Study Corner",
      description: "Relax and recharge with a latte",
      type: "activity",
      price: 6,
      businessId: "5",
    },
    {
      id: "6",
      time: "7:00 PM",
      title: "Dinner at Spice Route",
      description: "Authentic Indian flavors with modern presentation",
      type: "dinner",
      price: 35,
      businessId: "2",
    },
  ],
  meals: [
    {
      id: "1",
      time: "8:00 AM",
      title: "Breakfast at Brew & Bean",
      description: "Artisan coffee and avocado toast",
      type: "breakfast",
      price: 15,
      businessId: "4",
    },
    {
      id: "2",
      time: "12:00 PM",
      title: "Lunch at Noodle House",
      description: "Handmade noodles and dumplings",
      type: "lunch",
      price: 14,
      businessId: "7",
    },
    {
      id: "3",
      time: "7:00 PM",
      title: "Dinner at Sakura Japanese",
      description: "Omakase experience with fresh sushi",
      type: "dinner",
      price: 65,
      businessId: "3",
    },
  ],
  evening: [
    {
      id: "1",
      time: "6:00 PM",
      title: "Happy Hour at Night Owl Lounge",
      description: "Craft cocktails and appetizers",
      type: "activity",
      price: 25,
      businessId: "9",
    },
    {
      id: "2",
      time: "7:30 PM",
      title: "Dinner at Spice Route",
      description: "Curry and naan to share",
      type: "dinner",
      price: 30,
      businessId: "2",
    },
    {
      id: "3",
      time: "9:30 PM",
      title: "Dessert Walk",
      description: "Explore night markets and street food",
      type: "activity",
      price: 10,
    },
  ],
  weekend: [
    {
      id: "1",
      time: "10:00 AM",
      title: "Brunch at The Green Garden",
      description: "Leisurely weekend brunch with mimosas",
      type: "breakfast",
      price: 25,
      businessId: "1",
    },
    {
      id: "2",
      time: "1:00 PM",
      title: "Farmers Market",
      description: "Fresh produce and local crafts",
      type: "activity",
      price: 20,
    },
    {
      id: "3",
      time: "3:00 PM",
      title: "Coffee at Library Cafe",
      description: "Read a book with a latte",
      type: "activity",
      price: 8,
      businessId: "8",
    },
    {
      id: "4",
      time: "6:00 PM",
      title: "Dinner at Sakura Japanese",
      description: "Weekend omakase special",
      type: "dinner",
      price: 75,
      businessId: "3",
    },
  ],
};

export function useItinerary() {
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useUserProfile();

  const generateItinerary = useCallback(
    async (type: string) => {
      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      let stops = mockItineraries[type] || mockItineraries.day;

      if (profile.budgetRange === "low") {
        stops = stops.map((stop) => ({
          ...stop,
          price: stop.price ? Math.round(stop.price * 0.7) : undefined,
        }));
      }

      setItinerary(stops);
      setIsLoading(false);
    },
    [profile],
  );

  const totalBudget = itinerary.reduce(
    (sum, stop) => sum + (stop.price || 0),
    0,
  );

  return {
    itinerary,
    isLoading,
    generateItinerary,
    totalBudget,
  };
}
