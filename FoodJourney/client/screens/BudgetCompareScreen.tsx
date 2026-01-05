import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useBudgetCompare } from "@/hooks/useBudgetCompare";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteProps = RouteProp<RootStackParamList, "BudgetCompare">;

export default function BudgetCompareScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const { eatOut, cookAtHome, isLoading } = useBudgetCompare(
    route.params.businessId,
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loading]}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Calculating options...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h3" style={styles.title}>
          Budget Comparison
        </ThemedText>
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, marginBottom: Spacing.xl }}
        >
          Compare eating out vs cooking at home
        </ThemedText>

        <View style={styles.comparisonContainer}>
          <Card
            elevation={2}
            style={{
              ...styles.optionCard,
              borderColor: theme.primary,
              borderWidth: 2,
            }}
          >
            <View
              style={[
                styles.optionHeader,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <Feather name="map-pin" size={24} color={theme.primary} />
              <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
                Eat Out
              </ThemedText>
            </View>
            <View style={styles.optionContent}>
              <ThemedText type="h2" style={{ color: theme.primary }}>
                ${eatOut.price}
              </ThemedText>
              <View style={styles.statRow}>
                <Feather name="clock" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={styles.statText}>
                  {eatOut.time}
                </ThemedText>
              </View>
              <View style={styles.statRow}>
                <Feather name="zap" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={styles.statText}>
                  {eatOut.calories} cal
                </ThemedText>
              </View>
              <View style={styles.statRow}>
                <Feather name="check-circle" size={16} color={theme.success} />
                <ThemedText type="small" style={styles.statText}>
                  {eatOut.convenience}
                </ThemedText>
              </View>
            </View>
          </Card>

          <Card
            elevation={2}
            style={{
              ...styles.optionCard,
              borderColor: theme.secondary,
              borderWidth: 2,
            }}
          >
            <View
              style={[
                styles.optionHeader,
                { backgroundColor: theme.secondary + "20" },
              ]}
            >
              <Feather name="home" size={24} color={theme.secondary} />
              <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
                Cook at Home
              </ThemedText>
            </View>
            <View style={styles.optionContent}>
              <ThemedText type="h2" style={{ color: theme.secondary }}>
                ${cookAtHome.price}
              </ThemedText>
              <View style={styles.statRow}>
                <Feather name="clock" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={styles.statText}>
                  {cookAtHome.time}
                </ThemedText>
              </View>
              <View style={styles.statRow}>
                <Feather name="zap" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={styles.statText}>
                  {cookAtHome.calories} cal
                </ThemedText>
              </View>
              <View style={styles.statRow}>
                <Feather name="list" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={styles.statText}>
                  {cookAtHome.ingredients.length} ingredients
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        <Card elevation={1} style={styles.savingsCard}>
          <View style={styles.savingsContent}>
            <ThemedText type="body">You save by cooking:</ThemedText>
            <ThemedText type="h3" style={{ color: theme.success }}>
              ${(eatOut.price - cookAtHome.price).toFixed(2)}
            </ThemedText>
          </View>
        </Card>

        {cookAtHome.recipe ? (
          <View style={styles.recipeSection}>
            <ThemedText type="h4" style={styles.recipeTitle}>
              Quick Recipe
            </ThemedText>
            <Card elevation={1}>
              <ThemedText
                type="body"
                style={{ fontWeight: "600", marginBottom: Spacing.sm }}
              >
                {cookAtHome.recipe.name}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Ingredients:
              </ThemedText>
              {cookAtHome.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Feather name="check" size={14} color={theme.secondary} />
                  <ThemedText type="small" style={{ marginLeft: Spacing.sm }}>
                    {ingredient}
                  </ThemedText>
                </View>
              ))}
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  comparisonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  optionCard: {
    flex: 1,
    padding: 0,
    overflow: "hidden",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  optionContent: {
    padding: Spacing.md,
    alignItems: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  statText: {
    marginLeft: Spacing.sm,
  },
  savingsCard: {
    marginTop: Spacing.xl,
  },
  savingsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipeSection: {
    marginTop: Spacing.xl,
  },
  recipeTitle: {
    marginBottom: Spacing.md,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
});
