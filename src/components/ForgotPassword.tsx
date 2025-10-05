import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setMessage(
        "A password reset link has been sent to your email. Please check your inbox (and spam folder)."
      );
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="public/images/banner_image.png"
            alt="Background Banner"
            className="w-full h-full object-cover opacity-25 blur-xs scale-105"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-md mx-auto my-4 sm:my-6 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-lg border border-orange-500/30 rounded-2xl p-6 sm:p-8 shadow-xl shadow-orange-500/20">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-6">
          Reset Your Password
        </h2>

        {/* Success Message */}
        {message && (
          <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-3 mb-4">
            <p className="text-orange-300 text-sm text-center" role="status">
              {message}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 mb-4 animate-pulse">
            <p className="text-red-300 text-sm text-center" role="alert">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleResetPassword}
          className="space-y-4 sm:space-y-5"
          aria-label="Forgot Password Form"
        >
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setMessage("");
              }}
              placeholder="Enter your email"
              required
              className="w-full bg-gray-700/50 border border-gray-600/30 rounded-lg pl-12 pr-4 py-3.5 sm:py-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
              aria-label="Email"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 sm:py-4 rounded-lg font-bold text-lg touch-none hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2"
            aria-label="Send Reset Link"
            aria-busy={loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Back to Sign In */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-gray-400 text-sm">
            Remember your password?{" "}
            <a
              href="/"
              className="text-orange-400 hover:text-orange-300 transition-colors duration-200 touch-none"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>

      {/* Custom CSS for animations and custom blur */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .blur-xs {
          filter: blur(2px);
        }

        @media (max-width: 768px) {
          .max-w-md {
            max-width: 90%;
            margin-left: 1rem;
            margin-right: 1rem;
          }
          .p-6 {
            padding: 1.25rem;
          }
          .p-8 {
            padding: 1.5rem;
          }
          .text-2xl {
            font-size: 1.5rem;
          }
          .text-base {
            font-size: 0.875rem;
          }
          .space-y-4 {
            margin-bottom: 0.5rem;
          }
          .space-y-5 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 1rem;
          }
        }

        @media (hover: none) {
          .hover\\:text-orange-400:hover,
          .hover\\:text-orange-300:hover,
          .hover\\:from-orange-600:hover,
          .hover\\:to-red-600:hover {
            background: inherit;
            color: inherit;
          }
          .hover\\:scale-\\[1\\.02\\]:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
