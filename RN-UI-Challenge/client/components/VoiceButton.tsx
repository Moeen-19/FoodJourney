import React, { useState } from "react";
import { StyleSheet, Pressable, Platform, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  cancelAnimation,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VoiceButton({ onTranscript, style }: VoiceButtonProps) {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (Platform.OS === "web") {
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      cancelAnimation(pulse);
      pulse.value = withSpring(1);
    } else {
      setIsRecording(true);
      pulse.value = withRepeat(
        withTiming(1.15, { duration: 800 }),
        -1,
        true
      );
      
      setTimeout(() => {
        setIsRecording(false);
        cancelAnimation(pulse);
        pulse.value = withSpring(1);
        onTranscript("Find me a good restaurant nearby");
      }, 3000);
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          backgroundColor: isRecording ? theme.error : theme.primary,
        },
        Shadows.large,
        animatedStyle,
        style,
      ]}
    >
      <Feather
        name={isRecording ? "mic-off" : "mic"}
        size={24}
        color="#FFFFFF"
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
