import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Dimensions, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { useTheme } from "@/hooks/useTheme";
import { useBudgetTracker } from "@/hooks/useBudgetTracker";
import { Spacing, BorderRadius } from "@/constants/theme";

const periodOptions = [
  { id: "7", label: "7 Days" },
  { id: "30", label: "30 Days" },
  { id: "90", label: "90 Days" },
];

const categoryIcons: Record<string, string> = {
  "Dining": "coffee",
  "Groceries": "shopping-cart",
  "Entertainment": "film",
  "Transport": "navigation",
  "Other": "more-horizontal",
};

const categoryColors: Record<string, string> = {
  "Dining": "#F4A261",
  "Groceries": "#88AB8E",
  "Entertainment": "#E76F51",
  "Transport": "#2A9D8F",
  "Other": "#9CA3AF",
};

export default function BudgetTrackerScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { 
    transactions, 
    summary, 
    recommendations, 
    isLoading, 
    fetchBudgetData,
    addTransaction 
  } = useBudgetTracker();
  
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "Dining",
    description: "",
  });

  useEffect(() => {
    fetchBudgetData(parseInt(selectedPeriod));
  }, [selectedPeriod]);

  const handleAddExpense = async () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      return;
    }

    await addTransaction({
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      type: 'expense',
    });

    setNewExpense({ amount: "", category: "Dining", description: "" });
    setShowAddExpense(false);
    fetchBudgetData(parseInt(selectedPeriod));
  };

  const maxCategoryValue = Math.max(...Object.values(summary?.categoryBreakdown || { default: 1 }));
  const screenWidth = Dimensions.get('window').width - Spacing.lg * 4;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <ThemedText type="h2">Budget Tracker</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Track spending & get recommendations
            </ThemedText>
          </View>
          <Pressable
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddExpense(!showAddExpense)}
          >
            <Feather name={showAddExpense ? "x" : "plus"} size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.periodSelector}>
          {periodOptions.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              selected={selectedPeriod === option.id}
              onPress={() => setSelectedPeriod(option.id)}
            />
          ))}
        </View>

        {showAddExpense && (
          <Card elevation={2} style={styles.addExpenseCard}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Add Expense</ThemedText>
            
            <View style={styles.inputRow}>
              <ThemedText type="h2" style={{ color: theme.primary }}>$</ThemedText>
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
              />
            </View>

            <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              Category
            </ThemedText>
            <View style={styles.categoryGrid}>
              {Object.keys(categoryIcons).map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryButton,
                    { 
                      backgroundColor: newExpense.category === cat ? categoryColors[cat] : theme.cardBackground,
                      borderColor: categoryColors[cat],
                    }
                  ]}
                  onPress={() => setNewExpense({ ...newExpense, category: cat })}
                >
                  <Feather 
                    name={categoryIcons[cat] as any} 
                    size={20} 
                    color={newExpense.category === cat ? '#fff' : categoryColors[cat]} 
                  />
                  <ThemedText 
                    type="caption" 
                    style={{ 
                      color: newExpense.category === cat ? '#fff' : theme.text,
                      marginTop: Spacing.xs,
                    }}
                  >
                    {cat}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[styles.descInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={theme.textSecondary}
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
            />

            <Button onPress={handleAddExpense} style={{ marginTop: Spacing.md }}>
              Add Expense
            </Button>
          </Card>
        )}

        <Card elevation={2} style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Total Spent ({selectedPeriod} days)
              </ThemedText>
              <ThemedText type="h1" style={{ color: theme.primary }}>
                ${summary?.totalSpent?.toFixed(2) || '0.00'}
              </ThemedText>
            </View>
            <View style={styles.avgContainer}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Daily Avg
              </ThemedText>
              <ThemedText type="h3" style={{ color: theme.text }}>
                ${summary?.averagePerDay?.toFixed(2) || '0.00'}
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card elevation={1} style={styles.chartCard}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Spending by Category</ThemedText>
          {Object.entries(summary?.categoryBreakdown || {}).map(([category, amount]) => (
            <View key={category} style={styles.chartRow}>
              <View style={styles.chartLabel}>
                <Feather 
                  name={categoryIcons[category] as any || "circle"} 
                  size={16} 
                  color={categoryColors[category] || theme.textSecondary} 
                />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm, flex: 1 }}>
                  {category}
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  ${(amount as number).toFixed(2)}
                </ThemedText>
              </View>
              <View style={[styles.chartBarBg, { backgroundColor: theme.border }]}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      width: `${((amount as number) / maxCategoryValue) * 100}%`,
                      backgroundColor: categoryColors[category] || theme.primary,
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </Card>

        {recommendations && recommendations.length > 0 && (
          <Card elevation={1} style={styles.recommendationsCard}>
            <View style={styles.recommendationsHeader}>
              <Feather name="zap" size={20} color={theme.primary} />
              <ThemedText type="subtitle" style={{ marginLeft: Spacing.sm }}>
                Smart Recommendations
              </ThemedText>
            </View>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Feather name="check-circle" size={16} color={theme.success || theme.primary} />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm, flex: 1 }}>
                  {rec}
                </ThemedText>
              </View>
            ))}
          </Card>
        )}

        <ThemedText type="subtitle" style={[styles.cardTitle, { marginTop: Spacing.xl }]}>
          Recent Transactions
        </ThemedText>
        {transactions.length > 0 ? (
          transactions.slice(0, 10).map((transaction) => (
            <Card key={transaction.id} elevation={1} style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <View style={[
                  styles.transactionIcon, 
                  { backgroundColor: categoryColors[transaction.category] || theme.border }
                ]}>
                  <Feather 
                    name={categoryIcons[transaction.category] as any || "circle"} 
                    size={18} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <ThemedText type="body">
                    {transaction.description || transaction.category}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </ThemedText>
                </View>
                <ThemedText type="subtitle" style={{ color: theme.error || '#E76F51' }}>
                  -${parseFloat(transaction.amount).toFixed(2)}
                </ThemedText>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="credit-card" size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md }}>
              No transactions yet. Add your first expense above!
            </ThemedText>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addExpenseCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    fontSize: 36,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  categoryButton: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  descInput: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    fontSize: 16,
  },
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avgContainer: {
    alignItems: 'flex-end',
  },
  chartCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  chartRow: {
    marginBottom: Spacing.md,
  },
  chartLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  chartBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationsCard: {
    padding: Spacing.lg,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  transactionCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
});
