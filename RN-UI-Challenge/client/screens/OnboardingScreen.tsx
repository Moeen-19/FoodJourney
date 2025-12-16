import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const onboardingSteps = [
  {
    icon: "message-circle" as const,
    title: "Talk to Your City",
    description: "Ask anything about your city and get personalized recommendations powered by AI",
  },
  {
    icon: "heart" as const,
    title: "Dietary-Aware Discovery",
    description: "Set your dietary preferences and we'll filter all recommendations to match",
  },
  {
    icon: "dollar-sign" as const,
    title: "Smart Budget Planning",
    description: "Compare eating out vs cooking at home and make informed decisions",
  },
  {
    icon: "map" as const,
    title: "Build Your Itinerary",
    description: "Create personalized day plans with restaurants, cafes, and attractions",
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate("DietaryProfile", { isEditing: false });
    }
  };

  const handleSkip = () => {
    navigation.navigate("DietaryProfile", { isEditing: false });
  };

  const step = onboardingSteps[currentStep];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Skip
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Animated.View
          key={currentStep}
          entering={FadeInRight.duration(400)}
          style={styles.stepContent}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
            <Feather name={step.icon} size={48} color={theme.primary} />
          </View>
          <ThemedText type="h2" style={styles.title}>
            {step.title}
          </ThemedText>
          <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
            {step.description}
          </ThemedText>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentStep ? theme.primary : theme.border,
                  width: index === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Button onPress={handleNext}>
          {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  skipButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  description: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  footer: {
    gap: Spacing.xl,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
