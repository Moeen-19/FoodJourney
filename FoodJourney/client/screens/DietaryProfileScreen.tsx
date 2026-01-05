import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { useTheme } from "@/hooks/useTheme";
import { useUserProfile, DietaryRestrictions } from "@/hooks/useUserProfile";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const dietaryOptions: {
  key: keyof DietaryRestrictions;
  label: string;
  icon: string;
}[] = [
  { key: "vegan", label: "Vegan", icon: "leaf" },
  { key: "vegetarian", label: "Vegetarian", icon: "heart" },
  { key: "halal", label: "Halal", icon: "check-circle" },
  { key: "kosher", label: "Kosher", icon: "star" },
  { key: "lactoseFree", label: "Lactose-Free", icon: "x-circle" },
  { key: "glutenFree", label: "Gluten-Free", icon: "slash" },
  { key: "keto", label: "Keto", icon: "zap" },
  { key: "highProtein", label: "High-Protein", icon: "activity" },
];

const cuisineOptions = [
  "Italian",
  "Japanese",
  "Mexican",
  "Indian",
  "Chinese",
  "Thai",
  "Mediterranean",
  "American",
  "Korean",
  "Vietnamese",
  "French",
  "Middle Eastern",
];

const budgetOptions: {
  value: "low" | "medium" | "high";
  label: string;
  description: string;
}[] = [
  { value: "low", label: "Budget-Friendly", description: "Under $15 per meal" },
  { value: "medium", label: "Moderate", description: "$15-30 per meal" },
  { value: "high", label: "Flexible", description: "Any price range" },
];

export default function DietaryProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "DietaryProfile">>();
  const { profile, saveProfile, completeOnboarding, hasCompletedOnboarding } =
    useUserProfile();

  const isEditing = route.params?.isEditing || hasCompletedOnboarding;

  const [name, setName] = useState(profile.name);
  const [city, setCity] = useState(profile.city);
  const [dietary, setDietary] = useState<DietaryRestrictions>(
    profile.dietaryRestrictions,
  );
  const [budget, setBudget] = useState<"low" | "medium" | "high">(
    profile.budgetRange,
  );
  const [cuisines, setCuisines] = useState<string[]>(profile.preferredCuisines);
  const [allergies, setAllergies] = useState(profile.allergies.join(", "));
  const [saving, setSaving] = useState(false);

  const toggleDietary = (key: keyof DietaryRestrictions) => {
    setDietary((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCuisine = (cuisine: string) => {
    setCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await saveProfile({
      name,
      city,
      dietaryRestrictions: dietary,
      budgetRange: budget,
      preferredCuisines: cuisines,
      allergies: allergies
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    });

    if (!isEditing) {
      await completeOnboarding();
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } else {
      navigation.goBack();
    }
    setSaving(false);
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <ThemedText type="h3" style={styles.sectionTitle}>
        About You
      </ThemedText>
      <View style={styles.inputContainer}>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}
        >
          Your Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={theme.textSecondary}
        />
      </View>
      <View style={styles.inputContainer}>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}
        >
          Your City
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={city}
          onChangeText={setCity}
          placeholder="e.g., Singapore, Toronto, Mumbai"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Dietary Preferences
      </ThemedText>
      <View style={styles.chipsContainer}>
        {dietaryOptions.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={dietary[option.key]}
            onPress={() => toggleDietary(option.key)}
            variant="dietary"
          />
        ))}
      </View>

      <View style={styles.inputContainer}>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}
        >
          Allergies (comma separated)
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={allergies}
          onChangeText={setAllergies}
          placeholder="e.g., peanuts, shellfish"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Budget Range
      </ThemedText>
      <View style={styles.budgetContainer}>
        {budgetOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setBudget(option.value)}
            style={[
              styles.budgetOption,
              {
                backgroundColor:
                  budget === option.value
                    ? theme.primary + "20"
                    : theme.backgroundDefault,
                borderColor:
                  budget === option.value ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {option.label}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {option.description}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Preferred Cuisines
      </ThemedText>
      <View style={styles.chipsContainer}>
        {cuisineOptions.map((cuisine) => (
          <Chip
            key={cuisine}
            label={cuisine}
            selected={cuisines.includes(cuisine)}
            onPress={() => toggleCuisine(cuisine)}
            variant="cuisine"
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Start Exploring"}
        </Button>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  budgetContainer: {
    gap: Spacing.sm,
  },
  budgetOption: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  buttonContainer: {
    marginTop: Spacing["2xl"],
  },
});
