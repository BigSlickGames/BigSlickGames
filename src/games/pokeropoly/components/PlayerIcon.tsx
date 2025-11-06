interface PlayerIconProps {
  color: string;
  suit: string;
  isLanded?: boolean;
  isRising?: boolean; // Trigger rise animation
  elevation?: number; // Lift height in px
}

export function PlayerIcon({
  color,
  suit,
  isLanded = false,
  isRising = false,
  elevation = 15,
}: PlayerIconProps) {
  return (
    <div
      className={`
        w-8 h-8 rounded-full shadow-lg flex items-center justify-center 
        border-2 border-white/40 relative transition-all duration-500 ease-out
        ${isRising ? "animate-rise" : ""}
        ${isLanded ? "landed" : ""}
      `}
      style={{
        // Default elevation: Always slightly raised to avoid ground clipping
        transform: `translateZ(${elevation}px) scale(1) rotateX(10deg)`,
        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}dd)`,
        // Layered shadows: Ground projection for depth, plus glows

        boxShadow: `
          0 8px 16px rgba(0, 0, 0, 0.4), /* Elongated ground shadow for height */
          0 0 5px rgba(255, 255, 255, 0.8),
          0 0 10px rgba(255, 215, 0, 0.6), /* Gold poker accent */
          0 0 15px ${color}80, /* Player color aura */
          inset 0 0 10px rgba(255, 255, 255, 0.2) /* Inner 3D shine */



        `,
        // Ensure 3D context for child elements
        transformStyle: "preserve-3d",
      }}
    >
      {/* Beam/glow base: Simulates light from ground contact */}
      <div
        className="absolute inset-0 rounded-full opacity-0 transition-all duration-700 pointer-events-none z-[-1]"
        style={{
          boxShadow: isLanded
            ? `0 0 25px ${color}cc, 0 0 35px ${color}99, 0 0 45px ${color}66`
            : "none",
          background: isLanded
            ? `radial-gradient(ellipse at bottom, ${color}50, transparent 70%)`
            : "transparent",
        }}
      />

      <div
        className="text-xl font-bold text-white transition-all duration-500"
        style={{
          textShadow: `
            0 0 3px currentColor,
            0 0 6px currentColor,
            0 2px 4px rgba(0,0,0,0.7),
            0 0 10px rgba(255, 255, 255, 0.9)

          `,
          // Text lifts higher for prominence
          transform: `translateZ(${elevation + 3}px)`,
        }}
      >
        {suit}
      </div>
    </div>
  );
}
