# CityWhisper Design Guidelines

## Overall Design Philosophy

**Modern Warm Minimalism**
- Soft, inviting color palette featuring warm beige, amber, cream, and muted green tones
- Clean, airy spacing with no visual clutter
- Slightly rounded components (12-16px border radius)
- Smooth transitions for all screen navigation
- Apple/Google Maps-inspired card overlays
- Dark mode support with warm, desaturated tones

## Navigation Architecture

**Tab Navigation (Primary)**
- Main tabs: Chat (Talk to Your City), Explore, Itinerary Builder, Student Mode, Settings
- Center-positioned floating action button for voice input
- Tab bar should use warm accent colors with active state indicators

## Screen Specifications

### 1. Welcome & Onboarding
- Multi-step onboarding introducing core features
- Warm, welcoming visuals
- Clear CTAs to begin dietary profile setup

### 2. Dietary Profile Setup (EatFit Engine)
- Form-based interface for collecting:
  - Dietary restrictions (vegan, vegetarian, halal, kosher, lactose-free, gluten-free, keto, high-protein)
  - Allergies and disliked ingredients
  - Budget range preferences
  - Preferred cuisines
- Clean, card-based selections with visual icons
- Progress indicator for multi-step flow

### 3. Main Chat (Talk to Your City)
- Conversational interface with:
  - Clean message bubbles (user vs AI differentiated)
  - Rich result cards embedded in chat
  - Comparison cards for business evaluations
  - Floating voice-input mic button (bottom-right)
  - "Reserve" and action CTAs within messages
- Smooth scroll behavior
- Typing indicators for AI responses

### 4. Explore Tab
- Horizontal scrollable category chips: "Food", "Coffee", "Cheap Eats", "Study Spots"
- Vertical scrolling business cards grid
- Quick filter buttons for dietary preferences

### 5. Itinerary Builder
- Timeline-style layout showing planned activities
- Map preview card at top
- Draggable/editable stops
- Budget summary at bottom

### 6. Budget Planner (Cook vs Eat-Out)
- Split-view comparison cards:
  - Left: Eat-out option (restaurant details, Yelp price)
  - Right: Cook-at-home option (recipe summary, ingredient cost)
- Clear visual differences highlighting price, time, calories, convenience
- Toggle or tab-based switching

### 7. Student Survival Mode
- Quick-access cards for:
  - Cheap meals
  - Study cafés
  - Late-night safe places
  - Affordable grocery stores
  - Areas to explore
- Optimized for speed and efficiency

### 8. Settings
- Profile editing
- API key management
- App preferences
- Clean, sectioned list layout

## Core Components

### Business Card
- Image thumbnail (rounded corners)
- Business name (bold)
- Star rating with review count
- Price level indicator ($ symbols)
- Multiple dietary/cuisine tags (chip style)
- Distance/location subtitle
- Quick action buttons below

### Chip Tags
- Small, rounded pill shapes
- Color-coded by category:
  - Dietary: muted green
  - Price: amber
  - Cuisine: warm beige
  - Vibes: cream
- Subtle drop shadow

### Message Bubbles
- User messages: right-aligned, accent color background
- AI messages: left-aligned, neutral warm background
- Rounded corners (16-20px)
- Proper spacing between messages

### Comparison Card
- Side-by-side layout for 2 businesses
- Equal width columns
- Matching data points aligned vertically
- Highlight differences with subtle color coding

### Floating Voice Button
- Circular, prominent size
- Positioned bottom-right with safe area inset
- Pulsing animation when active
- Microphone icon
- Warm accent color with subtle drop shadow

### Map Preview Card
- Embedded map showing business locations
- Polyline routes (optional)
- Location pins with business markers
- "Open in Maps" CTA

### CTA Buttons
- Clear, action-oriented labels: "Reserve", "View Menu", "Open Route", "Compare"
- Rounded rectangles
- Primary actions use warm accent colors
- Secondary actions use outline style

## Visual Design System

### Color Palette
- Primary: Warm amber (#F4A261 or similar)
- Secondary: Muted green (#88AB8E or similar)
- Neutral backgrounds: Cream/beige (#FAF3E0, #FEFAE0)
- Text: Dark warm gray (#3D3D3D)
- Card backgrounds: White with subtle warm tint
- Dark mode: Warm desaturated equivalents

### Typography
- Headings: Medium-bold weight, slightly increased letter spacing
- Body: Regular weight, comfortable line height (1.5-1.6)
- Captions: Smaller, muted color

### Iconography
- Use Feather icons from @expo/vector-icons
- NO emojis in UI
- System icons for common actions
- Consistent sizing (20-24px standard)

### Shadows & Elevation
- Floating buttons: subtle drop shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- Cards: minimal shadow for depth
- Avoid blurred heavy shadows on most touchable elements

### Spacing
- Consistent spacing scale (8px base unit)
- Generous padding around content
- Clear visual hierarchy through spacing

## Interaction Design

### Touchable Feedback
- All touchable components must have visual feedback when pressed
- Subtle scale animation (0.95-0.98) or opacity change (0.7-0.8)
- No harsh transitions

### Transitions
- Smooth screen navigation
- Card reveal animations
- Fade-in for content loading
- Slide-in for modals

## Accessibility

- Sufficient color contrast ratios
- Touch targets minimum 44x44 points
- Clear focus indicators
- Support for dynamic type sizes
- VoiceOver/TalkBack compatible labels