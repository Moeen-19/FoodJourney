# CityWhisper

## Overview
CityWhisper is a conversational AI-powered city discovery app that helps users find restaurants, cafes, and attractions with personalized recommendations based on dietary preferences, budget, and location.

## Features
- **Talk to Your City**: Conversational AI chat interface powered by Cohere
- **EatFit Engine**: Dietary-aware filtering (vegan, halal, gluten-free, etc.)
- **Smart Budget Intelligence**: Compare eating out vs cooking at home
- **Multi-Day Trip Planner**: Generate 3, 5, or 7-day personalized itineraries with export and sharing
- **Restaurant Reservations**: Book tables with real-time availability (reservation system)
- **Advanced Budget Tracker**: Track spending with history, category breakdown, and AI recommendations
- **Social Features**: Share favorites and itineraries with friends, add friends, activity feed
- **Offline Mode**: Cached recommendations and saved itineraries for travel without internet
- **Business Discovery**: Explore restaurants, cafes, and study spots

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 with Bottom Tabs
- **State Management**: React Query + AsyncStorage
- **AI**: Cohere API (command-r-08-2024 model)
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Custom theme system with warm color palette

## Project Structure
```
/client
  /components      - Reusable UI components (ThemedText, Button, Card, OfflineBanner)
  /screens         - App screens (Chat, Explore, MultiDayItinerary, BudgetTracker, Social, Reservations)
  /navigation      - Navigation configuration (MainTabNavigator, RootStackNavigator)
  /hooks           - Custom React hooks (useReservations, useMultiDayItinerary, useBudgetTracker, useSocial, useOfflineMode)
  /lib             - API client utilities
  /constants       - Theme and design tokens
/server
  /routes.ts       - API endpoints (chat, businesses, reservations, itineraries, budget, favorites, friends, cache)
  /storage.ts      - Database storage layer
  /db.ts           - Database connection
  /index.ts        - Express server setup
/shared
  /schema.ts       - Drizzle ORM database schema
```

## Database Tables
- **users**: User accounts with preferences
- **businesses**: Restaurant/cafe listings with details
- **reservations**: Table bookings with confirmation codes
- **itineraries**: Multi-day trip plans
- **itinerary_days**: Individual days in itineraries
- **itinerary_stops**: Activities/stops within each day
- **budget_transactions**: User spending history
- **spending_insights**: AI-generated spending analysis
- **favorites**: User saved businesses
- **friends**: User connections
- **shared_items**: Shared itineraries and favorites
- **cached_data**: Offline cache storage
- **activity_feed**: Social activity tracking

## Key API Endpoints
- `POST /api/chat` - AI conversation
- `GET/POST /api/reservations` - Booking management
- `GET/POST /api/itineraries` - Trip planning
- `POST /api/itinerary/:id/export` - Export as ICS/text
- `GET /api/budget/:userId` - Spending history with recommendations
- `GET/POST /api/favorites` - Favorite places
- `GET/POST /api/friends` - Friend connections
- `GET /api/cache/snapshot` - Offline sync data

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `COHERE_API_KEY` - Cohere API key for AI chat
- `COHERE_MODEL` - Cohere model name (command-r-08-2024)

## Design System
- **Primary Color**: Warm amber (#F4A261)
- **Secondary Color**: Muted green (#88AB8E)
- **Background**: Cream/beige tones
- **Border Radius**: 12-24px for rounded modern look
- **Typography**: System fonts with clear hierarchy (h1-h4, subtitle, body, caption)

## Recent Changes
- Added restaurant reservation booking system with availability slots
- Implemented multi-day itinerary planning (3, 5, 7-day trips) with ICS export and sharing
- Added advanced budget tracker with spending categories and AI recommendations
- Built social features for sharing favorites and itineraries with friends
- Implemented offline mode with data caching and sync
- Extended database schema with new tables for all features
- Updated navigation with new tabs: Trips, Budget, Social
