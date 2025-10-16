import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { LoginScreen } from "./components/LoginScreen";
import { ProfileDashboard } from "./components/ProfileDashboard";
import { PlayerProfile } from "./components/PlayerProfile";
import { Game21Stackem } from "./components/Game21Stackem";
import { Menu, User, Search, Gamepad2 } from "lucide-react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("game21stackem");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Profile Dashboard",
      icon: User,
      component: ProfileDashboard,
    },
  ];

  const CurrentComponent =
    menuItems.find((item) => item.id === currentView)?.component ||
    ProfileDashboard;

  if (loading) {
    return (
      <div className="min-h-screen gamehub-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? (
    <div className="h-screen overflow-hidden touch-none gamehub-background">
      {/* Main content */}
      <div>
        <CurrentComponent onLogout={handleLogout} />
      </div>
    </div>
  ) : (
    <LoginScreen />
  );
}

export default App;
