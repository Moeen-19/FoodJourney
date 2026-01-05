import { useState, useEffect } from "react";
import type { Business } from "@/hooks/useBusinesses";

const mockBusinessDetails: Record<string, Business> = {
  "1": {
    id: "1",
    name: "The Green Garden",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    rating: 4.5,
    reviewCount: 234,
    priceLevel: "$$",
    categories: ["Vegetarian", "Healthy", "Organic"],
    dietaryTags: ["Vegan-Friendly", "Gluten-Free Options", "Organic"],
    address: "123 Main Street, Downtown",
    distance: "0.3 mi",
    coordinates: { latitude: 40.7128, longitude: -74.006 },
    phone: "+1 (555) 123-4567",
    hours: "Open until 10 PM",
  },
  "2": {
    id: "2",
    name: "Spice Route",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    rating: 4.7,
    reviewCount: 456,
    priceLevel: "$$$",
    categories: ["Indian", "Asian Fusion", "Fine Dining"],
    dietaryTags: ["Halal", "Vegetarian Options"],
    address: "456 Oak Avenue, Midtown",
    distance: "0.5 mi",
    coordinates: { latitude: 40.7148, longitude: -74.008 },
    phone: "+1 (555) 234-5678",
    hours: "Open until 11 PM",
  },
  "3": {
    id: "3",
    name: "Sakura Japanese",
    imageUrl:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
    rating: 4.8,
    reviewCount: 789,
    priceLevel: "$$$",
    categories: ["Japanese", "Sushi", "Fine Dining"],
    dietaryTags: ["Fresh Seafood", "Omakase"],
    address: "789 Cherry Lane, Uptown",
    distance: "0.8 mi",
    coordinates: { latitude: 40.7168, longitude: -74.01 },
    phone: "+1 (555) 345-6789",
    hours: "Open until 9 PM",
  },
  "4": {
    id: "4",
    name: "Brew & Bean",
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
    rating: 4.6,
    reviewCount: 123,
    priceLevel: "$",
    categories: ["Coffee", "Cafe", "Breakfast"],
    dietaryTags: ["Dairy-Free Options", "WiFi"],
    address: "321 Coffee Street, Arts District",
    distance: "0.2 mi",
    coordinates: { latitude: 40.7138, longitude: -74.007 },
    phone: "+1 (555) 456-7890",
    hours: "Open until 8 PM",
  },
  "5": {
    id: "5",
    name: "The Study Corner",
    imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800",
    rating: 4.4,
    reviewCount: 89,
    priceLevel: "$",
    categories: ["Coffee", "Bakery", "Study Spot"],
    dietaryTags: ["Quiet Atmosphere", "WiFi", "Power Outlets"],
    address: "555 University Ave, Campus Area",
    distance: "0.4 mi",
    coordinates: { latitude: 40.7158, longitude: -74.009 },
    phone: "+1 (555) 567-8901",
    hours: "Open until 11 PM",
  },
  "6": {
    id: "6",
    name: "Taco Express",
    imageUrl:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    rating: 4.3,
    reviewCount: 567,
    priceLevel: "$",
    categories: ["Mexican", "Fast Casual", "Late Night"],
    dietaryTags: ["Budget-Friendly", "Quick Service"],
    address: "999 Budget Lane, Student Quarter",
    distance: "0.1 mi",
    coordinates: { latitude: 40.7118, longitude: -74.005 },
    phone: "+1 (555) 678-9012",
    hours: "Open until 12 AM",
  },
  "7": {
    id: "7",
    name: "Noodle House",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
    rating: 4.5,
    reviewCount: 234,
    priceLevel: "$",
    categories: ["Chinese", "Noodles", "Comfort Food"],
    dietaryTags: ["Vegetarian Options", "Budget-Friendly"],
    address: "777 Cheap Eats Road, Chinatown",
    distance: "0.3 mi",
    coordinates: { latitude: 40.7108, longitude: -74.004 },
    phone: "+1 (555) 789-0123",
    hours: "Open until 10 PM",
  },
  "8": {
    id: "8",
    name: "Library Cafe",
    imageUrl:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800",
    rating: 4.2,
    reviewCount: 156,
    priceLevel: "$",
    categories: ["Cafe", "Quiet Space", "Study Spot"],
    dietaryTags: ["Study-Friendly", "WiFi", "Quiet"],
    address: "123 Library Lane, University District",
    distance: "0.6 mi",
    coordinates: { latitude: 40.7178, longitude: -74.011 },
    phone: "+1 (555) 890-1234",
    hours: "Open until 10 PM",
  },
  "9": {
    id: "9",
    name: "Night Owl Lounge",
    imageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    rating: 4.1,
    reviewCount: 345,
    priceLevel: "$$",
    categories: ["Bar", "Lounge", "Live Music"],
    dietaryTags: ["Late Night", "Weekend Vibes"],
    address: "888 Night Street, Entertainment District",
    distance: "0.7 mi",
    coordinates: { latitude: 40.7188, longitude: -74.012 },
    phone: "+1 (555) 901-2345",
    hours: "Open until 2 AM",
  },
};

export function useBusinessDetail(businessId: string) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const detail = mockBusinessDetails[businessId];
      setBusiness(detail || null);
      setIsLoading(false);
    };

    fetchDetail();
  }, [businessId]);

  return {
    business,
    isLoading,
  };
}
