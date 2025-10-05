# GameHub Integration Package

This package allows your new game to integrate seamlessly with the main GameHub application, providing:
- Cross-app authentication
- Chip balance syncing
- Consistent theming and background
- Profile management
- Game result reporting

## Setup Instructions

1. Copy all files from this `gamehub-integration` folder to your new Bolt project
2. Install required dependencies: `npm install @supabase/supabase-js`
3. Import and use the `GameHubProvider` in your main App component
4. Use the provided hooks and components throughout your game

## File Structure

- `GameHubProvider.tsx` - Main provider component
- `useGameHub.ts` - Hook for accessing GameHub functionality
- `gameHubAuth.ts` - Authentication utilities
- `gameHubStyles.css` - Consistent styling and background
- `types.ts` - TypeScript type definitions
- `GameHubLayout.tsx` - Layout component with consistent styling

## Quick Start

```tsx
// In your App.tsx
import { GameHubProvider } from './gamehub-integration/GameHubProvider';
import { GameHubLayout } from './gamehub-integration/GameHubLayout';
import './gamehub-integration/gameHubStyles.css';

function App() {
  return (
    <GameHubProvider gameId="your-game-id">
      <GameHubLayout>
        <YourGameComponent />
      </GameHubLayout>
    </GameHubProvider>
  );
}
```

## Usage in Components

```tsx
import { useGameHub } from './gamehub-integration/useGameHub';

function YourGameComponent() {
  const { user, chips, updateChips, reportGameResult } = useGameHub();
  
  // Your game logic here
}
```