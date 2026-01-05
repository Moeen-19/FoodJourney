import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { ItineraryStop } from "@/hooks/useItinerary";

interface ItineraryItemProps {
  stop: ItineraryStop;
  isLast: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ItineraryItem({ stop, isLast }: ItineraryItemProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const getIconForType = (type: string): keyof typeof Feather.glyphMap => {
    switch (type) {
      case "breakfast":
      case "lunch":
      case "dinner":
        return "coffee";
      case "activity":
        return "map-pin";
      case "transport":
        return "navigation";
      default:
        return "clock";
    }
  };

  const handlePress = () => {
    if (stop.businessId) {
      navigation.navigate("BusinessDetail", { businessId: stop.businessId });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View
          style={[styles.timelineDot, { backgroundColor: theme.primary }]}
        />
        {!isLast ? (
          <View
            style={[styles.timelineLine, { backgroundColor: theme.border }]}
          />
        ) : null}
      </View>

      <Card elevation={1} onPress={handlePress} style={styles.card}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.primary + "20" },
            ]}
          >
            <Feather
              name={getIconForType(stop.type)}
              size={18}
              color={theme.primary}
            />
          </View>
          <View style={styles.headerContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {stop.time}
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {stop.title}
            </ThemedText>
          </View>
          {stop.price ? (
            <ThemedText
              type="small"
              style={{ color: theme.secondary, fontWeight: "600" }}
            >
              ${stop.price}
            </ThemedText>
          ) : null}
        </View>

        {stop.description ? (
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
          >
            {stop.description}
          </ThemedText>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  timeline: {
    width: 24,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: Spacing.lg,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
  },
  card: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
