import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import SplashScreen from "./components/SplashScreen";
import AuthScreen from "./components/AuthScreen";
import ResetPassword from "./components/ResetPassword";
import { supabase, isSupabaseAvailable } from "./lib/supabase";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileData && !profileError) {
            setUser(session.user);
            setProfile(profileData);
          } else {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } =
              await supabase.auth.updateUser({
                data: {
                  username: session.user.email?.split("@")[0] || "Player",
                  chips: 15000,
                  games_played: 0,
                  games_won: 0,
                  level: 1,
                  experience: 0,
                  theme_preference: "orange",
                  preferences: {
                    sound: true,
                    theme: "orange",
                    notifications: true,
                  },
                },
              });

            if (!createError) {
              const profileData = {
                id: session.user.id,
                email: session.user.email,
                username: session.user.email?.split("@")[0] || "Player",
                chips: 15000,
                games_played: 0,
                games_won: 0,
                level: 1,
                experience: 0,
                theme_preference: "orange",
                preferences: {
                  sound: true,
                  theme: "orange",
                  notifications: true,
                },
                created_at: session.user.created_at,
              };
              setUser(session.user);
              setProfile(profileData);
            }
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync chips every 10 seconds
  useEffect(() => {
    if (!user || !profile) return;

    const syncChips = async () => {
      // Don't sync if Supabase is not available
      if (!isSupabaseAvailable()) {
        console.log("💰 Supabase not available, skipping chip sync");
        return;
      }

      try {
        const { data: updatedProfile, error } = await supabase
          .from("profiles")
          .select("chips, chips_balance")
          .eq("id", user.id)
          .single();

        if (updatedProfile && !error) {
          setProfile((prev) => ({
            ...prev,
            chips: updatedProfile.chips || updatedProfile.chips_balance || 0,
          }));
          console.log(
            "💰 Chips synced:",
            updatedProfile.chips || updatedProfile.chips_balance
          );
        } else {
          console.warn(
            "⚠️ Chip sync failed, but keeping user logged in:",
            error
          );
        }
      } catch (error) {
        console.warn("⚠️ Chip sync error, but keeping user logged in:", error);
      }
    };

    // Only set up sync if Supabase is available
    if (isSupabaseAvailable()) {
      // Initial sync
      syncChips();

      // Set up interval for every 10 seconds
      const interval = setInterval(syncChips, 10000);
      return () => clearInterval(interval);
    }
  }, [user, profile?.id]);

  const handleAuthSuccess = (userData: any, profileData: any) => {
    setUser(userData);
    setProfile(profileData);
  };

  // Sync chips to database when profile changes
  const syncChipsToDatabase = async (newChips: number) => {
    if (!user) return;

    if (!isSupabaseAvailable()) {
      console.log("💰 Supabase not available, skipping chip sync to database");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ chips: newChips })
        .eq("id", user.id);

      if (error) {
        console.error("Error syncing chips:", error);
      }
    } catch (error) {
      console.error("Error syncing chips:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">GH</span>
          </div>
          <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Reset Password Route */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main App Routes */}
        <Route
          path="/*"
          element={
            showSplash ? (
              <SplashScreen onComplete={() => setShowSplash(false)} />
            ) : !user || !profile ? (
              <AuthScreen onAuthSuccess={handleAuthSuccess} />
            ) : (
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <Dashboard user={user} profile={profile} />
              </div>
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
