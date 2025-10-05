import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    // Minimum splash time of 3 seconds, even if video is shorter
    const minTimer = setTimeout(() => {
      if (videoEnded) {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(minTimer);
  }, [videoEnded, onComplete]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    // If minimum time has passed, complete immediately
    setTimeout(() => {
      onComplete();
    }, 500); // Small delay for smooth transition
  };

  const handleVideoError = () => {
    console.warn('Video failed to load, proceeding to app');
    setTimeout(() => {
      onComplete();
    }, 2000); // Show for 2 seconds if video fails
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Video Background */}
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
      >
        <source src="/videos/splash.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/50 animate-pulse">
              <span className="text-white text-3xl font-bold">GH</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">GameHub</h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </video>

      {/* Loading Indicator Overlay */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">Loading GameHub...</span>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-black/70 transition-all text-sm font-medium"
      >
        Skip
      </button>
    </div>
  );
}