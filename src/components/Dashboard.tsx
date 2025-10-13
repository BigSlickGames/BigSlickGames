import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import Header from "./Header";
import Footer from "./Footer";

import GamesGrid from "./GamesGrid";
import ProfileCard from "./ProfileCard";
import FriendsPanel from "./FriendsPanel";
import DailyBonusModal from "./DailyBonusModal";
import MiniGames from "./UpcomingGames";
import ScrollingAds from "./ScrollingAds";
import Missions from "./Missions";
import IntegratedChat from "./IntegratedChat";
import Shop from "./Shop";
import ShopSidebar from "./ShopSidebar";
import ProfileSettings from "./ProfileSettings";
import Forum from "./Forum";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfUse from "./TermsOfService";
import CommunityRules from "./CommunityRules";
import Leaderboard from "./Leaderboard";

interface User {
  id: string;
  email: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  chips: number;
  created_at: string;
  country?: string | null;
  level?: number;
  experience?: number;
}

interface DashboardProps {
  user: User;
  profile: UserProfile;
}

export default function Dashboard({
  user,
  profile: initialProfile,
}: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "shop"
    | "missions"
    | "settings"
    | "forum"
    | "leaderboard"
    | "privacy"
    | "terms"
    | "rules"
  >("dashboard");
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({
    games: false,
    profile: false,
    friends: false,
    chat: false,
    upcoming: false,
    ads: false,
    shop: false,
    contacts: true, // Start collapsed on mobile to save space
  });

  // Animation states
  const [animationStage, setAnimationStage] = useState(0);
  const [showElements, setShowElements] = useState({
    header: false,
    banner: false,
    bannerShake: false,
    ads: false,
    leftSidebar: false,
    gamesGrid: false,
    rightSidebar: false,
    legalLinks: false,
  });

  // Trigger animation sequence on mount
  useEffect(() => {
    if (activeView === "dashboard") {
      const animationSequence = [
        { element: "header", delay: 100 },
        { element: "ads", delay: 500 },
        { element: "leftSidebar", delay: 600 },
        { element: "gamesGrid", delay: 700 },
        { element: "rightSidebar", delay: 800 },
        { element: "legalLinks", delay: 900 },
        { element: "banner", delay: 1000 },
      ];

      animationSequence.forEach(({ element, delay }) => {
        setTimeout(() => {
          setShowElements((prev) => ({ ...prev, [element]: true }));
        }, delay);
      });

      // Banner shake effect after it appears
      setTimeout(() => {
        setShowElements((prev) => ({ ...prev, bannerShake: true }));
        // Remove shake after animation
        setTimeout(() => {
          setShowElements((prev) => ({ ...prev, bannerShake: false }));
        }, 600);
      }, 1050);
    } else {
      // Reset animations when switching views
      setShowElements({
        header: true,
        banner: true,
        bannerShake: false,
        ads: true,
        leftSidebar: true,
        gamesGrid: true,
        rightSidebar: true,
        legalLinks: true,
      });
    }
  }, [activeView]);

  // Update profile when initialProfile changes (from parent sync)
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const checkDailyBonus = (profile: UserProfile) => {
    const lastLogin = new Date(profile.last_login);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      setShowDailyBonus(true);
    }
  };

  const claimDailyBonus = async () => {
    try {
      const newChipAmount = profile.chips + 1000;
      setProfile((prev) => ({ ...prev, chips: newChipAmount }));
    } catch (error) {
      console.error("Error claiming daily bonus:", error);
    }
    setShowDailyBonus(false);
  };

  const handlePurchase = (newChipBalance: number) => {
    // Update profile chips locally
    setProfile((prev) => ({ ...prev, chips: newChipBalance }));
  };

  const handleGameClick = (gameId: string) => {
    if (gameId === "racing-suits") {
      // Navigate to internal game route
      window.location.href = "/play/racing-suits";
      return;
    }

    if (gameId === "space-crash") {
      // Navigate to internal game route
      window.location.href = "/play/space-crash";
      return;
    }
    const gameUrls = {
      "stack-em": "https://create-iphone-templa-hb73.bolt.host/",
      "sink-em": "https://deck-realms-card-builder.netlify.app/",
      "hold-em": "https://21-holdem.netlify.app/",
      "multi-up": "https://21-multiup.netlify.app/",
      pokeroply: "https://pokeroply.netlify.app/",
      "racing-suits": "https://clean-blank-project-07sc.bolt.host/",
    };

    const gameUrl = gameUrls[gameId as keyof typeof gameUrls];
    if (!gameUrl) {
      console.log(`Game ${gameId} not yet configured`);
      return;
    }

    // Generate cross-app authentication token
    const authToken = {
      email: profile.email,
      username: profile.username,
      chips: profile.chips || 0,
      level: profile.level,
      experience: profile.experience || 0,
      country: profile.country,
      app: gameId,
      timestamp: Date.now(),
    };

    // Encode the token
    const encodedToken = btoa(JSON.stringify(authToken));

    // Create URL with authentication token
    const authenticatedUrl = `${gameUrl}?authToken=${encodedToken}`;

    console.log("🚀 Opening game with authentication:", {
      game: gameId,
      user: profile.username,
      url: authenticatedUrl,
    });

    // Open game in new tab with authentication
    window.open(authenticatedUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-full relative bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Pinstripe and gradient background overlay */}
      <div className="absolute inset-0 opacity-30">
        {/* Diagonal pinstripes */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(249, 115, 22, 0.1) 2px,
              rgba(249, 115, 22, 0.1) 4px,
              transparent 4px,
              transparent 8px,
              rgba(156, 163, 175, 0.1) 8px,
              rgba(156, 163, 175, 0.1) 10px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 6px,
              rgba(239, 68, 68, 0.05) 6px,
              rgba(239, 68, 68, 0.05) 8px
            )
          `,
          }}
        ></div>

        {/* Vertical gradient stripes */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(249, 115, 22, 0.08) 40px,
              rgba(249, 115, 22, 0.08) 42px,
              transparent 42px,
              transparent 80px,
              rgba(156, 163, 175, 0.06) 80px,
              rgba(156, 163, 175, 0.06) 82px
            )
          `,
          }}
        ></div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-gray-900/20"></div>
      </div>

      {/* Animated Header */}
      <div
        className={`transform transition-all duration-300 ease-out ${
          showElements.header
            ? "translate-y-0 opacity-100"
            : "-translate-y-20 opacity-0"
        }`}
      >
        <Header
          profile={profile}
          onShopClick={() => setActiveView("shop")}
          onMissionsClick={() => setActiveView("missions")}
          onSettingsClick={() => setActiveView("settings")}
          onForumClick={() => setActiveView("forum")}
          onLeaderboardClick={() => setActiveView("leaderboard")}
          onHomeClick={() => setActiveView("dashboard")} // ✅ Add this line
        />
      </div>

      {/* Mobile Banner - Only visible on mobile, after header */}
      {activeView === "dashboard" && (
        <div
          className={`block lg:hidden transform transition-all duration-300 ease-out ${
            showElements.banner
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-95"
          } ${showElements.bannerShake ? "animate-bounce" : ""}`}
        >
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-orange-500/40">
            <img
              src="/images/banner_image.png"
              alt="BigSlick Games Banner"
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}

      <main className="relative z-10 container mx-auto px-4 py-8 pb-32 flex-1">
        {/* Animated Legal Links */}
        {/* <div
          className={`mb-6 text-center transform transition-all duration-200 ease-out ${
            showElements.legalLinks
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-98"
          }`}
        >
          <div className="flex flex-wrap justify-center items-center space-x-4 text-sm">
            <button
              onClick={() => setActiveView("privacy")}
              className="text-gray-400 hover:text-blue-400 transition-colors underline"
            >
              Privacy Policy
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => setActiveView("terms")}
              className="text-gray-400 hover:text-purple-400 transition-colors underline"
            >
              Terms of Use
            </button>
            <span className="text-gray-600">•</span>
            <button
              onClick={() => setActiveView("rules")}
              className="text-gray-400 hover:text-green-400 transition-colors underline"
            >
              Community Rules
            </button>
          </div>
        </div> */}

        {/* Animated Scrolling Advertisement Banner */}
        {/* Only show ads on dashboard view */}
        {activeView === "dashboard" && (
          <div
            className={`transform transition-all duration-300 ease-out ${
              showElements.ads
                ? "translate-x-0 opacity-100"
                : "-translate-x-20 opacity-0"
            }`}
          >
            <CollapsibleSection
              id="ads"
              title="Game Promotions"
              isCollapsed={collapsedSections.ads}
              onToggle={() => toggleSection("ads")}
            >
              <ScrollingAds onGameClick={handleGameClick} />
            </CollapsibleSection>
          </div>
        )}

        {activeView === "dashboard" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 min-h-screen">
            {/* Animated Left Sidebar */}
            <div
              className={`hidden lg:block lg:col-span-1 space-y-6 transform transition-all duration-400 ease-out ${
                showElements.leftSidebar
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-16 opacity-0"
              }`}
            >
              <CollapsibleSection
                id="profile"
                title="Player Overview"
                isCollapsed={collapsedSections.profile}
                onToggle={() => toggleSection("profile")}
              >
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl shadow-orange-500/10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/50">
                      <span className="text-white text-xl font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {profile.username}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Player since {new Date(profile.created_at).getFullYear()}
                    </p>
                  </div>

                  {/* XP Level Status */}
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Level</span>
                      <span className="text-white font-bold text-sm">
                        Level {profile.level || 1}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500 shadow-sm shadow-orange-500/50"
                        style={{
                          width: `${Math.min(
                            ((profile.experience || 0) /
                              (1000 * (profile.level || 1))) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {(profile.experience || 0).toLocaleString()} /{" "}
                      {(1000 * (profile.level || 1)).toLocaleString()} XP to
                      next level
                    </p>
                  </div>

                  {/* Current Bankroll */}
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <span className="text-gray-400 text-sm">
                        Current Bankroll
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-yellow-400 text-xl font-bold">
                        {(profile.chips || 0).toLocaleString()}
                      </span>
                      <span className="text-yellow-400 text-sm">chips</span>
                    </div>
                  </div>

                  <div className="text-center">
                    {false && (
                      <button
                        onClick={() => setActiveView("missions")}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all text-sm shadow-lg shadow-purple-500/30 touch-manipulation"
                      >
                        View All Missions
                      </button>
                    )}
                  </div>
                </div>
              </CollapsibleSection>

              {false && (
                <CollapsibleSection
                  id="friends"
                  title="Friends"
                  isCollapsed={collapsedSections.friends}
                  onToggle={() => toggleSection("friends")}
                >
                  <FriendsPanel userId={user.id} />
                </CollapsibleSection>
              )}

              <CollapsibleSection
                id="contacts"
                title="Contact Us"
                isCollapsed={collapsedSections.contacts}
                onToggle={() => toggleSection("contacts")}
              >
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-xl shadow-orange-500/10 overflow-visible">
                  {/* Modern Glass Header */}
                  <div className="relative h-16 bg-gradient-to-r from-gray-800/60 via-gray-700/40 to-gray-800/60 backdrop-blur-xl border-b border-white/10 rounded-t-2xl overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-lg">
                          Get in Touch
                        </h3>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="text-center space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <h4 className="text-white font-semibold mb-2">
                          Support & Inquiries
                        </h4>
                        <a
                          href="mailto:bigslickgames@gmail.com"
                          className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                        >
                          bigslickgames@gmail.com
                        </a>
                        <p className="text-gray-400 text-sm mt-2">
                          We typically respond within 24 hours
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                          <p className="text-gray-400 text-sm mb-1">
                            Technical Support
                          </p>
                          <p className="text-white text-sm">
                            Game issues, bugs, account problems
                          </p>
                        </div>

                        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                          <p className="text-gray-400 text-sm mb-1">
                            Business Inquiries
                          </p>
                          <p className="text-white text-sm">
                            Partnerships, licensing, media
                          </p>
                        </div>

                        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                          <p className="text-gray-400 text-sm mb-1">Feedback</p>
                          <p className="text-white text-sm">
                            Suggestions, feature requests
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {false && (
                <CollapsibleSection
                  id="chat"
                  title="Chat"
                  isCollapsed={collapsedSections.chat}
                  onToggle={() => toggleSection("chat")}
                >
                  <IntegratedChat userId={user.id} />
                </CollapsibleSection>
              )}
            </div>

            {/* Animated Games Grid */}
            <div
              className={`lg:col-span-2 transform transition-all duration-500 ease-out ${
                showElements.gamesGrid
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-12 opacity-0 scale-95"
              }`}
            >
              <CollapsibleSection
                id="games"
                title="Available Games"
                isCollapsed={collapsedSections.games}
                onToggle={() => toggleSection("games")}
              >
                <GamesGrid profile={profile} onGameClick={handleGameClick} />
              </CollapsibleSection>
            </div>

            {/* Animated Right Sidebar */}
            <div
              className={`lg:col-span-1 space-y-6 transform transition-all duration-400 ease-out ${
                showElements.rightSidebar
                  ? "translate-x-0 opacity-100"
                  : "translate-x-16 opacity-0"
              }`}
            >
              <CollapsibleSection
                id="minigames"
                title="Mini Games"
                isCollapsed={collapsedSections.minigames}
                onToggle={() => toggleSection("minigames")}
              >
                <MiniGames />
              </CollapsibleSection>
            </div>
          </div>
        ) : activeView === "missions" ? (
          <div className="animate-fadeIn">
            <Missions
              profile={profile}
              onBack={() => setActiveView("dashboard")}
            />
          </div>
        ) : activeView === "settings" ? (
          <div className="animate-fadeIn">
            <ProfileSettings
              profile={profile}
              onBack={() => setActiveView("dashboard")}
              onProfileUpdate={setProfile}
            />
          </div>
        ) : activeView === "forum" ? (
          false ? (
            <div className="animate-fadeIn">
              <Forum
                profile={profile}
                onBack={() => setActiveView("dashboard")}
              />
            </div>
          ) : null
        ) : activeView === "privacy" ? (
          <div className="animate-fadeIn">
            <PrivacyPolicy onBack={() => setActiveView("dashboard")} />
          </div>
        ) : activeView === "terms" ? (
          <div className="animate-fadeIn">
            <TermsOfUse onBack={() => setActiveView("dashboard")} />
          </div>
        ) : activeView === "rules" ? (
          <div className="animate-fadeIn">
            <CommunityRules onBack={() => setActiveView("dashboard")} />
          </div>
        ) : activeView === "leaderboard" ? (
          <div className="animate-fadeIn">
            <Leaderboard
              profile={profile}
              onBack={() => setActiveView("dashboard")}
            />
          </div>
        ) : (
          <div className="animate-fadeIn">
            <Shop
              profile={profile}
              onPurchase={handlePurchase}
              onBack={() => setActiveView("dashboard")}
            />
          </div>
        )}
      </main>
      <Footer onSetActiveView={setActiveView} />
      <DailyBonusModal
        isOpen={showDailyBonus}
        onClaim={claimDailyBonus}
        onClose={() => setShowDailyBonus(false)}
      />
    </div>
  );
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  id,
  title,
  isCollapsed,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 w-full text-left mb-3 p-2 rounded-lg hover:bg-gray-800/30 transition-all group touch-manipulation"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
        )}
        <h3 className="text-white font-semibold text-sm sm:text-base group-hover:text-orange-100 transition-colors">
          {title}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent"></div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed
            ? "max-h-0 opacity-0 overflow-hidden"
            : "max-h-[2000px] opacity-100 overflow-visible"
        }`}
      >
        <div className="transform transition-transform duration-300 ease-in-out">
          {children}
        </div>
      </div>
    </div>
  );
}
