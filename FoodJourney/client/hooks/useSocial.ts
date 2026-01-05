import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

interface Favorite {
  id: string;
  userId: string;
  businessId: string;
  businessName?: string;
  notes?: string;
  createdAt: string;
}

interface Friend {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

interface SharedItem {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  shareCode: string;
  message?: string;
  createdAt: string;
}

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  (typeof window !== "undefined" && window.location?.origin) ||
  "http://localhost:5000";

export function useSocial() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getUserId = async (): Promise<string> => {
    let userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      userId = `user_${Date.now()}`;
      await AsyncStorage.setItem("userId", userId);
    }
    return userId;
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = await getUserId();

      const [favRes, friendsRes] = await Promise.all([
        fetch(`${API_URL}/api/favorites/${userId}`),
        fetch(`${API_URL}/api/friends/${userId}`),
      ]);

      const favData = await favRes.json();
      const friendsData = await friendsRes.json();

      setFavorites(favData.favorites || []);
      setFriends(friendsData.friends || []);

      const cachedShared = await AsyncStorage.getItem("sharedItems");
      if (cachedShared) {
        setSharedItems(JSON.parse(cachedShared));
      }
    } catch (error) {
      console.error("Failed to fetch social data:", error);

      const cachedFavorites = await AsyncStorage.getItem("favorites");
      const cachedFriends = await AsyncStorage.getItem("friends");
      const cachedShared = await AsyncStorage.getItem("sharedItems");

      if (cachedFavorites) setFavorites(JSON.parse(cachedFavorites));
      if (cachedFriends) setFriends(JSON.parse(cachedFriends));
      if (cachedShared) setSharedItems(JSON.parse(cachedShared));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFavorite = useCallback(
    async (businessId: string, businessName?: string): Promise<Favorite> => {
      const userId = await getUserId();

      try {
        const response = await fetch(`${API_URL}/api/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, businessId }),
        });

        if (!response.ok) {
          throw new Error("Failed to add favorite");
        }

        const result = await response.json();

        const newFavorite = { ...result.favorite, businessName };
        const updatedFavorites = [...favorites, newFavorite];
        setFavorites(updatedFavorites);
        await AsyncStorage.setItem(
          "favorites",
          JSON.stringify(updatedFavorites),
        );

        return newFavorite;
      } catch (error) {
        const localFavorite: Favorite = {
          id: `local_${Date.now()}`,
          userId,
          businessId,
          businessName,
          createdAt: new Date().toISOString(),
        };

        const updatedFavorites = [...favorites, localFavorite];
        setFavorites(updatedFavorites);
        await AsyncStorage.setItem(
          "favorites",
          JSON.stringify(updatedFavorites),
        );

        return localFavorite;
      }
    },
    [favorites],
  );

  const removeFavorite = useCallback(
    async (businessId: string): Promise<void> => {
      const userId = await getUserId();

      try {
        await fetch(`${API_URL}/api/favorites`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, businessId }),
        });
      } catch (error) {
        console.error("Failed to remove favorite from server:", error);
      }

      const updatedFavorites = favorites.filter(
        (f) => f.businessId !== businessId,
      );
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    },
    [favorites],
  );

  const addFriend = useCallback(
    async (friendUsername: string): Promise<void> => {
      const userId = await getUserId();

      try {
        await fetch(`${API_URL}/api/friends`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, friendUsername }),
        });
      } catch (error) {
        const localFriend: Friend = {
          id: `local_${Date.now()}`,
          username: friendUsername,
          displayName: friendUsername,
        };

        const updatedFriends = [...friends, localFriend];
        setFriends(updatedFriends);
        await AsyncStorage.setItem("friends", JSON.stringify(updatedFriends));
      }
    },
    [friends],
  );

  const shareItem = useCallback(
    async (
      itemType: "business" | "itinerary",
      itemId: string,
      message?: string,
    ): Promise<SharedItem> => {
      const userId = await getUserId();
      const shareCode = Math.random().toString(36).substring(2, 10);

      const newShared: SharedItem = {
        id: `share_${Date.now()}`,
        userId,
        itemType,
        itemId,
        shareCode,
        message,
        createdAt: new Date().toISOString(),
      };

      const updatedShared = [...sharedItems, newShared];
      setSharedItems(updatedShared);
      await AsyncStorage.setItem("sharedItems", JSON.stringify(updatedShared));

      return newShared;
    },
    [sharedItems],
  );

  return {
    favorites,
    friends,
    sharedItems,
    isLoading,
    fetchData,
    addFavorite,
    removeFavorite,
    addFriend,
    shareItem,
  };
}
