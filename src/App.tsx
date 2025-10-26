import React from "react";
import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import SplashScreen from "./components/SplashScreen";
import AuthScreen from "./components/AuthScreen";
import ResetPassword from "./components/ResetPassword";
import { supabase, isSupabaseAvailable } from "./lib/supabase";
import GameContainer from "./components/GameContainer";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSyncing = useRef(false);
  const syncIntervalRef = useRef(null);

  useEffect(() => {
    // Check for existing session
    // In App.tsx, replace the checkSession function:
    const checkSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch profile with wallet and preferences
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(
              `
          *,
          user_wallet(*),
          user_preferences(*)
        `
            )
            .eq("id", session.user.id)
            .single();

          // If profile doesn't exist, create all three tables
          if (profileError && profileError.code === "PGRST116") {
            // Profile doesn't exist - create it
            const newUsername = session.user.email?.split("@")[0] || "Player";

            await supabase.from("profiles").insert([
              {
                id: session.user.id,
                username: newUsername,
                email: session.user.email,
              },
            ]);

            await supabase.from("user_wallet").insert([
              {
                user_id: session.user.id,
                chips: 15000,
                level: 1,
                experience: 0,
              },
            ]);

            await supabase.from("user_preferences").insert([
              {
                user_id: session.user.id,
                theme_preference: "orange",
                preferences: {
                  sound: true,
                  theme: "orange",
                  notifications: true,
                },
              },
            ]);

            // Set the profile with default values
            const defaultProfile = {
              id: session.user.id,
              email: session.user.email,
              username: newUsername,
              chips: 15000,
              level: 1,
              experience: 0,
              theme_preference: "orange",
              preferences: {
                sound: true,
                theme: "orange",
                notifications: true,
              },
              created_at: new Date().toISOString(),
            };

            setUser(session.user);
            setProfile(defaultProfile);
          } else if (profileData && !profileError) {
            // Check if wallet or preferences are missing and create them
            if (!profileData.user_wallet) {
              await supabase.from("user_wallet").insert([
                {
                  user_id: session.user.id,
                  chips: 15000,
                  level: 1,
                  experience: 0,
                },
              ]);
            }

            if (!profileData.user_preferences) {
              await supabase.from("user_preferences").insert([
                {
                  user_id: session.user.id,
                  theme_preference: "orange",
                  preferences: {
                    sound: true,
                    theme: "orange",
                    notifications: true,
                  },
                },
              ]);
            }

            // Flatten the profile data
            const flatProfile = {
              ...profileData,
              chips: profileData.user_wallet?.chips || 15000,
              level: profileData.user_wallet?.level || 1,
              experience: profileData.user_wallet?.experience || 0,
              theme_preference:
                profileData.user_preferences?.theme_preference || "orange",
              preferences: profileData.user_preferences?.preferences || {
                sound: true,
                theme: "orange",
                notifications: true,
              },
            };

            setUser(session.user);
            setProfile(flatProfile); // ✅ Use flatProfile, not profileData!
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
    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Sync chips every 30 seconds - FIXED: Only depends on user.id
  useEffect(() => {
    // Clear any existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    if (!user?.id) return;

    const syncChips = async () => {
      if (isSyncing.current) return;
      if (!isSupabaseAvailable()) return;

      isSyncing.current = true;

      try {
        const { data: walletData, error } = await supabase
          .from("user_wallet")
          .select("chips, level, experience")
          .eq("user_id", user.id)
          .single();

        if (walletData && !error) {
          setProfile((prev) => {
            if (!prev) return prev;

            // Only update if values changed
            if (
              prev.chips === walletData.chips &&
              prev.level === walletData.level &&
              prev.experience === walletData.experience
            ) {
              return prev;
            }

            return {
              ...prev,
              chips: walletData.chips,
              level: walletData.level,
              experience: walletData.experience,
            };
          });
        }
      } catch (error) {
        // Silent error handling
      } finally {
        isSyncing.current = false;
      }
    };

    // Only set up sync if Supabase is available
    if (isSupabaseAvailable()) {
      // Initial sync after 2 seconds
      setTimeout(syncChips, 2000);

      // Set up interval for every 30 seconds
      syncIntervalRef.current = setInterval(syncChips, 1000);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [user?.id]); // ✅ FIXED: Only depends on user.id, NOT profile

  const handleAuthSuccess = (userData: any, profileData: any) => {
    setUser(userData);
    setProfile(profileData);
  };

  // Skip auth check - go straight to dashboard with mock user
  const mockUser = user || {
    id: 'dev-user-123',
    email: 'dev@test.com'
  };

  const mockProfile = profile || {
    id: 'dev-user-123',
    email: 'dev@test.com',
    username: 'DevUser',
    chips: 50000,
    level: 1,
    experience: 0,
    theme_preference: 'orange',
    preferences: {
      sound: true,
      theme: 'orange',
      notifications: true
    }
  };

  return (
    <div className="min-h-screen h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <BrowserRouter>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Add game route - accessible without auth */}
          <Route
            path="/play/:gameId"
            element={<GameContainer />}
          />

          <Route
            path="/*"
            element={<Dashboard user={mockUser} profile={mockProfile} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
