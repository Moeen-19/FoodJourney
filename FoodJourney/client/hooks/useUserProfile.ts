import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DietaryRestrictions {
  vegan: boolean;
  vegetarian: boolean;
  halal: boolean;
  kosher: boolean;
  lactoseFree: boolean;
  glutenFree: boolean;
  keto: boolean;
  highProtein: boolean;
}

export interface UserProfile {
  name: string;
  city: string;
  dietaryRestrictions: DietaryRestrictions;
  allergies: string[];
  dislikedIngredients: string[];
  budgetRange: "low" | "medium" | "high";
  preferredCuisines: string[];
  hasCompletedOnboarding: boolean;
}

const defaultProfile: UserProfile = {
  name: "",
  city: "",
  dietaryRestrictions: {
    vegan: false,
    vegetarian: false,
    halal: false,
    kosher: false,
    lactoseFree: false,
    glutenFree: false,
    keto: false,
    highProtein: false,
  },
  allergies: [],
  dislikedIngredients: [],
  budgetRange: "medium",
  preferredCuisines: [],
  hasCompletedOnboarding: false,
};

const PROFILE_KEY = "@FoodJourney_profile";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = useCallback(
    async (newProfile: Partial<UserProfile>) => {
      try {
        const updated = { ...profile, ...newProfile };
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
        setProfile(updated);
        return true;
      } catch (error) {
        console.error("Failed to save profile:", error);
        return false;
      }
    },
    [profile],
  );

  const completeOnboarding = useCallback(async () => {
    await saveProfile({ hasCompletedOnboarding: true });
  }, [saveProfile]);

  const resetProfile = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
      setProfile(defaultProfile);
    } catch (error) {
      console.error("Failed to reset profile:", error);
    }
  }, []);

  return {
    profile,
    isLoading,
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
    saveProfile,
    completeOnboarding,
    resetProfile,
  };
}
