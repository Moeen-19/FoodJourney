import React from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { Spacing, BorderRadius } from "@/constants/theme";

export function OfflineBanner() {
  const { theme } = useTheme();
  const { isOnline, isSyncing, pendingMutationsCount, syncData, lastSyncTime } =
    useOfflineMode();

  if (isOnline && pendingMutationsCount === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isOnline ? theme.success || "#22C55E" : "#EF4444" },
      ]}
    >
      <View style={styles.content}>
        <Feather name={isOnline ? "wifi" : "wifi-off"} size={16} color="#fff" />
        <ThemedText type="caption" style={styles.text}>
          {isOnline
            ? `Syncing ${pendingMutationsCount} changes...`
            : "You're offline. Changes will sync when connected."}
        </ThemedText>
        {pendingMutationsCount > 0 && (
          <View style={styles.badge}>
            <ThemedText type="caption" style={styles.badgeText}>
              {pendingMutationsCount}
            </ThemedText>
          </View>
        )}
      </View>
      {isOnline && pendingMutationsCount > 0 && (
        <Pressable
          style={styles.syncButton}
          onPress={syncData}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="refresh-cw" size={14} color="#fff" />
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  text: {
    color: "#fff",
    marginLeft: Spacing.sm,
    flex: 1,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  syncButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});
