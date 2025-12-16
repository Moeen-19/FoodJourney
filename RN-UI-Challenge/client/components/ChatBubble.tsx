import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

export function ChatBubble({ message, isUser }: ChatBubbleProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? theme.userBubble : theme.aiBubble,
            borderColor: isUser ? "transparent" : theme.border,
            borderWidth: isUser ? 0 : 1,
          },
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <ThemedText
          type="body"
          style={{ color: isUser ? "#FFFFFF" : theme.text }}
        >
          {message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    maxWidth: "85%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  aiContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    borderBottomRightRadius: Spacing.xs,
  },
  aiBubble: {
    borderBottomLeftRadius: Spacing.xs,
  },
});
