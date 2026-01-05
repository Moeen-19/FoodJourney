import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Profile = {
    id: string;
    username?: string;
    avatar_url?: string;
    // add other fields from your `profiles` table
};

type AuthContextType = {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isLoggedIn: false,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Handle session + auth state changes
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch profile when session changes
    useEffect(() => {
        const fetchProfile = async () => {
            if (session?.user) {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (error) {
                    console.error("Error fetching profile:", error);
                }
                setProfile(data ?? null);
                setIsLoading(false);
            } else {
                setProfile(null);
            }
        };

        fetchProfile();
    }, [session]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                profile,
                isLoading,
                isLoggedIn: !!session,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);
