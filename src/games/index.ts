import { lazy } from "react";

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.LazyExoticComponent<any>;
  minBet?: number;
  maxBet?: number;
}

export const GAMES: Record<string, Game> = {
  "racing-suits": {
    id: "racing-suits",
    name: "Racing Suits",
    description: "Bet on racing suits and win big!",
    icon: "/games/racing-suits/images/image.png",
    component: lazy(() => import("./racing-suits/App")),
  },
  "space-crash": {
    id: "space-crash",
    name: "Space Crash",
    description: "Watch the multiplier soar! Cash out before the crash!",
    icon: "/games/space-crash/images/icon.png",
    component: lazy(() => import("./space-crash/App")),
    minBet: 1,
    maxBet: 1000,
  },
  "stack-em": {
    id: "stack-em",
    name: "21-stackem",
    description: "Watch the multiplier soar! Cash out before the crash!",
    icon: "/games/space-crash/images/icon.png",
    component: lazy(() => import("./stack-em/App")),
    minBet: 1,
    maxBet: 1000,
  },
  "poker-opoly": {
    id: "poker-opoly",
    name: "Poker-Opoly",
    description: "Roll the dice, collect cards, and build poker hands!",
    icon: "/images/POKER-OPOLY.png", // or create a specific icon
    component: lazy(() => import("./pokeropoly/App")),
    minBet: 100,
    maxBet: 10000,
  },
};
