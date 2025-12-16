import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

interface Reservation {
  id: string;
  userId: string;
  businessId: string;
  date: string;
  partySize: number;
  status: string;
  specialRequests?: string;
  confirmationCode: string;
  createdAt: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const API_URL = Constants.expoConfig?.extra?.apiUrl || 
  (typeof window !== 'undefined' && window.location?.origin) || 
  'http://localhost:5000';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getUserId = async (): Promise<string> => {
    let userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}`;
      await AsyncStorage.setItem('userId', userId);
    }
    return userId;
  };

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = await getUserId();
      const response = await fetch(`${API_URL}/api/reservations/${userId}`);
      const data = await response.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (data: {
    businessId: string;
    date: string;
    partySize: number;
    specialRequests?: string;
  }): Promise<Reservation> => {
    const userId = await getUserId();
    const response = await fetch(`${API_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create reservation');
    }
    
    const result = await response.json();
    await fetchReservations();
    return result.reservation;
  }, [fetchReservations]);

  const cancelReservation = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/reservations/${id}/cancel`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel reservation');
    }
    
    await fetchReservations();
  }, [fetchReservations]);

  const fetchAvailability = useCallback(async (businessId: string, date: string): Promise<TimeSlot[]> => {
    try {
      const response = await fetch(`${API_URL}/api/reservations/${businessId}/availability?date=${date}`);
      const data = await response.json();
      return data.slots || [];
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      return [
        { time: "11:00 AM", available: true },
        { time: "12:00 PM", available: true },
        { time: "1:00 PM", available: true },
        { time: "6:00 PM", available: true },
        { time: "7:00 PM", available: true },
        { time: "8:00 PM", available: true },
      ];
    }
  }, []);

  return {
    reservations,
    isLoading,
    fetchReservations,
    createReservation,
    cancelReservation,
    fetchAvailability,
  };
}
