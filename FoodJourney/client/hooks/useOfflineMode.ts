import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

interface CachedData {
  businesses: any[];
  itineraries: any[];
  favorites: any[];
  version: number;
  lastUpdated: string;
}

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  (typeof window !== "undefined" && window.location?.origin) ||
  "http://localhost:5000";

const CACHE_KEY = "offlineCache";
const PENDING_MUTATIONS_KEY = "pendingMutations";

interface PendingMutation {
  id: string;
  type: "reservation" | "favorite" | "transaction" | "itinerary";
  action: "create" | "update" | "delete";
  data: any;
  timestamp: string;
}

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(true);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const [pendingMutations, setPendingMutations] = useState<PendingMutation[]>(
    [],
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    loadCachedData();
    loadPendingMutations();

    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && pendingMutations.length > 0) {
      syncPendingMutations();
    }
  }, [isOnline]);

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setCachedData(JSON.parse(cached));
      }
    } catch (error) {
      console.error("Failed to load cached data:", error);
    }
  };

  const loadPendingMutations = async () => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_MUTATIONS_KEY);
      if (pending) {
        setPendingMutations(JSON.parse(pending));
      }
    } catch (error) {
      console.error("Failed to load pending mutations:", error);
    }
  };

  const syncData = useCallback(async (): Promise<void> => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      const response = await fetch(`${API_URL}/api/cache/snapshot`);
      const data = await response.json();

      const newCache: CachedData = {
        businesses: data.businesses || [],
        itineraries: [],
        favorites: [],
        version: data.version,
        lastUpdated: data.timestamp,
      };

      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        try {
          const [itinRes, favRes] = await Promise.all([
            fetch(`${API_URL}/api/itineraries/${userId}`),
            fetch(`${API_URL}/api/favorites/${userId}`),
          ]);

          const itinData = await itinRes.json();
          const favData = await favRes.json();

          newCache.itineraries = itinData.itineraries || [];
          newCache.favorites = favData.favorites || [];
        } catch (error) {
          console.error("Failed to sync user data:", error);
        }
      }

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      setCachedData(newCache);
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error("Failed to sync data:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  const addPendingMutation = useCallback(
    async (
      mutation: Omit<PendingMutation, "id" | "timestamp">,
    ): Promise<void> => {
      const newMutation: PendingMutation = {
        ...mutation,
        id: `mutation_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      const updated = [...pendingMutations, newMutation];
      setPendingMutations(updated);
      await AsyncStorage.setItem(
        PENDING_MUTATIONS_KEY,
        JSON.stringify(updated),
      );
    },
    [pendingMutations],
  );

  const syncPendingMutations = useCallback(async (): Promise<void> => {
    if (pendingMutations.length === 0 || !isOnline) return;

    setIsSyncing(true);
    const failedMutations: PendingMutation[] = [];

    for (const mutation of pendingMutations) {
      try {
        let endpoint = "";
        let method = "";

        switch (mutation.type) {
          case "reservation":
            endpoint = "/api/reservations";
            method = mutation.action === "delete" ? "DELETE" : "POST";
            break;
          case "favorite":
            endpoint = "/api/favorites";
            method = mutation.action === "delete" ? "DELETE" : "POST";
            break;
          case "transaction":
            endpoint = "/api/budget/transaction";
            method = "POST";
            break;
          case "itinerary":
            endpoint = "/api/itineraries";
            method = "POST";
            break;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mutation.data),
        });

        if (!response.ok) {
          failedMutations.push(mutation);
        }
      } catch (error) {
        failedMutations.push(mutation);
      }
    }

    setPendingMutations(failedMutations);
    await AsyncStorage.setItem(
      PENDING_MUTATIONS_KEY,
      JSON.stringify(failedMutations),
    );
    setIsSyncing(false);
  }, [pendingMutations, isOnline]);

  const getCachedBusinesses = useCallback(() => {
    return cachedData?.businesses || [];
  }, [cachedData]);

  const getCachedItineraries = useCallback(() => {
    return cachedData?.itineraries || [];
  }, [cachedData]);

  const getCachedFavorites = useCallback(() => {
    return cachedData?.favorites || [];
  }, [cachedData]);

  const clearCache = useCallback(async (): Promise<void> => {
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(PENDING_MUTATIONS_KEY);
    setCachedData(null);
    setPendingMutations([]);
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingMutationsCount: pendingMutations.length,
    syncData,
    addPendingMutation,
    syncPendingMutations,
    getCachedBusinesses,
    getCachedItineraries,
    getCachedFavorites,
    clearCache,
  };
}
