import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: "dietary" | "price" | "cuisine" | "vibes" | "default";
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Chip({
  label,
  selected = false,
  onPress,
  variant = "default",
  icon,
  style,
}: ChipProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const getVariantColor = () => {
    switch (variant) {
      case "dietary":
        return theme.secondary;
      case "price":
        return theme.primary;
      case "cuisine":
        return theme.accent;
      case "vibes":
        return theme.textSecondary;
      default:
        return theme.primary;
    }
  };

  const variantColor = getVariantColor();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? variantColor + "20" : theme.backgroundDefault,
          borderColor: selected ? variantColor : theme.border,
        },
        animatedStyle,
        style,
      ]}
    >
      {icon ? (
        <Feather
          name={icon}
          size={14}
          color={selected ? variantColor : theme.textSecondary}
          style={styles.icon}
        />
      ) : null}
      <ThemedText
        type="small"
        style={{
          color: selected ? variantColor : theme.text,
          fontWeight: selected ? "600" : "400",
        }}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: Spacing.xs,
  },
});
