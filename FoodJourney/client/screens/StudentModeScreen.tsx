import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { BusinessCard } from "@/components/BusinessCard";
import { useTheme } from "@/hooks/useTheme";
import { useStudentMode } from "@/hooks/useStudentMode";
import { Spacing, BorderRadius } from "@/constants/theme";

const quickCategories = [
  {
    id: "cheap",
    title: "Cheap Eats",
    icon: "dollar-sign" as const,
    color: "#88AB8E",
  },
  {
    id: "study",
    title: "Study Cafes",
    icon: "book" as const,
    color: "#E9C46A",
  },
  {
    id: "latenight",
    title: "Late Night",
    icon: "moon" as const,
    color: "#F4A261",
  },
  {
    id: "grocery",
    title: "Groceries",
    icon: "shopping-cart" as const,
    color: "#E76F51",
  },
];

export default function StudentModeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { selectedCategory, setSelectedCategory, businesses, isLoading } =
    useStudentMode();

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
          <Feather name="book-open" size={28} color={theme.primary} />
          <ThemedText type="h2" style={styles.title}>
            Student Survival
          </ThemedText>
        </View>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Quick access to budget-friendly essentials
        </ThemedText>

        <View style={styles.quickCategories}>
          {quickCategories.map((category) => (
            <Card
              key={category.id}
              elevation={selectedCategory === category.id ? 2 : 1}
              onPress={() => setSelectedCategory(category.id)}
              style={{
                ...styles.categoryCard,
                ...(selectedCategory === category.id
                  ? { borderColor: category.color, borderWidth: 2 }
                  : {}),
              }}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color + "20" },
                ]}
              >
                <Feather
                  name={category.icon}
                  size={24}
                  color={category.color}
                />
              </View>
              <ThemedText type="small" style={styles.categoryTitle}>
                {category.title}
              </ThemedText>
            </Card>
          ))}
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          {quickCategories.find((c) => c.id === selectedCategory)?.title ||
            "Recommendations"}
        </ThemedText>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Finding places...
            </ThemedText>
          </View>
        ) : businesses.length > 0 ? (
          <View style={styles.businessList}>
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color={theme.textSecondary} />
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.lg }}
            >
              Select a category to see recommendations
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
  },
  quickCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  categoryCard: {
    width: "47%",
    alignItems: "center",
    padding: Spacing.lg,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  businessList: {
    gap: Spacing.md,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
});
