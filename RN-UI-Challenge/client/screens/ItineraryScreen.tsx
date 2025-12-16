import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
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
import { useItinerary, ItineraryStop } from "@/hooks/useItinerary";
import { Spacing, BorderRadius } from "@/constants/theme";

const itineraryTypes = [
  { id: "day", label: "Full Day" },
  { id: "meals", label: "Meals Only" },
  { id: "evening", label: "After Work" },
  { id: "weekend", label: "Weekend" },
];

export default function ItineraryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedType, setSelectedType] = useState("day");
  const { itinerary, isLoading, generateItinerary, totalBudget } = useItinerary();

  const handleGenerate = useCallback(() => {
    generateItinerary(selectedType);
  }, [selectedType, generateItinerary]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h2" style={styles.title}>
          Itinerary Builder
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Create personalized day plans
        </ThemedText>

        <View style={styles.typeSelector}>
          {itineraryTypes.map((type) => (
            <Chip
              key={type.id}
              label={type.label}
              selected={selectedType === type.id}
              onPress={() => setSelectedType(type.id)}
            />
          ))}
        </View>

        <Button onPress={handleGenerate} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Itinerary"}
        </Button>

        {itinerary.length > 0 ? (
          <>
            <View style={styles.budgetCard}>
              <Card elevation={1}>
                <View style={styles.budgetContent}>
                  <View style={styles.budgetRow}>
                    <Feather name="dollar-sign" size={20} color={theme.primary} />
                    <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                      Estimated Budget
                    </ThemedText>
                  </View>
                  <ThemedText type="h3" style={{ color: theme.primary }}>
                    ${totalBudget}
                  </ThemedText>
                </View>
              </Card>
            </View>

            <View style={styles.timeline}>
              {itinerary.map((stop, index) => (
                <ItineraryItem
                  key={stop.id}
                  stop={stop}
                  isLast={index === itinerary.length - 1}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="map" size={64} color={theme.textSecondary} style={{ opacity: 0.5 }} />
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.lg }}>
              Select an itinerary type and tap Generate to create your personalized plan
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
  title: {
    marginBottom: Spacing.xs,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginVertical: Spacing.xl,
  },
  budgetCard: {
    marginTop: Spacing.xl,
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
  timeline: {
    marginTop: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
    paddingHorizontal: Spacing.xl,
  },
});
