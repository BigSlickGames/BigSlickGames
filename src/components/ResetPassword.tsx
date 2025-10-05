import React, { useState, useEffect } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(""); // Track strength
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Evaluate password strength
  const evaluatePasswordStrength = (password: string) => {
    let strength = "Weak";
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    if (
      length >= 12 &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChars
    ) {
      strength = "Strong";
    } else if (length >= 8 && hasUpperCase && hasLowerCase && hasNumbers) {
      strength = "Medium";
    } else if (length >= 6) {
      strength = "Weak";
    } else {
      strength = "";
    }
    setPasswordStrength(strength);
  };

  // Update password strength whenever newPassword changes
  useEffect(() => {
    evaluatePasswordStrength(newPassword);
  }, [newPassword]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMessage("Enter your new password below.");
      } else if (!session) {
        setError("Invalid or expired reset link. Please try again.");
      }
    });
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage("Password updated successfully! Redirecting to sign-in...");
      setTimeout(() => navigate("/auth"), 3000);
    } catch (error: any) {
      console.error("Password update error:", error);
      setError(error.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .reset-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #111827, #1f2937, #000000);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .reset-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .reset-background-inner {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reset-background-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.25;
          filter: blur(2px);
          transform: scale(1.05);
        }

        .reset-form-card {
          position: relative;
          z-index: 20;
          width: 100%;
          max-width: 28rem;
          background: linear-gradient(to bottom right, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95));
          backdrop-filter: blur(8px);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
        }

        .reset-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #ffffff;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .reset-success-message {
          background: rgba(249, 115, 22, 0.2);
          border: 1px solid rgba(249, 115, 22, 0.4);
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }

        .reset-error-message {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
          animation: reset-pulse 1.5s ease-in-out infinite;
        }

        @keyframes reset-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .reset-message-text {
          color: #fdba74;
          font-size: 0.875rem;
          text-align: center;
        }

        .reset-error-text {
          color: #fca5a5;
        }

        .reset-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .reset-input-container {
          position: relative;
        }

.reset-input-icon {
  position: absolute;
  left: 0.75rem;
  top: 20px;
  bottom: 0;
  display: flex;
  align-items: center; /* vertically centers with placeholder text line */
  color: #f97316;
  width: 1.25rem;
  height: 1.25rem;
  pointer-events: none; /* ensures click passes through */
}

        .reset-input {
          width: 100%;
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 0.5rem;
          padding: 0.875rem 0.875rem 0.875rem 3rem;
          color: #ffffff;
          font-size: 0.875rem;
        }

        .reset-input::placeholder {
          color: #d1d5db;
        }

        .reset-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #f97316;
          border-color: #f97316;
        }

        .reset-password-strength {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #ffffff;
          text-align: left;
        }

        .reset-strength-bar {
          height: 4px;
          border-radius: 2px;
          margin-top: 0.25rem;
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .reset-strength-weak {
          width: 33%;
          background-color: #ef4444; /* Red for weak */
        }

        .reset-strength-medium {
          width: 66%;
          background-color: #f97316; /* Orange for medium */
        }

        .reset-strength-strong {
          width: 100%;
          background-color: #22c55e; /* Green for strong */
        }

        .reset-submit-button {
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

        .reset-submit-button:hover:not(:disabled) {
          background: linear-gradient(to right, #ea580c, #b91c1c);
          transform: scale(1.02);
        }

        .reset-submit-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .reset-submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reset-spinner {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: reset-spin 1s linear infinite;
        }

        @keyframes reset-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .reset-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        @media (min-width: 640px) {
          .reset-container {
            padding: 1.5rem;
          }

          .reset-form-card {
            padding: 2rem;
          }

          .reset-title {
            font-size: 1.5rem;
          }

          .reset-form {
            gap: 1.25rem;
          }

          .reset-input {
            padding: 1rem 0.875rem 1rem 3rem;
            font-size: 1rem;
          }

          .reset-submit-button {
            padding: 1rem;
          }
        }

        @media (max-width: 768px) {
          .reset-form-card {
            max-width: 90%;
            margin-left: 1rem;
            margin-right: 1rem;
          }
        }

        @media (hover: none) {
          .reset-submit-button:hover {
            background: inherit;
            transform: none;
          }
        }
      `}</style>

      <div className="reset-container">
        <div className="reset-background">
          <div className="reset-background-inner">
            <img
              src="public/images/banner_image.png"
              alt="Background Banner"
              className="reset-background-image"
            />
          </div>
        </div>

        <div className="reset-form-card">
          <h2 className="reset-title">Set New Password</h2>

          {message && (
            <div className="reset-success-message">
              <p className="reset-message-text" role="status">
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="reset-error-message">
              <p className="reset-message-text reset-error-text" role="alert">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="reset-form">
            <div className="reset-input-container">
              <Lock className="reset-input-icon" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
                className="reset-input"
                aria-label="New Password"
              />
              {newPassword && (
                <div className="reset-password-strength">
                  <span>Password Strength: {passwordStrength}</span>
                  <div
                    className={`reset-strength-bar reset-strength-${passwordStrength.toLowerCase()}`}
                  ></div>
                </div>
              )}
            </div>
            <div className="reset-input-container">
              <Lock className="reset-input-icon" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                className="reset-input"
                aria-label="Confirm Password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="reset-submit-button"
              aria-label="Update Password"
              aria-busy={loading}
            >
              {loading ? (
                <div className="reset-spinner"></div>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="reset-icon" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
