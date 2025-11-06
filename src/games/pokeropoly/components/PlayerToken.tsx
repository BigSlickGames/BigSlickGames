interface PlayerTokenProps {
  color: string;
  suit: string;
  size?: number;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  color,
  suit,
  size = 40,
}) => {
  const getSuitColor = (suit: string) => {
    if (suit === "♥") return "#DC143C";
    if (suit === "♦") return "#90EE90";
    if (suit === "♣") return "#ADD8E6";
    return "#000000";
  };

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        width: `${size}px`,
        height: `${size * 1.8}px`, // Taller to accommodate flag
        transformStyle: "preserve-3d",
      }}
    >
      {/* Flag/Card on top */}
      <div
        className="absolute rounded shadow-lg flex items-center justify-center"
        style={{
          width: `${size * 0.8}px`,
          height: `${size * 1.1}px`,
          top: "0",
          left: "50%",
          transform: "translateX(-50%) rotateX(-20deg)",
          backgroundColor: "white",
          border: `2px solid ${getSuitColor(suit)}`,
          zIndex: 2,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="font-bold"
          style={{
            fontSize: `${size * 0.6}px`,
            color: getSuitColor(suit),
          }}
        >
          {suit}
        </div>
      </div>

      {/* Pole/Staff */}
      <div
        className="absolute"
        style={{
          width: "3px",
          height: `${size * 1.2}px`,
          top: `${size * 0.4}px`,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#8B4513",
          zIndex: 1,
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      />

      {/* Base/Player piece */}
      <div
        className="absolute rounded-full shadow-xl"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: color,
          border: `3px solid ${color}`,
          boxShadow: `
            0 4px 8px rgba(0,0,0,0.4),
            inset 0 2px 4px rgba(255,255,255,0.3)
          `,
          zIndex: 1,
        }}
      >
        {/* Inner shine */}
        <div
          className="absolute top-1 left-1 right-1 rounded-full"
          style={{
            height: "40%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
          }}
        />
      </div>
    </div>
  );
};
interface PlayerTokenProps {
  color: string;
  suit: string;
  size?: number;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  color,
  suit,
  size = 40,
}) => {
  const getSuitColor = (suit: string) => {
    if (suit === "♥") return "#DC143C";
    if (suit === "♦") return "#90EE90";
    if (suit === "♣") return "#ADD8E6";
    return "#000000";
  };

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        width: `${size}px`,
        height: `${size * 1.8}px`, // Taller to accommodate flag
        transformStyle: "preserve-3d",
      }}
    >
      {/* Flag/Card on top */}
      <div
        className="absolute rounded shadow-lg flex items-center justify-center"
        style={{
          width: `${size * 0.8}px`,
          height: `${size * 1.1}px`,
          top: "0",
          left: "50%",
          transform: "translateX(-50%) rotateX(-20deg)",
          backgroundColor: "white",
          border: `2px solid ${getSuitColor(suit)}`,
          zIndex: 2,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="font-bold"
          style={{
            fontSize: `${size * 0.6}px`,
            color: getSuitColor(suit),
          }}
        >
          {suit}
        </div>
      </div>

      {/* Pole/Staff */}
      <div
        className="absolute"
        style={{
          width: "3px",
          height: `${size * 1.2}px`,
          top: `${size * 0.4}px`,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#8B4513",
          zIndex: 1,
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      />

      {/* Base/Player piece */}
      <div
        className="absolute rounded-full shadow-xl"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: color,
          border: `3px solid ${color}`,
          boxShadow: `
            0 4px 8px rgba(0,0,0,0.4),
            inset 0 2px 4px rgba(255,255,255,0.3)
          `,
          zIndex: 1,
        }}
      >
        {/* Inner shine */}
        <div
          className="absolute top-1 left-1 right-1 rounded-full"
          style={{
            height: "40%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
          }}
        />
      </div>
    </div>
  );
};
