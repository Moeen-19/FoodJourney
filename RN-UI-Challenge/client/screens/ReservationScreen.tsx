import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { useTheme } from "@/hooks/useTheme";
import { useReservations } from "@/hooks/useReservations";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TimeSlot {
  time: string;
  available: boolean;
}

const partySizes = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ReservationScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { reservations, isLoading, createReservation, cancelReservation, fetchAvailability } = useReservations();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPartySize, setSelectedPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    loadAvailability();
  }, [selectedDate]);

  const loadAvailability = async () => {
    const slots = await fetchAvailability("default", selectedDate.toISOString());
    setAvailableSlots(slots);
  };

  const handleBook = async () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please select a time slot for your reservation");
      return;
    }

    setBookingLoading(true);
    try {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.replace(/ (AM|PM)/, '').split(':');
      const isPM = selectedTime.includes('PM');
      dateTime.setHours(isPM && hours !== '12' ? parseInt(hours) + 12 : parseInt(hours));
      dateTime.setMinutes(parseInt(minutes) || 0);

      await createReservation({
        businessId: "demo-restaurant",
        date: dateTime.toISOString(),
        partySize: selectedPartySize,
        specialRequests,
      });

      Alert.alert("Success!", "Your reservation has been confirmed");
      setShowBooking(false);
      setSelectedTime(null);
    } catch (error) {
      Alert.alert("Error", "Failed to create reservation. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
    };
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="h2">Reservations</ThemedText>
          <Pressable
            style={[styles.newButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowBooking(!showBooking)}
          >
            <Feather name={showBooking ? "x" : "plus"} size={20} color="#fff" />
          </Pressable>
        </View>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
          Book tables at your favorite restaurants
        </ThemedText>

        {showBooking && (
          <Card elevation={2} style={styles.bookingCard}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Select Date</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((date, index) => {
                const { day, date: dateNum } = formatDate(date);
                const isSelected = selectedDate.toDateString() === date.toDateString();
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.dateCard,
                      { backgroundColor: isSelected ? theme.primary : theme.cardBackground },
                      { borderColor: theme.border }
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <ThemedText 
                      type="caption" 
                      style={{ color: isSelected ? '#fff' : theme.textSecondary }}
                    >
                      {day}
                    </ThemedText>
                    <ThemedText 
                      type="h3" 
                      style={{ color: isSelected ? '#fff' : theme.text }}
                    >
                      {dateNum}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ThemedText type="subtitle" style={styles.sectionTitle}>Party Size</ThemedText>
            <View style={styles.partySizeContainer}>
              {partySizes.map((size) => (
                <Chip
                  key={size}
                  label={`${size}`}
                  selected={selectedPartySize === size}
                  onPress={() => setSelectedPartySize(size)}
                />
              ))}
            </View>

            <ThemedText type="subtitle" style={styles.sectionTitle}>Available Times</ThemedText>
            <View style={styles.timeSlotsContainer}>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.timeSlot,
                      { 
                        backgroundColor: selectedTime === slot.time ? theme.primary : 
                          slot.available ? theme.cardBackground : theme.border,
                        borderColor: theme.border,
                        opacity: slot.available ? 1 : 0.5,
                      }
                    ]}
                    onPress={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                  >
                    <ThemedText 
                      type="body" 
                      style={{ 
                        color: selectedTime === slot.time ? '#fff' : 
                          slot.available ? theme.text : theme.textSecondary 
                      }}
                    >
                      {slot.time}
                    </ThemedText>
                  </Pressable>
                ))
              ) : (
                <View style={styles.loadingSlots}>
                  <ActivityIndicator color={theme.primary} />
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                    Loading availability...
                  </ThemedText>
                </View>
              )}
            </View>

            <Button 
              onPress={handleBook} 
              disabled={!selectedTime || bookingLoading}
              style={{ marginTop: Spacing.lg }}
            >
              {bookingLoading ? "Booking..." : "Confirm Reservation"}
            </Button>
          </Card>
        )}

        <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Your Reservations
        </ThemedText>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : reservations.length > 0 ? (
          reservations.map((reservation) => (
            <Card key={reservation.id} elevation={1} style={styles.reservationCard}>
              <View style={styles.reservationHeader}>
                <View style={styles.reservationInfo}>
                  <ThemedText type="subtitle">Restaurant Reservation</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {new Date(reservation.date).toLocaleDateString()} at {new Date(reservation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: reservation.status === 'confirmed' ? theme.success : theme.error }
                ]}>
                  <ThemedText type="caption" style={{ color: '#fff' }}>
                    {reservation.status}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.reservationDetails}>
                <View style={styles.detailItem}>
                  <Feather name="users" size={16} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ marginLeft: Spacing.xs }}>
                    {reservation.partySize} guests
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <Feather name="hash" size={16} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ marginLeft: Spacing.xs }}>
                    {reservation.confirmationCode}
                  </ThemedText>
                </View>
              </View>
              {reservation.status === 'confirmed' && (
                <Pressable
                  style={[styles.cancelButton, { borderColor: theme.error }]}
                  onPress={() => {
                    Alert.alert(
                      "Cancel Reservation",
                      "Are you sure you want to cancel this reservation?",
                      [
                        { text: "No", style: "cancel" },
                        { text: "Yes", onPress: () => cancelReservation(reservation.id) }
                      ]
                    );
                  }}
                >
                  <ThemedText type="body" style={{ color: theme.error }}>
                    Cancel Reservation
                  </ThemedText>
                </Pressable>
              )}
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={64} color={theme.textSecondary} style={{ opacity: 0.5 }} />
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.lg }}>
              No reservations yet. Book a table to get started!
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCard: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  dateScroll: {
    marginBottom: Spacing.md,
  },
  dateCard: {
    width: 60,
    height: 70,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  partySizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  loadingSlots: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  reservationCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reservationInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  reservationDetails: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.xl,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
    paddingHorizontal: Spacing.xl,
  },
});
