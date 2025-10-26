interface PlayerIconProps {
  color: string;
  suit: string;
}

export function PlayerIcon({ color, suit }: PlayerIconProps) {
  return (
    <div
      className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center border-2 border-white/40"
      style={{
        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}dd)`,
      }}
    >
      <div
        className="text-xl font-bold text-white"
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        {suit}
      </div>
    </div>
  );
}
