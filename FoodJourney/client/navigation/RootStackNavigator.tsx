import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import DietaryProfileScreen from "@/screens/DietaryProfileScreen";
import BusinessDetailScreen from "@/screens/BusinessDetailScreen";
import BudgetCompareScreen from "@/screens/BudgetCompareScreen";
import ReservationScreen from "@/screens/ReservationScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import StudentModeScreen from "@/screens/StudentModeScreen";
import ItineraryScreen from "@/screens/ItineraryScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useUserProfile } from "@/hooks/useUserProfile";

import AuthScreen from "@/screens/AuthScreen";
import { useAuthContext } from "@/hooks/useAuthContext";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  DietaryProfile: { isEditing?: boolean };
  Main: undefined;
  BusinessDetail: { businessId: string };
  BudgetCompare: { businessId: string };
  Reservations: undefined;
  Settings: undefined;
  StudentMode: undefined;
  SingleDayItinerary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { hasCompletedOnboarding, isLoading: isProfileLoading } = useUserProfile();
  const { session, isLoading: isAuthLoading } = useAuthContext();
  const { theme } = useTheme();

  if (isProfileLoading || isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!session ? (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          {!hasCompletedOnboarding && (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DietaryProfile"
            component={DietaryProfileScreen}
            options={{
              headerTitle: "Set Up Your Profile",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="BusinessDetail"
            component={BusinessDetailScreen}
            options={{
              headerTitle: "Details",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="BudgetCompare"
            component={BudgetCompareScreen}
            options={{
              headerTitle: "Budget Compare",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Reservations"
            component={ReservationScreen}
            options={{
              headerTitle: "Reservations",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerTitle: "Settings",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="StudentMode"
            component={StudentModeScreen}
            options={{
              headerTitle: "Student Mode",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="SingleDayItinerary"
            component={ItineraryScreen}
            options={{
              headerTitle: "Day Planner",
              presentation: "modal",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
