interface PlayerIconProps {
  color: string;
  suit: string;
  isLanded?: boolean;
  isRising?: boolean;
  elevation?: number;
}

export function PlayerIcon({
  color,
  suit,
  isLanded = false,
  isRising = false,
  elevation = 25,
}: PlayerIconProps) {
  // Use darker, more vibrant colors for better visibility
  const getSuitColor = () => {
    if (suit === "♥") {
      return "#DC143C"; // Crimson red for hearts
    } else if (suit === "♦") {
      return "#00CC00"; // Dark vibrant green for diamonds (instead of light green)
    } else if (suit === "♠") {
      return "#000000"; // Black for spades
    } else if (suit === "♣") {
      return "#0066FF"; // Dark vibrant blue for clubs (instead of light blue)
    }
    return "#ffffff"; // White fallback
  };

  const suitColor = getSuitColor();

  // Brighten the player color for better visibility
  const getBrighterColor = (hexColor: string) => {
    // For very light colors, keep them as is
    if (hexColor === "#90EE90" || hexColor === "#ADD8E6") {
      return hexColor;
    }
    // For black, use a lighter gray for background
    if (hexColor === "#000000") {
      return "#333333";
    }
    return hexColor;
  };

  const brightColor = getBrighterColor(color);

  return (
    <div
      className={`
        w-10 h-10 rounded-full shadow-lg flex items-center justify-center 
        border-4 border-white relative transition-all duration-500 ease-out
        ${isRising ? "animate-rise" : ""}
        ${isLanded ? "landed" : ""}
      `}
      style={{
        transform: `translateZ(${elevation}px) scale(1.2) rotateX(10deg)`,
        // Use player's color for background with brightness boost
        background: `radial-gradient(circle at 30% 30%, 
          ${brightColor}ff, 
          ${brightColor}ee 40%, 
          ${brightColor}cc 100%)`,
        // Bright shadows/glows using player color
        boxShadow: `
          0 12px 24px rgba(0, 0, 0, 0.7),
          0 0 15px rgba(255, 255, 255, 1),
          0 0 25px rgba(255, 255, 255, 0.8),
          0 0 30px ${color}ff,
          0 0 40px ${color}ff,
          0 0 50px ${color}dd,
          inset 0 0 20px rgba(255, 255, 255, 0.6),
          inset 0 2px 10px rgba(255, 255, 255, 0.8)
        `,
        transformStyle: "preserve-3d",
        filter: "brightness(1.3) contrast(1.2)",
      }}
    >
      {/* Brighter beam/glow base using player color */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-700 pointer-events-none z-[-1]"
        style={{
          boxShadow: isLanded
            ? `
              0 0 40px ${color}ff, 
              0 0 60px ${color}ee, 
              0 0 80px ${color}cc,
              0 0 100px ${color}aa
            `
            : "none",
          background: isLanded
            ? `radial-gradient(ellipse at bottom, ${color}cc, ${color}66 50%, transparent 70%)`
            : "transparent",
          opacity: isLanded ? 1 : 0.7,
        }}
      />

      {/* Suit symbol with darker, more vibrant colors */}
      <div
        className="text-3xl font-black transition-all duration-500"
        style={{
          color: suitColor,
          textShadow: `
            0 0 12px ${suitColor}ff,
            0 0 18px ${suitColor}ff,
            0 3px 8px rgba(0, 0, 0, 1),
            0 0 25px rgba(255, 255, 255, 1),
            0 0 30px ${suitColor}dd
          `,
          transform: `translateZ(${elevation + 5}px) scale(1.2)`,
          filter:
            "brightness(1.8) contrast(1.5) saturate(1.5) drop-shadow(0 0 5px white)",
          WebkitTextStroke: "2px rgba(255, 255, 255, 0.7)",
        }}
      >
        {suit}
      </div>
    </div>
  );
}
