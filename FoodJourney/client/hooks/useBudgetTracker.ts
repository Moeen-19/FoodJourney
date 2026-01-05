import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

interface Transaction {
  id: string;
  userId: string;
  businessId?: string;
  amount: string;
  category: string;
  description?: string;
  date: string;
  type: string;
}

interface BudgetSummary {
  totalSpent: number;
  categoryBreakdown: Record<string, number>;
  averagePerDay: number;
  transactionCount: number;
}

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  (typeof window !== "undefined" && window.location?.origin) ||
  "http://localhost:5000";

export function useBudgetTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getUserId = async (): Promise<string> => {
    let userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      userId = `user_${Date.now()}`;
      await AsyncStorage.setItem("userId", userId);
    }
    return userId;
  };

  const fetchBudgetData = useCallback(async (days: number = 30) => {
    setIsLoading(true);
    try {
      const userId = await getUserId();
      const response = await fetch(
        `${API_URL}/api/budget/${userId}?days=${days}`,
      );
      const data = await response.json();

      setTransactions(data.transactions || []);
      setSummary(data.summary || null);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Failed to fetch budget data:", error);
      const cached = await AsyncStorage.getItem("budgetTransactions");
      if (cached) {
        const cachedData = JSON.parse(cached);
        setTransactions(cachedData);

        const total = cachedData.reduce(
          (sum: number, t: Transaction) => sum + parseFloat(t.amount || "0"),
          0,
        );
        const categoryBreakdown: Record<string, number> = {};
        cachedData.forEach((t: Transaction) => {
          categoryBreakdown[t.category] =
            (categoryBreakdown[t.category] || 0) + parseFloat(t.amount || "0");
        });

        setSummary({
          totalSpent: total,
          categoryBreakdown,
          averagePerDay: total / days,
          transactionCount: cachedData.length,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTransaction = useCallback(
    async (data: {
      amount: number;
      category: string;
      description?: string;
      type?: string;
      businessId?: string;
    }): Promise<Transaction> => {
      const userId = await getUserId();

      try {
        const response = await fetch(`${API_URL}/api/budget/transaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to add transaction");
        }

        const result = await response.json();

        const cached = await AsyncStorage.getItem("budgetTransactions");
        const cachedList = cached ? JSON.parse(cached) : [];
        cachedList.unshift(result.transaction);
        await AsyncStorage.setItem(
          "budgetTransactions",
          JSON.stringify(cachedList),
        );

        return result.transaction;
      } catch (error) {
        const localTransaction: Transaction = {
          id: `local_${Date.now()}`,
          userId,
          amount: String(data.amount),
          category: data.category,
          description: data.description,
          date: new Date().toISOString(),
          type: data.type || "expense",
        };

        const cached = await AsyncStorage.getItem("budgetTransactions");
        const cachedList = cached ? JSON.parse(cached) : [];
        cachedList.unshift(localTransaction);
        await AsyncStorage.setItem(
          "budgetTransactions",
          JSON.stringify(cachedList),
        );

        return localTransaction;
      }
    },
    [],
  );

  const getSpendingInsights = useCallback(
    async (
      days: number = 30,
    ): Promise<{
      topCategory: string;
      trend: "up" | "down" | "stable";
      savingPotential: number;
    }> => {
      if (!summary || Object.keys(summary.categoryBreakdown).length === 0) {
        return {
          topCategory: "None",
          trend: "stable",
          savingPotential: 0,
        };
      }

      const topCategory =
        Object.entries(summary.categoryBreakdown).sort(
          ([, a], [, b]) => b - a,
        )[0]?.[0] || "None";

      const avgDaily = summary.averagePerDay;
      const trend = avgDaily > 30 ? "up" : avgDaily < 20 ? "down" : "stable";

      const savingPotential = Math.round(summary.totalSpent * 0.15);

      return {
        topCategory,
        trend,
        savingPotential,
      };
    },
    [summary],
  );

  return {
    transactions,
    summary,
    recommendations,
    isLoading,
    fetchBudgetData,
    addTransaction,
    getSpendingInsights,
  };
}
