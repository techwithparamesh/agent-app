# Design Guidelines: AI Agent SaaS Platform

## Design Approach

**Hybrid Strategy**: Marketing pages draw inspiration from modern SaaS leaders (Linear, Vercel, Stripe) with bold typography and generous whitespace. Dashboard follows a custom system prioritizing data clarity and workflow efficiency, inspired by Notion's flexibility and Linear's precision.

**Design Principles**:
- Technological sophistication through clean, modern aesthetics
- Trust-building through professional polish and clarity
- AI-forward visual language without gimmicks
- Seamless transition from marketing to application experience

## Typography

**Font Families** (Google Fonts):
- Primary: Inter (400, 500, 600, 700) - UI, body text, dashboard
- Display: Space Grotesk (600, 700) - Marketing headlines, hero sections

**Scale**:
- Hero Headlines: text-6xl to text-7xl (60-72px), font-bold, tracking-tight
- Page Titles: text-4xl to text-5xl (36-48px), font-semibold
- Section Headers: text-3xl (30px), font-semibold
- Subsections: text-xl (20px), font-medium
- Body Text: text-base (16px), font-normal, leading-relaxed
- UI Labels: text-sm (14px), font-medium
- Captions: text-xs (12px), font-normal

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (buttons, cards): p-4, gap-2
- Component spacing: p-6, p-8
- Section padding: py-16, py-20, py-24
- Page margins: px-6 (mobile), px-12 (tablet), container mx-auto max-w-7xl

**Grid System**:
- Marketing: max-w-7xl container, 12-column grid
- Dashboard: Fixed left sidebar (w-64), fluid main content area
- Cards/Features: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Component Library

### Navigation (Marketing)
- Fixed top navbar, backdrop-blur-md with subtle border
- Logo left, nav items center, CTA buttons right
- Height: h-16, horizontal padding px-6
- Mobile: Hamburger menu with slide-out drawer

### Hero Section
- Full viewport height (min-h-screen), centered content
- Large hero image: Full-width background with gradient overlay (dark gradient from bottom)
- Headline + subheadline + dual CTA buttons with blurred backgrounds
- Buttons on image: backdrop-blur-lg with semi-transparent background
- Max content width: max-w-4xl for text readability

### Feature Cards
- 3-column grid on desktop, stacked on mobile
- Card structure: Icon (top), Title (text-xl), Description (text-base)
- Padding: p-8, rounded-2xl, border with subtle hover lift effect
- Icons: 48x48px, positioned above text

### Pricing Cards
- 3-column layout with center card elevated/highlighted
- Card padding: p-8, rounded-2xl
- Price display: Large numbers (text-5xl), small period indicator
- Feature list: Checkmarks with text-sm items, gap-3
- CTA button at bottom, full width

### Dashboard Sidebar
- Fixed left, w-64, full height, subtle background differentiation
- Logo/brand at top (h-16)
- Navigation groups with section headers (text-xs, uppercase, tracking-wide)
- Menu items: p-3, rounded-lg, with icons (20x20px) and labels
- Active state: distinct background, bold text
- Bottom section: User profile card with avatar

### Dashboard Main Content
- Header bar: h-16, breadcrumbs left, actions right
- Content padding: p-8
- Cards for metrics/stats: p-6, rounded-xl, grid layout
- Data tables: Clean rows with hover states, sticky headers

### Forms
- Input fields: h-12, px-4, rounded-lg, border with focus ring
- Labels: text-sm, font-medium, mb-2
- Field spacing: mb-6 between fields
- Submit buttons: h-12, px-8, rounded-lg

### AI Chat Interface
- Chat container: Fixed bottom-right for widget, full-page for dashboard
- Message bubbles: p-4, rounded-2xl, max-w-md
- User messages: aligned right
- AI messages: aligned left with AI avatar
- Input bar: Sticky bottom, h-16, with send button

### Buttons
Primary CTA: h-12, px-8, rounded-lg, font-medium
Secondary: Same dimensions, border variant
Icon buttons: w-10 h-10, rounded-lg
Text buttons: px-4, underline on hover

### Modal/Dialog
- Overlay: backdrop-blur-sm
- Panel: max-w-2xl, rounded-2xl, p-8
- Header with close button
- Footer with action buttons aligned right

## Images

**Hero Image**: Full-width, high-quality abstract tech/AI visualization - geometric patterns, neural networks, or gradient meshes. Position: background with overlay gradient for text readability.

**Feature Section Images**: 
- Agent Builder: Screenshot mockup of agent configuration interface
- Website Scanner: Visualization of web crawling/data extraction
- Chatbot Demo: Live chat interface in action

**About Page**:
- Team section: Professional headshots in circular frames (160x160px)
- Company photo: Office/team collaboration (if applicable)

**Testimonials**: Customer/company logos (120x40px), grayscale with hover color

**Pricing Page**: No images, icon-based feature indicators

**Dashboard**: Minimize images, focus on data visualization, charts, and clean UI elements

## Animations

**Strategic Use Only**:
- Page transitions: Subtle fade-in (200ms)
- Hero elements: Gentle fade-up on load (400ms stagger)
- Hover states: Scale 1.02, 150ms ease-out for cards
- Loading states: Skeleton screens or spinner
- NO scroll-triggered animations, NO parallax effects

## Accessibility

- Minimum contrast ratio 4.5:1 for text
- Focus indicators: 2px ring with offset
- Skip to content link
- ARIA labels on all interactive elements
- Keyboard navigation throughout
- Form validation with clear error messages

---

**Marketing Pages Flow**: Bold hero → Feature grid (3-col) → How It Works (timeline/steps) → Testimonials (2-col) → Pricing comparison → CTA section → Footer

**Dashboard Flow**: Sidebar navigation → Welcome/Quick actions → Agent list/creation form → Knowledge base viewer → Chatbot testing interface → Analytics dashboard