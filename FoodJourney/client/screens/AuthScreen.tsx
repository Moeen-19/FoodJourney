import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    View,
    AppState,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { Spacing, BorderRadius } from "@/constants/theme";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to
// receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener("change", (state) => {
    if (state === "active") {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default function AuthScreen() {
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert("Error", error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        if (!username) {
            Alert.alert("Error", "Please enter a username");
            return;
        }
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                },
            },
        });

        if (error) Alert.alert("Error", error.message);
        else if (!session)
            Alert.alert("Please check your inbox for email verification!");
        setLoading(false);
    }

    async function signInWithProvider(provider: "google" | "facebook") {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: Linking.createURL('/'),
            },
        });

        if (error) Alert.alert("Error", error.message);
        setLoading(false);
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <ThemedText type="h1" style={styles.title}>
                    FoodJourney
                </ThemedText>
                <ThemedText
                    type="body"
                    style={{ color: theme.textSecondary, marginBottom: Spacing["3xl"] }}
                >
                    {isLogin ? "Sign in to continue" : "Create an account"}
                </ThemedText>

                {!isLogin && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.backgroundSecondary,
                                    color: theme.text,
                                    borderColor: theme.border,
                                },
                            ]}
                            onChangeText={(text) => setUsername(text)}
                            value={username}
                            placeholder="Username"
                            placeholderTextColor={theme.textSecondary}
                            autoCapitalize="none"
                        />
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.backgroundSecondary,
                                color: theme.text,
                                borderColor: theme.border,
                            },
                        ]}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="email@address.com"
                        placeholderTextColor={theme.textSecondary}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.backgroundSecondary,
                                color: theme.text,
                                borderColor: theme.border,
                            },
                        ]}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder="Password"
                        placeholderTextColor={theme.textSecondary}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    {loading ? (
                        <ActivityIndicator color={theme.primary} />
                    ) : (
                        <>
                            <Button
                                onPress={isLogin ? signInWithEmail : signUpWithEmail}
                                style={{ width: "100%" }}
                            >
                                {isLogin ? "Sign In" : "Sign Up"}
                            </Button>

                            <View style={styles.divider}>
                                <View style={[styles.line, { backgroundColor: theme.border }]} />
                                <ThemedText type="small" style={{ marginHorizontal: Spacing.md, color: theme.textSecondary }}>
                                    OR
                                </ThemedText>
                                <View style={[styles.line, { backgroundColor: theme.border }]} />
                            </View>

                            <Button
                                variant="outline"
                                onPress={() => signInWithProvider("google")}
                                style={{ width: "100%", marginBottom: Spacing.sm }}
                            >
                                Continue with Google
                            </Button>
                            <Button
                                variant="outline"
                                onPress={() => signInWithProvider("facebook")}
                                style={{ width: "100%", marginBottom: Spacing.sm }}
                            >
                                Continue with Facebook
                            </Button>

                            <Button
                                variant="ghost"
                                onPress={() => setIsLogin(!isLogin)}
                                style={{ width: "100%", marginTop: Spacing.md }}
                            >
                                {isLogin ? "Need an account? Sign Up" : "Have an account? Sign In"}
                            </Button>
                        </>
                    )}
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: Spacing.xl,
    },
    content: {
        width: "100%",
        maxWidth: 400,
        alignSelf: "center",
    },
    title: {
        textAlign: "center",
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        marginBottom: Spacing.lg,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: Spacing.xl,
        alignItems: "center",
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xl,
        width: '100%',
    },
    line: {
        flex: 1,
        height: 1,
    },
});
