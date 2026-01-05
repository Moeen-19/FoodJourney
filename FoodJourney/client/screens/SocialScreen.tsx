import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { useTheme } from "@/hooks/useTheme";
import { useSocial } from "@/hooks/useSocial";
import { Spacing, BorderRadius } from "@/constants/theme";

const tabs = [
  { id: "favorites", label: "Favorites", icon: "heart" },
  { id: "friends", label: "Friends", icon: "users" },
  { id: "shared", label: "Shared", icon: "share-2" },
];

export default function SocialScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    favorites,
    friends,
    sharedItems,
    isLoading,
    removeFavorite,
    addFriend,
    shareItem,
    fetchData,
  } = useSocial();

  const [activeTab, setActiveTab] = useState("favorites");
  const [friendUsername, setFriendUsername] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleShare = async (item: any, type: string) => {
    try {
      const shareUrl = `FoodJourney://${type}/${item.shareCode || item.id}`;
      await Share.share({
        title: item.title || item.name,
        message: `Check this out on FoodJourney: ${item.title || item.name}\n\n${shareUrl}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share");
    }
  };

  const handleAddFriend = async () => {
    if (!friendUsername.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    try {
      await addFriend(friendUsername.trim());
      Alert.alert("Request Sent", `Friend request sent to ${friendUsername}`);
      setFriendUsername("");
      setShowAddFriend(false);
    } catch (error) {
      Alert.alert("Error", "Failed to send friend request");
    }
  };

  const handleRemoveFavorite = (businessId: string) => {
    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFavorite(businessId),
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
          Social
        </ThemedText>
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}
        >
          Share favorites & connect with friends
        </ThemedText>

        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === tab.id ? theme.primary : theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Feather
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.id ? "#fff" : theme.text}
              />
              <ThemedText
                type="caption"
                style={{
                  color: activeTab === tab.id ? "#fff" : theme.text,
                  marginLeft: Spacing.xs,
                }}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {activeTab === "favorites" && (
          <View style={styles.tabContent}>
            {favorites.length > 0 ? (
              favorites.map((fav) => (
                <Card key={fav.id} elevation={1} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <ThemedText type="subtitle">
                        {fav.businessName || "Favorite Spot"}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        style={{ color: theme.textSecondary }}
                      >
                        Added {new Date(fav.createdAt).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    <View style={styles.itemActions}>
                      <Pressable
                        style={[
                          styles.iconButton,
                          { backgroundColor: theme.primary + "20" },
                        ]}
                        onPress={() => handleShare(fav, "business")}
                      >
                        <Feather
                          name="share-2"
                          size={16}
                          color={theme.primary}
                        />
                      </Pressable>
                      <Pressable
                        style={[
                          styles.iconButton,
                          { backgroundColor: theme.error + "20" },
                        ]}
                        onPress={() => handleRemoveFavorite(fav.businessId)}
                      >
                        <Feather
                          name="trash-2"
                          size={16}
                          color={theme.error || "#E76F51"}
                        />
                      </Pressable>
                    </View>
                  </View>
                  {fav.notes && (
                    <ThemedText
                      type="body"
                      style={{
                        marginTop: Spacing.sm,
                        color: theme.textSecondary,
                      }}
                    >
                      {fav.notes}
                    </ThemedText>
                  )}
                </Card>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="heart"
                  size={48}
                  color={theme.textSecondary}
                  style={{ opacity: 0.5 }}
                />
                <ThemedText
                  type="body"
                  style={{
                    color: theme.textSecondary,
                    textAlign: "center",
                    marginTop: Spacing.md,
                  }}
                >
                  No favorites yet. Start exploring and save places you love!
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {activeTab === "friends" && (
          <View style={styles.tabContent}>
            <Pressable
              style={[styles.addFriendButton, { borderColor: theme.primary }]}
              onPress={() => setShowAddFriend(!showAddFriend)}
            >
              <Feather
                name={showAddFriend ? "x" : "user-plus"}
                size={18}
                color={theme.primary}
              />
              <ThemedText
                type="body"
                style={{ color: theme.primary, marginLeft: Spacing.sm }}
              >
                {showAddFriend ? "Cancel" : "Add Friend"}
              </ThemedText>
            </Pressable>

            {showAddFriend && (
              <Card elevation={2} style={styles.addFriendCard}>
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="Enter username..."
                  placeholderTextColor={theme.textSecondary}
                  value={friendUsername}
                  onChangeText={setFriendUsername}
                  autoCapitalize="none"
                />
                <Button
                  onPress={handleAddFriend}
                  style={{ marginTop: Spacing.md }}
                >
                  Send Friend Request
                </Button>
              </Card>
            )}

            {friends.length > 0 ? (
              friends.map((friend) => (
                <Card key={friend.id} elevation={1} style={styles.itemCard}>
                  <View style={styles.friendRow}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <ThemedText type="subtitle" style={{ color: "#fff" }}>
                        {(friend.displayName ||
                          friend.username ||
                          "?")[0].toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={styles.friendInfo}>
                      <ThemedText type="subtitle">
                        {friend.displayName || friend.username}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        style={{ color: theme.textSecondary }}
                      >
                        @{friend.username}
                      </ThemedText>
                    </View>
                    <Pressable
                      style={[
                        styles.iconButton,
                        { backgroundColor: theme.secondary + "20" },
                      ]}
                    >
                      <Feather
                        name="message-circle"
                        size={18}
                        color={theme.secondary}
                      />
                    </Pressable>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="users"
                  size={48}
                  color={theme.textSecondary}
                  style={{ opacity: 0.5 }}
                />
                <ThemedText
                  type="body"
                  style={{
                    color: theme.textSecondary,
                    textAlign: "center",
                    marginTop: Spacing.md,
                  }}
                >
                  Connect with friends to share your favorite spots and
                  itineraries!
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {activeTab === "shared" && (
          <View style={styles.tabContent}>
            {sharedItems.length > 0 ? (
              sharedItems.map((item) => (
                <Card key={item.id} elevation={1} style={styles.itemCard}>
                  <View style={styles.sharedHeader}>
                    <View
                      style={[
                        styles.sharedBadge,
                        { backgroundColor: theme.primary + "20" },
                      ]}
                    >
                      <Feather
                        name={item.itemType === "itinerary" ? "map" : "map-pin"}
                        size={14}
                        color={theme.primary}
                      />
                      <ThemedText
                        type="caption"
                        style={{ color: theme.primary, marginLeft: Spacing.xs }}
                      >
                        {item.itemType}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      {new Date(item.createdAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  {item.message && (
                    <ThemedText type="body" style={{ marginTop: Spacing.sm }}>
                      {`"${item.message}"`}
                    </ThemedText>
                  )}
                  <View style={styles.sharedActions}>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.textSecondary }}
                    >
                      Share code: {item.shareCode}
                    </ThemedText>
                    <Pressable
                      style={[
                        styles.copyButton,
                        { backgroundColor: theme.primary },
                      ]}
                      onPress={() => handleShare(item, item.itemType)}
                    >
                      <Feather name="copy" size={14} color="#fff" />
                    </Pressable>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="share-2"
                  size={48}
                  color={theme.textSecondary}
                  style={{ opacity: 0.5 }}
                />
                <ThemedText
                  type="body"
                  style={{
                    color: theme.textSecondary,
                    textAlign: "center",
                    marginTop: Spacing.md,
                  }}
                >
                  Nothing shared yet. Share your favorites and itineraries with
                  friends!
                </ThemedText>
              </View>
            )}
          </View>
        )}
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
    marginBottom: Spacing.xs,
  },
  tabContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tabContent: {
    marginTop: Spacing.sm,
  },
  itemCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemInfo: {
    flex: 1,
  },
  itemActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: Spacing.md,
  },
  addFriendCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  input: {
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    fontSize: 16,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  friendInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sharedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sharedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  sharedActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  copyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
});
