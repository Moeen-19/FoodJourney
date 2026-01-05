import { useState, useEffect } from "react";
import type { Business } from "@/hooks/useBusinesses";

const studentCategories: Record<string, Business[]> = {
  cheap: [
    {
      id: "6",
      name: "Taco Express",
      imageUrl:
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
      rating: 4.3,
      reviewCount: 567,
      priceLevel: "$",
      categories: ["Mexican", "Fast Casual"],
      dietaryTags: ["Budget-Friendly", "Quick"],
      address: "999 Budget Lane",
      distance: "0.1 mi",
    },
    {
      id: "7",
      name: "Noodle House",
      imageUrl:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
      rating: 4.5,
      reviewCount: 234,
      priceLevel: "$",
      categories: ["Chinese", "Noodles"],
      dietaryTags: ["Vegetarian Options", "Budget-Friendly"],
      address: "777 Cheap Eats Road",
      distance: "0.3 mi",
    },
    {
      id: "10",
      name: "Pizza Corner",
      imageUrl:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
      rating: 4.2,
      reviewCount: 345,
      priceLevel: "$",
      categories: ["Pizza", "Italian"],
      dietaryTags: ["Student Discount", "Quick"],
      address: "456 College Ave",
      distance: "0.2 mi",
    },
  ],
  study: [
    {
      id: "5",
      name: "The Study Corner",
      imageUrl:
        "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400",
      rating: 4.4,
      reviewCount: 89,
      priceLevel: "$",
      categories: ["Coffee", "Bakery"],
      dietaryTags: ["Quiet", "WiFi", "Outlets"],
      address: "555 University Ave",
      distance: "0.4 mi",
    },
    {
      id: "8",
      name: "Library Cafe",
      imageUrl:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
      rating: 4.2,
      reviewCount: 156,
      priceLevel: "$",
      categories: ["Cafe", "Quiet Space"],
      dietaryTags: ["Study-Friendly", "WiFi"],
      address: "123 Library Lane",
      distance: "0.6 mi",
    },
    {
      id: "11",
      name: "Campus Beans",
      imageUrl:
        "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400",
      rating: 4.3,
      reviewCount: 78,
      priceLevel: "$",
      categories: ["Coffee", "Study Space"],
      dietaryTags: ["24-Hour WiFi", "Quiet Hours"],
      address: "100 Campus Center",
      distance: "0.1 mi",
    },
  ],
  latenight: [
    {
      id: "6",
      name: "Taco Express",
      imageUrl:
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
      rating: 4.3,
      reviewCount: 567,
      priceLevel: "$",
      categories: ["Mexican", "Fast Casual"],
      dietaryTags: ["Open Late", "Quick Service"],
      address: "999 Budget Lane",
      distance: "0.1 mi",
    },
    {
      id: "12",
      name: "24-Hour Diner",
      imageUrl:
        "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=400",
      rating: 4.0,
      reviewCount: 234,
      priceLevel: "$",
      categories: ["American", "Diner"],
      dietaryTags: ["Always Open", "Late Night"],
      address: "222 Night Owl Drive",
      distance: "0.5 mi",
    },
  ],
  grocery: [
    {
      id: "13",
      name: "Fresh Mart",
      imageUrl:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
      rating: 4.1,
      reviewCount: 89,
      priceLevel: "$",
      categories: ["Grocery", "Organic"],
      dietaryTags: ["Student Discount", "Organic Options"],
      address: "789 Market Street",
      distance: "0.3 mi",
    },
    {
      id: "14",
      name: "Budget Foods",
      imageUrl:
        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400",
      rating: 3.9,
      reviewCount: 156,
      priceLevel: "$",
      categories: ["Grocery", "Discount"],
      dietaryTags: ["Best Prices", "Bulk Options"],
      address: "456 Savings Ave",
      distance: "0.7 mi",
    },
  ],
};

export function useStudentMode() {
  const [selectedCategory, setSelectedCategory] = useState("cheap");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setBusinesses(studentCategories[selectedCategory] || []);
      setIsLoading(false);
    };

    fetchBusinesses();
  }, [selectedCategory]);

  return {
    selectedCategory,
    setSelectedCategory,
    businesses,
    isLoading,
  };
}
