import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AuthScreenProps {
  onAuthSuccess: (user: any, profile: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<{
    level: string;
    message: string;
    color: string;
  }>({ level: "", message: "", color: "" });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const checkPasswordStrength = (password: string) => {
    let strength = { level: "", message: "", color: "" };
    if (password.length === 0) {
      return strength;
    }
    if (password.length < 6) {
      strength = {
        level: "Weak",
        message: "Password is too short (minimum 6 characters).",
        color: "#ef4444",
      };
    } else if (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      strength = {
        level: "Strong",
        message: "Great! Your password is strong.",
        color: "#22c55e",
      };
    } else if (password.length >= 8) {
      strength = {
        level: "Medium",
        message:
          "Good, but add special characters or numbers for more strength.",
        color: "#f97316",
      };
    } else {
      strength = {
        level: "Weak",
        message:
          "Try adding uppercase letters, numbers, or special characters.",
        color: "#ef4444",
      };
    }
    return strength;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setMessage("");
    if (name === "password" && isSignUp) {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (passwordStrength.level === "Weak") {
      setError("Please choose a stronger password.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { username: formData.username },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        if (authData.user.email_confirmed_at) {
          // Create profile in profiles table
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: authData.user.id,
                username: formData.username,
                email: authData.user.email,
              },
            ]);

          if (profileError) throw profileError;

          // Create wallet entry
          const { error: walletError } = await supabase
            .from("user_wallet")
            .insert([
              {
                user_id: authData.user.id,
                chips: 25000,
                level: 1,
                experience: 0,
              },
            ]);

          if (walletError) throw walletError;

          // Create preferences entry
          const { error: prefsError } = await supabase
            .from("user_preferences")
            .insert([
              {
                user_id: authData.user.id,
                theme_preference: "orange",
                preferences: {
                  sound: true,
                  theme: "orange",
                  notifications: true,
                },
              },
            ]);

          if (prefsError) throw prefsError;

          const profileData = {
            id: authData.user.id,
            email: authData.user.email,
            username: formData.username,
            chips: 25000,
            level: 1,
            experience: 0,
            games_played: 0,
            games_won: 0,
            theme_preference: "orange",
            preferences: {
              sound: true,
              theme: "orange",
              notifications: true,
            },
          };

          onAuthSuccess(authData.user, profileData);
        } else {
          setMessage(
            "Please check your email to verify your account before signing in."
          );
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (authError) throw authError;

      if (authData.user) {
        if (authData.user.email_confirmed_at) {
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116")
            throw profileError;

          // Fetch wallet data
          const { data: walletData, error: walletError } = await supabase
            .from("user_wallet")
            .select("*")
            .eq("user_id", authData.user.id)
            .single();

          if (walletError && walletError.code !== "PGRST116") throw walletError;

          // Fetch preferences data
          const { data: prefsData, error: prefsError } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", authData.user.id)
            .single();

          if (prefsError && prefsError.code !== "PGRST116") throw prefsError;

          // If any data is missing, create default entries
          if (!profileData) {
            await supabase.from("profiles").insert([
              {
                id: authData.user.id,
                username: authData.user.email?.split("@")[0] || "Player",
                email: authData.user.email,
              },
            ]);
          }

          if (!walletData) {
            await supabase.from("user_wallet").insert([
              {
                user_id: authData.user.id,
                chips: 15000,
                level: 1,
                experience: 0,
              },
            ]);
          }

          if (!prefsData) {
            await supabase.from("user_preferences").insert([
              {
                user_id: authData.user.id,
                theme_preference: "orange",
                preferences: {
                  sound: true,
                  theme: "orange",
                  notifications: true,
                },
              },
            ]);
          }

          // Combine all data for the app
          const combinedProfile = {
            id: authData.user.id,
            email: profileData?.email || authData.user.email,
            username:
              profileData?.username ||
              authData.user.email?.split("@")[0] ||
              "Player",
            chips: walletData?.chips || 15000,
            level: walletData?.level || 1,
            experience: walletData?.experience || 0,
            games_played: walletData?.games_played || 0,
            games_won: walletData?.games_won || 0,
            theme_preference: prefsData?.theme_preference || "orange",
            preferences: prefsData?.preferences || {
              sound: true,
              theme: "orange",
              notifications: true,
            },
          };

          onAuthSuccess(authData.user, combinedProfile);
        } else {
          setError("Please verify your email address before signing in.");
        }
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: "https://bigslickgames.com/reset-password",
      });

      if (error) throw error;

      setResetMessage("Check your email for a password reset link.");
      setTimeout(() => setShowForgotPassword(false), 3000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setResetError(error.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #111827, #1f2937, #000000);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .auth-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .auth-background-inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-background-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.25;
          filter: blur(2px);
          transform: scale(1.05);
        }

        .auth-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .auth-modal {
          background: linear-gradient(to bottom right, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95));
          backdrop-filter: blur(8px);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 1rem;
          padding: 1.5rem;
          max-width: 28rem;
          width: 100%;
          margin: 0 1rem;
        }

        .auth-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .auth-modal-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #ffffff;
        }

        .auth-close-button {
          color: #d1d5db;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .auth-close-button:hover {
          color: #f97316;
        }

        .auth-success-message {
          background: rgba(249, 115, 22, 0.2);
          border: 1px solid rgba(249, 115, 22, 0.4);
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }

        .auth-error-message {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
          animation: auth-pulse 1.5s ease-in-out infinite;
        }

        @keyframes auth-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .auth-message-text {
          color: #f4d4a6;
          font-size: 0.875rem;
          text-align: center;
        }

        .auth-error-text {
          color: #fca5a5;
        }

        .auth-signup-container {
          text-align: center;
          margin-top: 1rem;
        }

        .auth-signup-button {
          background: linear-gradient(to right, #f97316, #dc2626);
          color: #ffffff;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .auth-signup-button:hover {
          background: linear-gradient(to right, #ea580c, #b91c1c);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-input-container {
          position: relative;
        }

        .auth-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f97316;
          width: 1.25rem;
          height: 1.25rem;
        }

        .auth-input {
          width: 100%;
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 0.5rem;
          padding: 0.875rem 0.875rem 0.875rem 3rem;
          color: #ffffff;
          font-size: 0.875rem;
        }

        .auth-input::placeholder {
          color: #d1d5db;
        }

        .auth-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #f97316;
          border-color: #f97316;
        }

        .auth-submit-button {
          width: 100%;
          background: linear-gradient(to right, #f97316, #dc2626);
          color: #ffffff;
          padding: 0.875rem;
          border-radius: 0.5rem;
          font-weight: bold;
          font-size: 1.125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          transform: scale(1);
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
        }

        .auth-submit-button:hover:not(:disabled) {
          background: linear-gradient(to right, #ea580c, #b91c1c);
          transform: scale(1.02);
        }

        .auth-submit-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .auth-submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-spinner {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: auth-spin 1s linear infinite;
        }

        @keyframes auth-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .auth-password-strength {
          margin-top: 0.5rem;
        }

        .auth-strength-bar {
          height: 4px;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .auth-strength-text {
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .auth-main-content {
          position: relative;
          z-index: 20;
          width: 100%;
          max-width: 64rem;
          margin: 1rem auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .auth-platform-info {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #ffffff;
          padding: 1.5rem;
          text-align: center;
        }

        .auth-platform-title {
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 1rem;
          background: linear-gradient(to right, #f97316, #dc2626);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .auth-platform-details {
          display: none;
        }

        .auth-platform-text {
          font-size: 1rem;
          color: #e5e7eb;
          margin-bottom: 1rem;
        }

        .auth-feature-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          color: #d1d5db;
          font-size: 0.875rem;
          list-style: none;
          padding: 0;
        }

        .auth-feature-item {
          display: flex;
          align-items: center;
        }

        .auth-bullet {
          color: #f97316;
          margin-right: 0.5rem;
        }

        .auth-call-to-action {
          font-size: 1rem;
          color: #f97316;
          font-weight: 600;
          margin-top: 1rem;
        }

        .auth-form-card {
          width: 100%;
          background: linear-gradient(to bottom right, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95));
          backdrop-filter: blur(8px);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
        }

        .auth-form-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #ffffff;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .auth-toggle-buttons {
          display: flex;
          background: rgba(31, 41, 55, 0.6);
          border-radius: 0.5rem;
          padding: 0.25rem;
          margin-bottom: 1.5rem;
        }

        .auth-toggle-button {
          flex: 1;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 600;
          color: #d1d5db;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .auth-toggle-button:hover {
          color: #ffffff;
          background: rgba(55, 65, 81, 0.5);
        }

        .auth-toggle-button.active {
          background: linear-gradient(to right, #f97316, #dc2626);
          color: #ffffff;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }

        .auth-password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #d1d5db;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }

        .auth-password-toggle:hover {
          color: #f97316;
        }

        .auth-forgot-password-container {
          text-align: right;
        }

        .auth-forgot-password-link {
          font-size: 0.875rem;
          color: #f97316;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .auth-forgot-password-link:hover {
          color: #fdba74;
        }

        .auth-terms-container {
          text-align: center;
          margin-top: 1rem;
        }

        .auth-terms-text {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .auth-link {
          color: #f97316;
          text-decoration: none;
          transition: color 0.2s;
        }

        .auth-link:hover {
          color: #fdba74;
        }

        .auth-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        @media (min-width: 768px) {
          .auth-container {
            padding: 1.5rem;
          }

          .auth-modal {
            padding: 2rem;
          }

          .auth-modal-title {
            font-size: 1.5rem;
          }

          .auth-main-content {
            flex-direction: row;
            gap: 2rem;
            margin: 1.5rem auto;
          }

          .auth-platform-info {
            width: 50%;
            padding: 2rem;
            text-align: left;
          }

          .auth-platform-title {
            font-size: 2.25rem;
          }

          .auth-platform-details {
            display: block;
          }

          .auth-platform-text {
            font-size: 1.125rem;
          }

          .auth-feature-list {
            font-size: 1rem;
          }

          .auth-call-to-action {
            font-size: 1.125rem;
          }

          .auth-form-card {
            width: 50%;
            padding: 2rem;
          }

          .auth-form-title {
            font-size: 1.5rem;
          }

          .auth-form {
            gap: 1.25rem;
          }

          .auth-input {
            padding: 1rem 0.875rem 1rem 3rem;
            font-size: 1rem;
          }

          .auth-submit-button {
            padding: 1rem;
          }

          .auth-terms-container {
            margin-top: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .auth-main-content {
            max-width: 90%;
            margin-left: 1rem;
            margin-right: 1rem;
          }

          .auth-modal {
            max-width: 90%;
          }
        }

        @media (hover: none) {
          .auth-close-button:hover,
          .auth-signup-button:hover,
          .auth-submit-button:hover,
          .auth-toggle-button:hover,
          .auth-password-toggle:hover,
          .auth-forgot-password-link:hover,
          .auth-link:hover {
            background: inherit;
            color: inherit;
            transform: none;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-background">
          <div className="auth-background-inner">
            <img
              src="/images/banner_image.png"
              alt="Background Banner"
              className="auth-background-image"
            />
          </div>
        </div>

        {showForgotPassword && (
          <div className="auth-modal-overlay">
            <div className="auth-modal">
              <div className="auth-modal-header">
                <h2 className="auth-modal-title">Reset Your Password</h2>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="auth-close-button"
                  aria-label="Close modal"
                >
                  <X className="auth-icon" />
                </button>
              </div>

              {resetMessage && (
                <div className="auth-success-message">
                  <p className="auth-message-text" role="status">
                    {resetMessage}
                  </p>
                </div>
              )}

              {resetError && (
                <div className="auth-error-message">
                  <p className="auth-message-text auth-error-text" role="alert">
                    {resetError}
                  </p>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="auth-input-container">
                  <Mail className="auth-input-icon" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="auth-input"
                    aria-label="Email for password reset"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-button"
                  aria-label="Send Reset Link"
                  aria-busy={loading}
                >
                  {loading ? (
                    <div className="auth-spinner"></div>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="auth-icon" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="auth-main-content">
          <div className="auth-platform-info">
            <h1 className="auth-platform-title">Unleash Your Gaming Legend</h1>
            <div className="auth-platform-details">
              <p className="auth-platform-text">
                Join a vibrant community of gamers, battle for epic rewards, and
                dominate the leaderboards. Your adventure starts now!
              </p>
              <ul className="auth-feature-list">
                <li className="auth-feature-item">
                  <span className="auth-bullet">•</span> Challenge friends in
                  thrilling multiplayer games
                </li>
                <li className="auth-feature-item">
                  <span className="auth-bullet">•</span> Win big with exclusive
                  chips and prizes
                </li>
                <li className="auth-feature-item">
                  <span className="auth-bullet">•</span> Personalize your
                  profile with unique themes
                </li>
              </ul>
              <p className="auth-call-to-action">
                Sign up today and start your journey to glory!
              </p>
            </div>
          </div>

          <div className="auth-form-card">
            <h2 className="auth-form-title">
              {isSignUp ? "Join the Game" : "Welcome Back"}
            </h2>

            {message && (
              <div className="auth-success-message">
                <p className="auth-message-text" role="status">
                  {message}
                </p>
              </div>
            )}

            {error && (
              <div className="auth-error-message">
                <p className="auth-message-text auth-error-text" role="alert">
                  {error}
                </p>
              </div>
            )}

            <div className="auth-toggle-buttons">
              <button
                onClick={() => setIsSignUp(false)}
                aria-label="Sign In"
                className={`auth-toggle-button ${!isSignUp ? "active" : ""}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                aria-label="Sign Up"
                className={`auth-toggle-button ${isSignUp ? "active" : ""}`}
              >
                Sign Up
              </button>
            </div>

            <form
              onSubmit={isSignUp ? handleSignUp : handleSignIn}
              className="auth-form"
              aria-label={isSignUp ? "Sign Up Form" : "Sign In Form"}
            >
              {isSignUp && (
                <div className="auth-input-container">
                  <User className="auth-input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    required={isSignUp}
                    className="auth-input"
                    aria-label="Username"
                  />
                </div>
              )}

              <div className="auth-input-container">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="auth-input"
                  aria-label="Email"
                />
              </div>

              <div className="auth-input-container">
                <Lock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="auth-input"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="auth-icon" />
                  ) : (
                    <Eye className="auth-icon" />
                  )}
                </button>
              </div>

              {isSignUp && passwordStrength.level && (
                <div className="auth-password-strength">
                  <div
                    className="auth-strength-bar"
                    style={{
                      backgroundColor: passwordStrength.color,
                      width:
                        passwordStrength.level === "Weak"
                          ? "33%"
                          : passwordStrength.level === "Medium"
                            ? "66%"
                            : "100%",
                    }}
                  ></div>
                  <p
                    className="auth-strength-text"
                    style={{ color: passwordStrength.color }}
                  >
                    Password Strength: {passwordStrength.level} -{" "}
                    {passwordStrength.message}
                  </p>
                </div>
              )}

              {!isSignUp && (
                <div className="auth-forgot-password-container">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="auth-forgot-password-link"
                    aria-label="Forgot Password"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-button"
                aria-label={isSignUp ? "Create Account" : "Sign In"}
                aria-busy={loading}
              >
                {loading ? (
                  <div className="auth-spinner"></div>
                ) : (
                  <>
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                    <ArrowRight className="auth-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-terms-container">
              <p className="auth-terms-text">
                By signing up, you agree to our{" "}
                <a href="/terms" className="auth-link">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="auth-link">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
