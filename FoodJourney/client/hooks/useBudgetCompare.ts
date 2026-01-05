import { useState, useEffect } from "react";

interface EatOutOption {
  price: number;
  time: string;
  calories: number;
  convenience: string;
}

interface CookAtHomeOption {
  price: number;
  time: string;
  calories: number;
  ingredients: string[];
  recipe?: {
    name: string;
    steps: string[];
  };
}

const mockComparisons: Record<
  string,
  { eatOut: EatOutOption; cookAtHome: CookAtHomeOption }
> = {
  "1": {
    eatOut: {
      price: 22,
      time: "15 min (travel + order)",
      calories: 650,
      convenience: "Very High",
    },
    cookAtHome: {
      price: 8,
      time: "35 min",
      calories: 480,
      ingredients: [
        "Mixed greens",
        "Avocado",
        "Chickpeas",
        "Tahini dressing",
        "Quinoa",
      ],
      recipe: {
        name: "Buddha Bowl",
        steps: [
          "Cook quinoa",
          "Prepare vegetables",
          "Make tahini dressing",
          "Assemble bowl",
        ],
      },
    },
  },
  "2": {
    eatOut: {
      price: 28,
      time: "20 min (travel + order)",
      calories: 850,
      convenience: "High",
    },
    cookAtHome: {
      price: 12,
      time: "45 min",
      calories: 720,
      ingredients: [
        "Basmati rice",
        "Chicken thighs",
        "Curry paste",
        "Coconut milk",
        "Vegetables",
      ],
      recipe: {
        name: "Chicken Curry",
        steps: [
          "Marinate chicken",
          "Saute spices",
          "Add coconut milk",
          "Simmer and serve with rice",
        ],
      },
    },
  },
  "3": {
    eatOut: {
      price: 45,
      time: "25 min (travel + order)",
      calories: 600,
      convenience: "Very High",
    },
    cookAtHome: {
      price: 20,
      time: "30 min",
      calories: 450,
      ingredients: [
        "Sushi-grade salmon",
        "Sushi rice",
        "Nori sheets",
        "Soy sauce",
        "Wasabi",
      ],
      recipe: {
        name: "Salmon Sushi Rolls",
        steps: [
          "Cook and season rice",
          "Prepare fish",
          "Roll with nori",
          "Slice and serve",
        ],
      },
    },
  },
  default: {
    eatOut: {
      price: 20,
      time: "20 min",
      calories: 700,
      convenience: "High",
    },
    cookAtHome: {
      price: 10,
      time: "40 min",
      calories: 550,
      ingredients: [
        "Protein of choice",
        "Vegetables",
        "Rice or pasta",
        "Seasonings",
        "Olive oil",
      ],
      recipe: {
        name: "Simple Stir Fry",
        steps: [
          "Prep ingredients",
          "Heat oil",
          "Stir fry protein and vegetables",
          "Season and serve",
        ],
      },
    },
  },
};

export function useBudgetCompare(businessId: string) {
  const [eatOut, setEatOut] = useState<EatOutOption>({
    price: 0,
    time: "",
    calories: 0,
    convenience: "",
  });
  const [cookAtHome, setCookAtHome] = useState<CookAtHomeOption>({
    price: 0,
    time: "",
    calories: 0,
    ingredients: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const comparison = mockComparisons[businessId] || mockComparisons.default;
      setEatOut(comparison.eatOut);
      setCookAtHome(comparison.cookAtHome);
      setIsLoading(false);
    };

    fetchComparison();
  }, [businessId]);

  return {
    eatOut,
    cookAtHome,
    isLoading,
  };
}
