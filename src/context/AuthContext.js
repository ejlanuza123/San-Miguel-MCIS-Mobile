// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "../services/supabase";
import { View, ActivityIndicator } from "react-native";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // 🔹 Helper: timeout wrapper to avoid long delays
  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
      ),
    ]);

  // 🔹 Check if onboarding is complete
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem("hasCompletedOnboarding");
        setIsOnboardingComplete(!!hasCompletedOnboarding);
        console.log("📋 Onboarding status:", !!hasCompletedOnboarding);
      } catch (error) {
        console.log("Error checking onboarding status:", error);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // 🔹 Load session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Fetch from SecureStore & NetInfo in parallel
        const [sessionData, netInfo] = await Promise.all([
          SecureStore.getItemAsync("supabase_session"),
          NetInfo.fetch(),
        ]);
        const isConnected = netInfo.isConnected;

        let activeSession = null;

        // Try Supabase session only if online (with 3s timeout)
        if (isConnected) {
          try {
            const { data } = await withTimeout(supabase.auth.getSession(), 3000);
            activeSession = data.session;
          } catch (e) {
            console.log("⚠️ getSession timeout or error:", e.message);
          }
        }

        if (activeSession) {
          // ✅ Supabase session is valid
          setUser(activeSession.user);
          await SecureStore.setItemAsync(
            "supabase_session",
            JSON.stringify(activeSession)
          );
        } else if (sessionData) {
          // ✅ Use locally cached session (offline or expired)
          const saved = JSON.parse(sessionData);
          setUser(saved.user);

          if (isConnected) {
            // Refresh session in background if online
            supabase.auth.setSession(saved).catch((err) =>
              console.log("⚠️ Background session restore failed:", err.message)
            );
          } else {
            console.log("📴 Offline mode: using cached session.");
          }
        } else {
          console.log("🚫 No session found, user logged out.");
        }
      } catch (err) {
        console.error("Error loading session:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // 🔄 Watch for Supabase auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          await SecureStore.setItemAsync(
            "supabase_session",
            JSON.stringify(session)
          );
        } else if (event === "SIGNED_OUT") {
          // Only clear auth data, preserve onboarding status
          setUser(null);
          setProfile(null);
          await SecureStore.deleteItemAsync("supabase_session");
          await SecureStore.deleteItemAsync("cached_profile");
          
          // Don't clear hasCompletedOnboarding here!
          console.log("✅ Signed out, preserved onboarding status");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔹 Fetch or restore user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const net = await NetInfo.fetch();
        const isConnected = net.isConnected;

        if (isConnected) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.log("⚠️ Profile fetch error:", error.message);
            const cached = await SecureStore.getItemAsync("cached_profile");
            if (cached) setProfile(JSON.parse(cached));
          } else {
            setProfile(data);
            await SecureStore.setItemAsync(
              "cached_profile",
              JSON.stringify(data)
            );
          }
        } else {
          // Offline fallback
          const cached = await SecureStore.getItemAsync("cached_profile");
          if (cached) {
            console.log("📴 Loaded cached profile.");
            setProfile(JSON.parse(cached));
          }
        }
      } catch (err) {
        console.error("Profile load error:", err);
      }
    };

    fetchProfile();
  }, [user]);

  // 🔹 Sign out handler
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Preserve onboarding status manually
      const hasCompletedOnboarding = await SecureStore.getItemAsync("hasCompletedOnboarding");
      if (hasCompletedOnboarding) setIsOnboardingComplete(true);
    } catch (e) {
      console.log("⚠️ Supabase sign-out error:", e.message);
      await SecureStore.deleteItemAsync("supabase_session");
      await SecureStore.deleteItemAsync("cached_profile");
    } finally {
      setUser(null);
      setProfile(null);
    }
  };
  // 🔹 Render a loading splash while checking session
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f172a",
        }}
      >
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      setProfile, 
      loading, 
      signOut,
      isOnboardingComplete 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};