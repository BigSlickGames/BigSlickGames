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
    icon: "/games/racing-suits/images/image.png", // Update with actual icon path
    component: lazy(() => import("./racing-suits/App")),
  },
};
