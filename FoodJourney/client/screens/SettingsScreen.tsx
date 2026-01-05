import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuthContext } from "@/hooks/useAuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  destructive,
}: SettingItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        {
          backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
        },
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: destructive
              ? theme.error + "20"
              : theme.primary + "20",
          },
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={destructive ? theme.error : theme.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <ThemedText
          type="body"
          style={destructive ? { color: theme.error } : undefined}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { profile, resetProfile } = useUserProfile();
  const { signOut } = useAuthContext();

  const getDietaryLabel = () => {
    const restrictions = profile.dietaryRestrictions;
    const active = Object.entries(restrictions)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    return active.length > 0 ? `${active.length} preference(s)` : "None set";
  };

  const handleEditProfile = () => {
    navigation.navigate("DietaryProfile", { isEditing: true });
  };

  const handleResetProfile = () => {
    Alert.alert(
      "Reset Profile",
      "This will clear all your preferences and data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetProfile();
            navigation.reset({
              index: 0,
              routes: [{ name: "Onboarding" }],
            });
          },
        },
      ],
    );
  };

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
        <ThemedText type="h2" style={styles.title}>
          Settings
        </ThemedText>

        <View style={styles.profileSection}>
          <Card elevation={1}>
            <View style={styles.profileContent}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <ThemedText type="h3" style={{ color: "#FFF" }}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                </ThemedText>
              </View>
              <View style={styles.profileInfo}>
                <ThemedText type="h4">
                  {profile.name || "Set up your profile"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {profile.city || "No city set"}
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        <ThemedText type="small" style={styles.sectionLabel}>
          PREFERENCES
        </ThemedText>
        <Card elevation={1} style={styles.settingsCard}>
          <SettingItem
            icon="heart"
            title="Dietary Preferences"
            subtitle={getDietaryLabel()}
            onPress={handleEditProfile}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingItem
            icon="dollar-sign"
            title="Budget Range"
            subtitle={
              profile.budgetRange === "low"
                ? "Budget-Friendly"
                : profile.budgetRange === "medium"
                  ? "Moderate"
                  : "Flexible"
            }
            onPress={handleEditProfile}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingItem
            icon="map-pin"
            title="City"
            subtitle={profile.city || "Not set"}
            onPress={handleEditProfile}
          />
        </Card>

        <ThemedText type="small" style={styles.sectionLabel}>
          CUISINES
        </ThemedText>
        <Card elevation={1} style={styles.settingsCard}>
          <SettingItem
            icon="coffee"
            title="Preferred Cuisines"
            subtitle={
              profile.preferredCuisines.length > 0
                ? profile.preferredCuisines.join(", ")
                : "None selected"
            }
            onPress={handleEditProfile}
          />
        </Card>

        <ThemedText type="small" style={styles.sectionLabel}>
          ACCOUNT
        </ThemedText>
        <Card elevation={1} style={styles.settingsCard}>
          <SettingItem
            icon="trash-2"
            title="Reset All Data"
            destructive
            onPress={handleResetProfile}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingItem
            icon="log-out"
            title="Sign Out"
            onPress={() => {
              Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign Out",
                  style: "destructive",
                  onPress: signOut,
                },
              ]);
            }}
          />
        </Card>

        <View style={styles.footer}>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, textAlign: "center" }}
          >
            FoodJourney v1.0.0
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, textAlign: "center" }}
          >
            Powered by Cohere AI
          </ThemedText>
        </View>
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
    marginBottom: Spacing.xl,
  },
  profileSection: {
    marginBottom: Spacing.xl,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  sectionLabel: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    opacity: 0.7,
    fontWeight: "600",
  },
  settingsCard: {
    padding: 0,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  footer: {
    marginTop: Spacing["3xl"],
    gap: Spacing.xs,
  },
});
