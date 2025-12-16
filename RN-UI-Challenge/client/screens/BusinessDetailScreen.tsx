import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useBusinessDetail } from "@/hooks/useBusinessDetail";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteProps = RouteProp<RootStackParamList, "BusinessDetail">;

export default function BusinessDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const { business, isLoading } = useBusinessDetail(route.params.businessId);

  const handleOpenMaps = () => {
    if (business?.coordinates) {
      const url = `https://maps.google.com/?q=${business.coordinates.latitude},${business.coordinates.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleCall = () => {
    if (business?.phone) {
      Linking.openURL(`tel:${business.phone}`);
    }
  };

  if (isLoading || !business) {
    return (
      <ThemedView style={[styles.container, styles.loading]}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Loading...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: business.imageUrl }}
          style={styles.heroImage}
          contentFit="cover"
        />

        <View style={styles.mainContent}>
          <ThemedText type="h2" style={styles.title}>
            {business.name}
          </ThemedText>

          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              <Feather name="star" size={16} color={theme.primary} />
              <ThemedText type="body" style={{ marginLeft: Spacing.xs, fontWeight: "600" }}>
                {business.rating}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                ({business.reviewCount} reviews)
              </ThemedText>
            </View>
            <ThemedText type="body" style={{ color: theme.secondary, fontWeight: "600" }}>
              {business.priceLevel}
            </ThemedText>
          </View>

          <View style={styles.tags}>
            {business.categories.map((category) => (
              <Chip key={category} label={category} variant="cuisine" />
            ))}
            {business.dietaryTags?.map((tag) => (
              <Chip key={tag} label={tag} variant="dietary" selected />
            ))}
          </View>

          <Card elevation={1} style={styles.infoCard}>
            <Pressable style={styles.infoRow} onPress={handleOpenMaps}>
              <Feather name="map-pin" size={20} color={theme.primary} />
              <View style={styles.infoContent}>
                <ThemedText type="body">{business.address}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {business.distance}
                </ThemedText>
              </View>
              <Feather name="external-link" size={16} color={theme.textSecondary} />
            </Pressable>

            {business.phone ? (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <Pressable style={styles.infoRow} onPress={handleCall}>
                  <Feather name="phone" size={20} color={theme.primary} />
                  <ThemedText type="body" style={styles.infoContent}>
                    {business.phone}
                  </ThemedText>
                  <Feather name="external-link" size={16} color={theme.textSecondary} />
                </Pressable>
              </>
            ) : null}

            {business.hours ? (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.infoRow}>
                  <Feather name="clock" size={20} color={theme.primary} />
                  <ThemedText type="body" style={styles.infoContent}>
                    {business.hours}
                  </ThemedText>
                </View>
              </>
            ) : null}
          </Card>

          <View style={styles.actions}>
            <Button onPress={handleOpenMaps}>
              Open in Maps
            </Button>
          </View>
        </View>
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
  content: {},
  heroImage: {
    width: "100%",
    height: 250,
  },
  mainContent: {
    padding: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    padding: 0,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  actions: {
    marginTop: Spacing.xl,
  },
});
