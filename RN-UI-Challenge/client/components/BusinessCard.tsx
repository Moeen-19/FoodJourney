import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Chip } from "@/components/Chip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Business } from "@/hooks/useBusinesses";

interface BusinessCardProps {
  business: Business;
  compact?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BusinessCard({ business, compact = false }: BusinessCardProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    navigation.navigate("BusinessDetail", { businessId: business.id });
  };

  if (compact) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.compactCard,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
          animatedStyle,
        ]}
      >
        <Image
          source={{ uri: business.imageUrl }}
          style={styles.compactImage}
          contentFit="cover"
        />
        <View style={styles.compactContent}>
          <ThemedText type="body" style={{ fontWeight: "600" }} numberOfLines={1}>
            {business.name}
          </ThemedText>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color={theme.primary} />
            <ThemedText type="small" style={{ marginLeft: 2 }}>
              {business.rating}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
              {business.priceLevel}
            </ThemedText>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.cardBackground },
        Shadows.medium,
        animatedStyle,
      ]}
    >
      <Image
        source={{ uri: business.imageUrl }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="h4" style={styles.name} numberOfLines={1}>
            {business.name}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.secondary, fontWeight: "600" }}>
            {business.priceLevel}
          </ThemedText>
        </View>

        <View style={styles.ratingRow}>
          <Feather name="star" size={14} color={theme.primary} />
          <ThemedText type="small" style={{ marginLeft: 4, fontWeight: "600" }}>
            {business.rating}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
            ({business.reviewCount})
          </ThemedText>
          <View style={styles.dot} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {business.distance}
          </ThemedText>
        </View>

        <View style={styles.tags}>
          {business.categories.slice(0, 2).map((category) => (
            <Chip key={category} label={category} variant="cuisine" style={styles.tag} />
          ))}
          {business.dietaryTags?.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} variant="dietary" selected style={styles.tag} />
          ))}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  image: {
    width: "100%",
    height: 160,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  name: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9BA1A6",
    marginHorizontal: Spacing.sm,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tag: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
  },
  compactContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
