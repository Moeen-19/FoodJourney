import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ChatBubble } from "@/components/ChatBubble";
import { BusinessCard } from "@/components/BusinessCard";
import { HeaderTitle } from "@/components/HeaderTitle";
import { VoiceButton } from "@/components/VoiceButton";
import { useTheme } from "@/hooks/useTheme";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useChat, ChatMessage } from "@/hooks/useChat";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

export default function ChatScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const flatListRef = useRef<FlatList>(null);
  const { profile } = useUserProfile();
  const { messages, isLoading, sendMessage } = useChat();
  const [inputText, setInputText] = useState("");

  const handleSend = useCallback(() => {
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText.trim());
      setInputText("");
    }
  }, [inputText, isLoading, sendMessage]);

  const renderMessage = useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
    if (item.businesses && item.businesses.length > 0) {
      return (
        <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
          <ChatBubble message={item.content} isUser={item.isUser} />
          <View style={styles.businessList}>
            {item.businesses.map((business) => (
              <BusinessCard key={business.id} business={business} compact />
            ))}
          </View>
        </Animated.View>
      );
    }
    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
        <ChatBubble message={item.content} isUser={item.isUser} />
      </Animated.View>
    );
  }, []);

  const welcomeMessage = profile.name
    ? `Hi ${profile.name}! Ask me anything about ${profile.city || "your city"}.`
    : "Hi! Ask me anything about your city.";

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <HeaderTitle />
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={tabBarHeight}
      >
        <FlatList
          ref={flatListRef}
          data={messages.length > 0 ? messages : [{ id: "welcome", content: welcomeMessage, isUser: false, timestamp: new Date() }]}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: Spacing.lg }
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isLoading ? (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
              Thinking...
            </ThemedText>
          </View>
        ) : null}

        <View style={[styles.inputContainer, { paddingBottom: tabBarHeight + Spacing.md, backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.inputRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about restaurants, cafes, plans..."
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() ? theme.primary : theme.backgroundSecondary,
                }
              ]}
            >
              <Feather
                name="send"
                size={20}
                color={inputText.trim() ? "#FFF" : theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <VoiceButton
        style={{ ...styles.voiceButton, bottom: tabBarHeight + 80 }}
        onTranscript={(text) => setInputText(prev => prev + " " + text)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  businessList: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceButton: {
    position: "absolute",
    right: Spacing.xl,
  },
});
