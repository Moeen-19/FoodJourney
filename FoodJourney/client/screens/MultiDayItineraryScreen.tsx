import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { ItineraryItem } from "@/components/ItineraryItem";
import { useTheme } from "@/hooks/useTheme";
import { useMultiDayItinerary } from "@/hooks/useMultiDayItinerary";
import { Spacing, BorderRadius } from "@/constants/theme";

const durationOptions = [
  { id: "3", label: "3 Days" },
  { id: "5", label: "5 Days" },
  { id: "7", label: "7 Days" },
];

const tripStyles = [
  { id: "relaxed", label: "Relaxed" },
  { id: "adventure", label: "Adventure" },
  { id: "foodie", label: "Foodie" },
  { id: "budget", label: "Budget" },
];

export default function MultiDayItineraryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    itinerary,
    savedItineraries,
    isLoading,
    generateItinerary,
    saveItinerary,
    exportItinerary,
    shareItinerary,
  } = useMultiDayItinerary();

  const [selectedDuration, setSelectedDuration] = useState("3");
  const [selectedStyle, setSelectedStyle] = useState("relaxed");
  const [activeDay, setActiveDay] = useState(1);
  const [itineraryTitle, setItineraryTitle] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  const handleGenerate = useCallback(() => {
    generateItinerary(parseInt(selectedDuration), selectedStyle);
  }, [selectedDuration, selectedStyle, generateItinerary]);

  const handleShare = async () => {
    if (!itinerary) return;

    try {
      const shareCode = await shareItinerary(itinerary);
      const shareUrl = `FoodJourney://itinerary/${shareCode}`;

      await Share.share({
        title: itinerary.title,
        message: `Check out my ${itinerary.duration}-day itinerary: ${itinerary.title}\n\n${shareUrl}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share itinerary");
    }
  };

  const handleExport = async (format: "ics" | "text") => {
    if (!itinerary || !itinerary.id) return;

    try {
      await exportItinerary(itinerary.id, format);
      Alert.alert("Success", `Itinerary exported as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert("Error", "Failed to export itinerary");
    }
  };

  const handleSave = async () => {
    if (!itinerary) return;

    if (!itineraryTitle.trim()) {
      Alert.alert("Title Required", "Please enter a title for your itinerary");
      return;
    }

    try {
      await saveItinerary({ ...itinerary, title: itineraryTitle });
      Alert.alert("Saved!", "Your itinerary has been saved");
    } catch (error) {
      Alert.alert("Error", "Failed to save itinerary");
    }
  };

  const totalBudget =
    itinerary?.days.reduce(
      (sum, day) =>
        sum +
        day.stops.reduce(
          (daySum, stop) => daySum + (stop.estimatedCost || 0),
          0,
        ),
      0,
    ) || 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.md,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <ThemedText type="h2">Trip Planner</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Create multi-day adventures
            </ThemedText>
          </View>
          <Pressable
            style={[styles.savedButton, { backgroundColor: theme.secondary }]}
            onPress={() => setShowSaved(!showSaved)}
          >
            <Feather name="bookmark" size={20} color="#fff" />
          </Pressable>
        </View>

        {showSaved ? (
          <View style={styles.savedSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Saved Itineraries
            </ThemedText>
            {savedItineraries.length > 0 ? (
              savedItineraries.map((saved) => (
                <Card key={saved.id} elevation={1} style={styles.savedCard}>
                  <View style={styles.savedHeader}>
                    <ThemedText type="subtitle">{saved.title}</ThemedText>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      {saved.duration} days
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="body"
                    style={{ color: theme.textSecondary }}
                  >
                    {saved.city} - ${saved.totalBudget}
                  </ThemedText>
                </Card>
              ))
            ) : (
              <ThemedText
                type="body"
                style={{
                  color: theme.textSecondary,
                  textAlign: "center",
                  padding: Spacing.xl,
                }}
              >
                No saved itineraries yet
              </ThemedText>
            )}
          </View>
        ) : (
          <>
            <Card elevation={1} style={styles.plannerCard}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Duration
              </ThemedText>
              <View style={styles.optionsRow}>
                {durationOptions.map((option) => (
                  <Chip
                    key={option.id}
                    label={option.label}
                    selected={selectedDuration === option.id}
                    onPress={() => setSelectedDuration(option.id)}
                  />
                ))}
              </View>

              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Trip Style
              </ThemedText>
              <View style={styles.optionsRow}>
                {tripStyles.map((style) => (
                  <Chip
                    key={style.id}
                    label={style.label}
                    selected={selectedStyle === style.id}
                    onPress={() => setSelectedStyle(style.id)}
                  />
                ))}
              </View>

              <Button
                onPress={handleGenerate}
                disabled={isLoading}
                style={{ marginTop: Spacing.lg }}
              >
                {isLoading ? "Generating..." : "Generate Itinerary"}
              </Button>
            </Card>

            {itinerary && (
              <>
                <Card elevation={1} style={styles.titleCard}>
                  <TextInput
                    style={[
                      styles.titleInput,
                      { color: theme.text, borderColor: theme.border },
                    ]}
                    placeholder="Name your itinerary..."
                    placeholderTextColor={theme.textSecondary}
                    value={itineraryTitle}
                    onChangeText={setItineraryTitle}
                  />
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.primary },
                      ]}
                      onPress={handleSave}
                    >
                      <Feather name="save" size={18} color="#fff" />
                    </Pressable>
                    <Pressable
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.secondary },
                      ]}
                      onPress={handleShare}
                    >
                      <Feather name="share-2" size={18} color="#fff" />
                    </Pressable>
                    <Pressable
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.accent || theme.primary },
                      ]}
                      onPress={() => handleExport("ics")}
                    >
                      <Feather name="calendar" size={18} color="#fff" />
                    </Pressable>
                    <Pressable
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.textSecondary },
                      ]}
                      onPress={() => handleExport("text")}
                    >
                      <Feather name="file-text" size={18} color="#fff" />
                    </Pressable>
                  </View>
                </Card>

                <View style={styles.budgetSummary}>
                  <Card elevation={1}>
                    <View style={styles.budgetContent}>
                      <View style={styles.budgetRow}>
                        <Feather
                          name="dollar-sign"
                          size={20}
                          color={theme.primary}
                        />
                        <ThemedText
                          type="body"
                          style={{ marginLeft: Spacing.sm }}
                        >
                          Total Estimated Budget
                        </ThemedText>
                      </View>
                      <ThemedText type="h3" style={{ color: theme.primary }}>
                        ${totalBudget}
                      </ThemedText>
                    </View>
                  </Card>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.dayTabs}
                >
                  {itinerary.days.map((day, index) => (
                    <Pressable
                      key={day.dayNumber}
                      style={[
                        styles.dayTab,
                        {
                          backgroundColor:
                            activeDay === day.dayNumber
                              ? theme.primary
                              : theme.cardBackground,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => setActiveDay(day.dayNumber)}
                    >
                      <ThemedText
                        type="subtitle"
                        style={{
                          color:
                            activeDay === day.dayNumber ? "#fff" : theme.text,
                        }}
                      >
                        Day {day.dayNumber}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        style={{
                          color:
                            activeDay === day.dayNumber
                              ? "#fff"
                              : theme.textSecondary,
                        }}
                      >
                        {day.stops.length} stops
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.timeline}>
                  {itinerary.days
                    .find((d) => d.dayNumber === activeDay)
                    ?.stops.map((stop, index, arr) => (
                      <ItineraryItem
                        key={stop.id}
                        stop={stop}
                        isLast={index === arr.length - 1}
                      />
                    ))}
                </View>
              </>
            )}
          </>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  savedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  plannerCard: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  titleCard: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  titleInput: {
    fontSize: 16,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetSummary: {
    marginTop: Spacing.lg,
  },
  budgetContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayTabs: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dayTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  timeline: {
    marginTop: Spacing.md,
  },
  savedSection: {
    marginTop: Spacing.md,
  },
  savedCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  savedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
});
