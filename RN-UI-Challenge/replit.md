# CityWhisper

## Overview
CityWhisper is a conversational AI-powered city discovery app that helps users find restaurants, cafes, and attractions with personalized recommendations based on dietary preferences, budget, and location.

## Features
- **Talk to Your City**: Conversational AI chat interface powered by Cohere
- **EatFit Engine**: Dietary-aware filtering (vegan, halal, gluten-free, etc.)
- **Smart Budget Intelligence**: Compare eating out vs cooking at home
- **Itinerary Builder**: Generate personalized day plans
- **Student Survival Mode**: Quick access to budget-friendly essentials
- **Business Discovery**: Explore restaurants, cafes, and study spots

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 with Bottom Tabs
- **State Management**: React Query + AsyncStorage
- **AI**: Cohere API (command-r-08-2024 model)
- **Backend**: Express.js with TypeScript
- **Styling**: Custom theme system with warm color palette

## Project Structure
```
/client
  /components      - Reusable UI components
  /screens         - App screens
  /navigation      - Navigation configuration
  /hooks           - Custom React hooks
  /lib             - API client utilities
  /constants       - Theme and design tokens
/server
  /routes.ts       - API endpoints
  /index.ts        - Express server setup
```

## Key Components
- `ChatScreen` - Main conversational interface
- `ExploreScreen` - Category-based business discovery
- `ItineraryScreen` - Day plan generator
- `StudentModeScreen` - Budget-friendly quick access
- `SettingsScreen` - Profile and preferences management
- `BusinessCard` - Reusable business display component
- `Chip` - Tag/filter component

## Environment Variables
- `COHERE_API_KEY` - Cohere API key for AI chat
- `COHERE_MODEL` - Cohere model name (command-r-08-2024)

## Design System
- **Primary Color**: Warm amber (#F4A261)
- **Secondary Color**: Muted green (#88AB8E)
- **Background**: Cream/beige tones
- **Border Radius**: 12-24px for rounded modern look
- **Typography**: System fonts with clear hierarchy

## Recent Changes
- Initial implementation of CityWhisper MVP
- Cohere AI integration for conversational chat
- EatFit dietary profile system
- Mock data for business discovery
- Itinerary generation with budget tracking
