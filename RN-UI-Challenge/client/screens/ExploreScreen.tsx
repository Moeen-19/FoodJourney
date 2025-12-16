import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Chip } from "@/components/Chip";
import { BusinessCard } from "@/components/BusinessCard";
import { useTheme } from "@/hooks/useTheme";
import { useBusinesses, Business } from "@/hooks/useBusinesses";
import { Spacing } from "@/constants/theme";

const categories = [
  { id: "food", label: "Food", icon: "coffee" as const },
  { id: "coffee", label: "Coffee", icon: "coffee" as const },
  { id: "cheap", label: "Cheap Eats", icon: "dollar-sign" as const },
  { id: "study", label: "Study Spots", icon: "book" as const },
  { id: "nightlife", label: "Nightlife", icon: "moon" as const },
];

export default function ExploreScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedCategory, setSelectedCategory] = useState("food");
  const { businesses, isLoading, refresh } = useBusinesses(selectedCategory);

  const renderHeader = useCallback(() => (
    <View style={styles.headerSection}>
      <ThemedText type="h2" style={styles.title}>
        Explore
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary }}>
        Discover places tailored to your preferences
      </ThemedText>
      <View style={styles.categories}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              selected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
              variant="default"
            />
          )}
        />
      </View>
    </View>
  ), [theme, selectedCategory]);

  const renderBusiness = useCallback(({ item }: { item: Business }) => (
    <BusinessCard business={item} />
  ), []);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={businesses}
        renderItem={renderBusiness}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
                No places found in this category
              </ThemedText>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerSection: {
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  categories: {
    marginTop: Spacing.lg,
  },
  categoryList: {
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
});
