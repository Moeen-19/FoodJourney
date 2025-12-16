import { useState, useEffect, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

export interface Business {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  categories: string[];
  dietaryTags?: string[];
  address: string;
  distance: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  hours?: string;
}

const mockBusinesses: Record<string, Business[]> = {
  food: [
    {
      id: "1",
      name: "The Green Garden",
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
      rating: 4.5,
      reviewCount: 234,
      priceLevel: "$$",
      categories: ["Vegetarian", "Healthy"],
      dietaryTags: ["Vegan-Friendly", "Gluten-Free Options"],
      address: "123 Main Street",
      distance: "0.3 mi",
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      phone: "+1 (555) 123-4567",
      hours: "Open until 10 PM",
    },
    {
      id: "2",
      name: "Spice Route",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      rating: 4.7,
      reviewCount: 456,
      priceLevel: "$$$",
      categories: ["Indian", "Asian Fusion"],
      dietaryTags: ["Halal", "Vegetarian Options"],
      address: "456 Oak Avenue",
      distance: "0.5 mi",
      coordinates: { latitude: 40.7148, longitude: -74.0080 },
      phone: "+1 (555) 234-5678",
      hours: "Open until 11 PM",
    },
    {
      id: "3",
      name: "Sakura Japanese",
      imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
      rating: 4.8,
      reviewCount: 789,
      priceLevel: "$$$",
      categories: ["Japanese", "Sushi"],
      dietaryTags: ["Fresh Seafood"],
      address: "789 Cherry Lane",
      distance: "0.8 mi",
      coordinates: { latitude: 40.7168, longitude: -74.0100 },
      phone: "+1 (555) 345-6789",
      hours: "Open until 9 PM",
    },
  ],
  coffee: [
    {
      id: "4",
      name: "Brew & Bean",
      imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
      rating: 4.6,
      reviewCount: 123,
      priceLevel: "$",
      categories: ["Coffee", "Cafe"],
      dietaryTags: ["Dairy-Free Options"],
      address: "321 Coffee Street",
      distance: "0.2 mi",
      coordinates: { latitude: 40.7138, longitude: -74.0070 },
      phone: "+1 (555) 456-7890",
      hours: "Open until 8 PM",
    },
    {
      id: "5",
      name: "The Study Corner",
      imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400",
      rating: 4.4,
      reviewCount: 89,
      priceLevel: "$",
      categories: ["Coffee", "Bakery"],
      dietaryTags: ["Quiet Atmosphere"],
      address: "555 University Ave",
      distance: "0.4 mi",
      coordinates: { latitude: 40.7158, longitude: -74.0090 },
      phone: "+1 (555) 567-8901",
      hours: "Open until 11 PM",
    },
  ],
  cheap: [
    {
      id: "6",
      name: "Taco Express",
      imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
      rating: 4.3,
      reviewCount: 567,
      priceLevel: "$",
      categories: ["Mexican", "Fast Casual"],
      dietaryTags: ["Budget-Friendly"],
      address: "999 Budget Lane",
      distance: "0.1 mi",
      coordinates: { latitude: 40.7118, longitude: -74.0050 },
      phone: "+1 (555) 678-9012",
      hours: "Open until 12 AM",
    },
    {
      id: "7",
      name: "Noodle House",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
      rating: 4.5,
      reviewCount: 234,
      priceLevel: "$",
      categories: ["Chinese", "Noodles"],
      dietaryTags: ["Vegetarian Options", "Budget-Friendly"],
      address: "777 Cheap Eats Road",
      distance: "0.3 mi",
      coordinates: { latitude: 40.7108, longitude: -74.0040 },
      phone: "+1 (555) 789-0123",
      hours: "Open until 10 PM",
    },
  ],
  study: [
    {
      id: "5",
      name: "The Study Corner",
      imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400",
      rating: 4.4,
      reviewCount: 89,
      priceLevel: "$",
      categories: ["Coffee", "Bakery"],
      dietaryTags: ["Quiet", "WiFi"],
      address: "555 University Ave",
      distance: "0.4 mi",
      coordinates: { latitude: 40.7158, longitude: -74.0090 },
      phone: "+1 (555) 567-8901",
      hours: "Open until 11 PM",
    },
    {
      id: "8",
      name: "Library Cafe",
      imageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
      rating: 4.2,
      reviewCount: 156,
      priceLevel: "$",
      categories: ["Cafe", "Quiet Space"],
      dietaryTags: ["Study-Friendly", "WiFi"],
      address: "123 Library Lane",
      distance: "0.6 mi",
      coordinates: { latitude: 40.7178, longitude: -74.0110 },
      phone: "+1 (555) 890-1234",
      hours: "Open until 10 PM",
    },
  ],
  nightlife: [
    {
      id: "9",
      name: "Night Owl Lounge",
      imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
      rating: 4.1,
      reviewCount: 345,
      priceLevel: "$$",
      categories: ["Bar", "Lounge"],
      dietaryTags: ["Late Night"],
      address: "888 Night Street",
      distance: "0.7 mi",
      coordinates: { latitude: 40.7188, longitude: -74.0120 },
      phone: "+1 (555) 901-2345",
      hours: "Open until 2 AM",
    },
  ],
};

export function useBusinesses(category: string) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useUserProfile();

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let results = mockBusinesses[category] || mockBusinesses.food;
    
    if (profile.dietaryRestrictions.vegan) {
      results = results.filter(b => 
        b.dietaryTags?.some(tag => tag.toLowerCase().includes("vegan")) ||
        b.categories.some(cat => cat.toLowerCase().includes("vegetarian"))
      );
    }
    
    setBusinesses(results);
    setIsLoading(false);
  }, [category, profile]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return {
    businesses,
    isLoading,
    refresh: fetchBusinesses,
  };
}
