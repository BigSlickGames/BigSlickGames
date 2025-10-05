Games

# BigSlick Games - Gaming Platform

## Overview

BigSlick Games is a comprehensive online gaming platform designed to deliver an engaging multiplayer gaming experience with a focus on competitive poker and card games. The platform combines modern web technologies with a backend infrastructure to provide users with a seamless, secure, and feature-rich gaming environment.

Built for both casual players and serious competitors, BigSlick Games offers a complete ecosystem that includes user authentication, virtual currency management, game progression systems, and social features. The platform emphasizes fair play, secure transactions, and an intuitive user experience across all devices.

### What is BigSlick Games?

BigSlick Games serves as a digital gaming hub where players can:

- **Compete in Multiplayer Games:** Engage in real-time poker and card games with players from around the world
- **Track Performance:** Monitor detailed statistics including games played, win rates, total chips won, and progression through levels
- **Manage Virtual Currency:** Start with 25,000 chips and build your bankroll through strategic gameplay
- **Customize Experience:** Personalize your profile with custom themes, usernames, and preferences
- **Progress Through Levels:** Gain experience points and level up as you play, unlocking new features and achievements
- **Connect with Community:** Join a vibrant gaming community with social features and leaderboards

The platform is designed with scalability in mind, supporting cross-app authentication and permissions for future expansion into additional gaming experiences and tournaments.

### Key Highlights

- **Enterprise-Grade Security:** Built on Supabase with JWT authentication, email verification, and Row Level Security policies
- **Modern Architecture:** React-based frontend with TypeScript for type safety and maintainable code
- **Responsive Design:** Fully responsive UI that works seamlessly on desktop, tablet, and mobile devices
- **Real-Time Capabilities:** Foundation ready for real-time multiplayer features and live updates
- **Professional User Management:** Complete authentication flow with password resets, email verification, and secure session handling

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Structure](#database-structure)
- [Getting Started](#getting-started)
- [User Guide](#user-guide)
- [Developer Documentation](#developer-documentation)
- [Environment Setup](#environment-setup)
- [Recent Updates](#recent-updates)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Gaming Features

- **Virtual Currency System:** Chip-based economy with starting balance and bankroll tracking
- **Progressive Leveling:** Experience-based level system with visual progression indicators
- **Game Statistics:** Comprehensive tracking of games played, wins, losses, and performance metrics
- **Win Analytics:** Detailed breakdown of wins by game type stored in JSONB format
- **Session Tracking:** Monitor active gameplay sessions and total hours played

### Authentication & Security

- **Secure Registration:** Email-based signup with mandatory verification
- **Password Security:**
  - Minimum 6-character requirement
  - Real-time password strength indicator (Weak/Medium/Strong)
  - Encrypted storage via Supabase Auth
- **Session Management:** JWT-based sessions with automatic refresh
- **Password Recovery:** Complete forgot password flow with email reset
- **Protected Routes:** Route guards preventing unauthorized access
- **Show/Hide Password:** Toggle visibility for better UX

### User Experience

- **Customizable Profiles:** Username, email, and avatar management
- **Theme System:** Multiple theme options with persistent user preferences
- **Sound Settings:** Toggleable audio controls
- **Notification Preferences:** Customizable alert settings
- **Responsive UI:** Optimized for all screen sizes
- **Smooth Animations:** Polished transitions and loading states

### Administrative Features

- **Cross-App Permissions:** JSONB-based permission system for multi-app ecosystem
- **User Moderation:** Foundation for violation tracking and suspension management
- **Activity Monitoring:** Last activity timestamps and session tracking
- **Game Statistics:** Flexible JSONB storage for custom game metrics

## Tech Stack

### Frontend Technologies

- **React 18:** Modern component-based UI framework
- **TypeScript:** Static typing for enhanced code quality and maintainability
- **React Router DOM:** Client-side routing with protected routes
- **Lucide React:** Comprehensive icon library
- **Custom CSS:** Embedded styling with CSS-in-JS approach for component isolation
- **Vite:** Next-generation frontend tooling for fast builds

### Backend & Database

- **Supabase:**
  - PostgreSQL database with 10GB+ storage
  - Built-in authentication with email verification
  - Row Level Security (RLS) for data protection
  - Real-time subscriptions capability
  - RESTful API with automatic generation
- **PostgreSQL 15:** Advanced relational database features
- **JSONB Storage:** Flexible data structures for game stats and preferences

### Development Tools

- **TypeScript Compiler:** Type checking and transpilation
- **Git:** Version control

## Database Structure

The application uses a normalized 3-table structure optimized for performance, maintainability, and scalability.

### 1. `profiles` - Core User Identity

Primary table for user identification and basic information.

| Column Name | Data Type | Default | Constraints                  | Description                |
| ----------- | --------- | ------- | ---------------------------- | -------------------------- |
| id          | uuid      | -       | PRIMARY KEY, FK → auth.users | User unique identifier     |
| username    | text      | -       | NOT NULL                     | Display name               |
| email       | text      | -       | -                            | User email address         |
| created_at  | timestamp | now()   | -                            | Account creation timestamp |
| updated_at  | timestamp | now()   | -                            | Last profile update        |

**Indexes:**

- Primary key on `id`
- Index on `email` for quick lookups
- Index on `username` for search functionality

**RLS Policies:**

- Users can SELECT their own profile
- Users can UPDATE their own profile
- Users can INSERT their own profile on signup

---

### 2. `user_wallet` - Economy & Game Progression

Handles all financial and progression-related data.

| Column Name        | Data Type     | Default           | Constraints              | Description                |
| ------------------ | ------------- | ----------------- | ------------------------ | -------------------------- |
| id                 | uuid          | gen_random_uuid() | PRIMARY KEY              | Wallet record identifier   |
| user_id            | uuid          | -                 | UNIQUE, FK → profiles.id | Owner reference            |
| chips              | integer       | 15000             | NOT NULL                 | Current chip balance       |
| bankroll           | bigint        | 0                 | NOT NULL                 | Long-term bankroll         |
| chips_won_total    | bigint        | 0                 | NOT NULL                 | Lifetime chips won         |
| level              | integer       | 1                 | NOT NULL                 | Current user level         |
| experience         | integer       | 0                 | NOT NULL                 | Experience points          |
| games_played       | integer       | 0                 | NOT NULL                 | Total games count          |
| games_won          | integer       | 0                 | NOT NULL                 | Total wins count           |
| total_hours_played | numeric(10,2) | 0                 | NOT NULL                 | Gameplay time in hours     |
| games_won_by_type  | jsonb         | '{}'              | NOT NULL                 | Win breakdown by game type |
| created_at         | timestamp     | now()             | -                        | Wallet creation timestamp  |
| updated_at         | timestamp     | now()             | -                        | Last wallet update         |

**Indexes:**

- Primary key on `id`
- Unique index on `user_id`
- Index on `user_id` for fast joins

**RLS Policies:**

- Users can SELECT their own wallet
- Users can UPDATE their own wallet
- Users can INSERT their own wallet on signup

**JSONB Structure Example:**

```json
{
  "games_won_by_type": {
    "poker": 45,
    "blackjack": 23,
    "rummy": 12
  }
}
```

---

### 3. `user_preferences` - Settings & Permissions

Stores user customization and permission data.

| Column Name      | Data Type | Default           | Constraints              | Description                    |
| ---------------- | --------- | ----------------- | ------------------------ | ------------------------------ |
| id               | uuid      | gen_random_uuid() | PRIMARY KEY              | Preference record identifier   |
| user_id          | uuid      | -                 | UNIQUE, FK → profiles.id | Owner reference                |
| theme_preference | text      | 'orange'          | NOT NULL                 | Active UI theme                |
| preferences      | jsonb     | See below         | NOT NULL                 | User settings object           |
| app_permissions  | jsonb     | '{}'              | NOT NULL                 | Cross-app access rights        |
| game_stats       | jsonb     | '{}'              | NOT NULL                 | Additional game metrics        |
| created_at       | timestamp | now()             | -                        | Preferences creation timestamp |
| updated_at       | timestamp | now()             | -                        | Last preferences update        |

**Default Preferences JSONB:**

```json
{
  "sound": true,
  "theme": "orange",
  "notifications": true
}
```

**Indexes:**

- Primary key on `id`
- Unique index on `user_id`
- Index on `user_id` for fast joins

**RLS Policies:**

- Users can SELECT their own preferences
- Users can UPDATE their own preferences
- Users can INSERT their own preferences on signup

---

### Database Triggers

**Automatic Timestamp Updates:**

```sql
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_user_wallet_updated_at
  BEFORE UPDATE ON user_wallet
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Migration History

**Before (v0.9):** Single monolithic table

- 24 columns in one `profiles` table
- Mixed identity, economy, settings, moderation, and session data
- Duplicate fields (`chips` and `chips_balance`)
- Poor query performance for specific data types
- Difficult to maintain and extend

**After (v1.0):** Normalized 3-table structure

- **5 columns** in `profiles` (identity only)
- **13 columns** in `user_wallet` (economy only)
- **8 columns** in `user_preferences` (settings only)
- Clear separation of concerns
- Optimized queries (fetch only needed data)
- Easy to extend with new features
- Better indexing and performance

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** v16.0.0 or higher
- **npm** v7.0.0 or higher (or **yarn** v1.22.0+)
- **Git** for version control
- **Supabase account**

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/bigslick-games.git
cd bigslick-games
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

4. **Configure Supabase credentials**

Edit `.env` and add your Supabase project details:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase Dashboard:

- Project Settings → API → Project URL
- Project Settings → API → Project API keys → `anon` `public`

6. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

7. **Open your browser**

Navigate to `http://localhost:5173`

### Verify Installation

After starting the dev server, you should see:

- Login/Signup screen
- No console errors in browser DevTools
- Ability to toggle between Sign In and Sign Up forms

## User Guide

### For Players

#### Creating Your Account

1. Visit the BigSlick Games homepage
2. Click the **"Sign Up"** tab
3. Fill in your details:
   - **Username:** Choose a unique display name (visible to other players)
   - **Email:** Use a valid email address (required for verification)
   - **Password:** Create a secure password (see requirements below)
4. Watch the **password strength indicator**:
   - Red (Weak): Less than 6 characters
   - Orange (Medium): 8+ characters with some complexity
   - Green (Strong): 6+ chars with uppercase, numbers, and special characters
5. Click **"Create Account"**
6. Check your email inbox for a verification message
7. Click the **verification link** in the email
8. Return to BigSlick Games and sign in

**Starting Balance:** New accounts receive 15,000 chips to begin playing.

#### Signing In

1. Navigate to the homepage
2. Ensure you're on the **"Sign In"** tab
3. Enter your registered email and password
4. Use the eye icon to toggle password visibility if needed
5. Click **"Sign In"**
6. You'll be redirected to your dashboard

#### Forgot Your Password?

1. On the sign-in page, click **"Forgot Password?"**
2. Enter your registered email address
3. Click **"Send Reset Link"**
4. Check your email for the password reset message
5. Click the reset link (valid for 1 hour)
6. On the password reset page:
   - Enter your new password
   - Confirm the new password
   - Watch the strength indicator for guidance
7. Click **"Update Password"**
8. You'll be redirected to sign in with your new credentials

#### Password Requirements

For account security, passwords must meet these criteria:

**Minimum Requirements:**

- At least 6 characters long

**Strength Levels:**

- **Weak (Not Recommended):**
  - Short passwords (< 6 chars)
  - Simple patterns (123456, password)
  - Dictionary words
- **Medium (Acceptable):**
  - 8+ characters
  - Mix of letters and numbers
  - Some uppercase letters
- **Strong (Recommended):**
  - 6+ characters minimum
  - At least one uppercase letter (A-Z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&\*)
  - Example: `Game$2025!`

## Developer Documentation

### Project Structure

```
BigSlickgames/
├── src/
│   ├── components/
│   │   ├── AuthScreen.tsx          # Authentication UI (login/signup)
│   │   ├── ResetPassword.tsx       # Password reset flow
│   │   ├── Dashboard.tsx           # Main app dashboard
│   │   └── SplashScreen.tsx        # Initial loading screen
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client & config
│   │   ├── crossAppAuth.ts         # Cross-app auth utilities
│   │   └── localStorageManager.ts  # Local storage helpers
│   ├── api/
│   │   └── (API route handlers)
│   ├── App.tsx                     # Root component with routing
│   ├── main.tsx                    # Application entry point
│   ├── index.css                   # Global styles
│   └── vite-env.d.ts               # TypeScript declarations
├── supabase/
│   └── migrations/
│       └── *.sql                   # Database migration files
├── public/
│   ├── images/                     # Static image assets
│   └── (other static files)
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment template
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                       # This file
```

### Key Components

#### AuthScreen.tsx

**Purpose:** Handles user authentication (login and registration)

**Features:**

- Tabbed interface for Sign In / Sign Up
- Real-time password strength validation
- Integrated forgot password modal
- Creates entries in all 3 database tables on registration
- Fetches and combines data from multiple tables on login
- Comprehensive error handling and user feedback

**Key Functions:**

```typescript
handleSignUp(); // Creates user + profile + wallet + preferences
handleSignIn(); // Authenticates and fetches combined user data
handleForgotPassword(); // Initiates password reset flow
checkPasswordStrength(); // Validates password complexity
```

**Database Operations on Signup:**

1. Create auth user in Supabase Auth
2. Insert into `profiles` table (username, email)
3. Insert into `user_wallet` table (25,000 starting chips)
4. Insert into `user_preferences` table (default theme/settings)

#### ResetPassword.tsx

**Purpose:** Standalone page for password reset

**Features:**

- Password strength indicator
- Confirm password validation
- Show/hide password toggles
- Success/error messaging
- Automatic redirect after successful reset

**Flow:**

1. User arrives via email link
2. Supabase auth state changes to PASSWORD_RECOVERY
3. User enters and confirms new password
4. Validates strength requirements
5. Updates password via Supabase
6. Redirects to login after 3 seconds

#### App.tsx

**Purpose:** Root application component with routing

**Features:**

- React Router setup
- Session persistence checking
- Protected route handling
- Multi-table data fetching on app load
- Splash screen management

**Routes:**

- `/` - Main app (shows splash → auth → dashboard)
- `/reset-password` - Password reset page

**Session Management:**

```typescript
useEffect(() => {
  // Check for existing Supabase session
  // Fetch from profiles table
  // Fetch from user_wallet table
  // Fetch from user_preferences table
  // Combine data and set application state
}, []);
```

### Authentication Flow Diagrams

#### Sign Up Flow

```
User Enters Details
        ↓
Validate Password Strength
        ↓
Call supabase.auth.signUp()
        ↓
[Supabase] Create User in auth.users
        ↓
[App] Insert into profiles table
        ↓
[App] Insert into user_wallet table (25k chips)
        ↓
[App] Insert into user_preferences table
        ↓
[Supabase] Send Verification Email
        ↓
User Clicks Email Link
        ↓
Account Verified ✓
```

#### Sign In Flow

```
User Enters Credentials
        ↓
Call supabase.auth.signInWithPassword()
        ↓
[Supabase] Validate Credentials
        ↓
[Supabase] Create JWT Session
        ↓
[App] Fetch from profiles table
        ↓
[App] Fetch from user_wallet table
        ↓
[App] Fetch from user_preferences table
        ↓
Combine All Data
        ↓
Pass to Dashboard Component
        ↓
User Logged In ✓
```

#### Password Reset Flow

```
User Clicks "Forgot Password?"
        ↓
Enter Email Address
        ↓
Call supabase.auth.resetPasswordForEmail()
        ↓
[Supabase] Send Reset Email with Token
        ↓
User Clicks Email Link
        ↓
Redirect to /reset-password?token=xyz
        ↓
[Supabase] Auth State = PASSWORD_RECOVERY
        ↓
User Enters New Password
        ↓
Validate Password Strength
        ↓
Call supabase.auth.updateUser()
        ↓
[Supabase] Update Password Hash
        ↓
Redirect to Login
        ↓
Password Reset Complete ✓
```

### API Reference

#### Supabase Client (src/lib/supabase.ts)

```typescript
// Initialize Supabase client
export const supabase = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY
);

// Check if Supabase is available
export const isSupabaseAvailable = () => boolean;

// TypeScript Interfaces
export interface UserProfile { ... }
export interface UserWallet { ... }
export interface UserPreferences { ... }
```

#### Common Supabase Operations

**Authentication:**

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "SecurePass123!",
  options: { data: { username: "player1" } },
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "SecurePass123!",
});

// Sign out
await supabase.auth.signOut();

// Get session
const {
  data: { session },
} = await supabase.auth.getSession();

// Password reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "https://yourdomain.com/reset-password",
});
```

**Database Queries:**

```typescript
// Fetch profile
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();

// Update wallet
const { error } = await supabase
  .from("user_wallet")
  .update({ chips: newChipAmount })
  .eq("user_id", userId);

// Insert preferences
const { error } = await supabase.from("user_preferences").insert([
  {
    user_id: userId,
    theme_preference: "dark",
    preferences: { sound: true, notifications: false },
  },
]);
```

### Environment Setup

#### Required Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For admin operations (not needed for basic app)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Note:** Never commit `.env` to version control. It's already in `.gitignore`.
