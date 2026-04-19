# Design System Inspired by Bright Travel Companion Apps

## 1. Visual Theme & Atmosphere

This design language is a bright, travel-first mobile UI built around a saturated sky blue shell and soft cloud-white surfaces. The overall feel is optimistic, polished, and itinerary-driven rather than corporate or fintech-heavy. The interface leans on rounded cards, floating pills, friendly illustration, and map/trip content that feels lightweight and playful without becoming childish.

The visual rhythm comes from layering soft white cards over pale blue app backgrounds, then using a strong royal-travel blue for the main interactive moments. Typography is clean, bold, and highly legible, with dark navy headlines and muted blue-gray support text. The mascot illustration adds warmth, but the core system is still disciplined: rounded geometry, clear hierarchy, and tight use of blue as the main action color.

**Key Characteristics:**
- Saturated sky blue outer shell (`#1689F5`) framing the app
- Very light blue app canvas (`#F3F8FF`) with white and ice-blue cards
- Dark navy text (`#133B73`) for structure and trust
- Rounded cards with 24px to 32px radii
- Floating pill bottom navigation with one emphasized active destination
- Soft status chips, itinerary badges, and weather/info capsules
- Friendly illustration and travel imagery used as warmth, not decoration overload
- Minimal shadows, depth created mostly through tint contrast and large-radius layering

## 2. Color Palette & Roles

### Primary
- **Travel Blue** (`#1689F5`): Main CTA, active tab, map highlight, primary icon/button fill
- **Deep Navy** (`#133B73`): Headings, major labels, strong text
- **Cloud White** (`#FFFFFF`): Primary card and surface color
- **App Sky** (`#F3F8FF`): Main background wash behind cards

### Secondary
- **Soft Blue Surface** (`#EAF4FF`): Secondary cards, inactive soft surfaces, tag backgrounds
- **Mist Blue** (`#D7EBFF`): Borders, dividers, inactive track, subtle chips
- **Muted Slate Blue** (`#6F8FB5`): Secondary text, captions, helper labels
- **Cool Gray Blue** (`#A9BED8`): Disabled or tertiary icon/text states

### Interactive
- **Primary Hover / Pressed Blue** (`#0E73D8`): Pressed CTA state
- **Active Pill Blue** (`#3AA2FF`): Floating chat button and stronger emphasis fills
- **Success Soft** (`#EAF8F0`): Completed states, done chips
- **Danger Soft** (`#FFECEF`): Delete actions, destructive secondary actions

### Surface Roles
- **Base App Background** (`#F3F8FF`)
- **Primary Card Surface** (`#FFFFFF`)
- **Secondary Card Surface** (`#F7FBFF`)
- **Tinted Interactive Surface** (`#EAF4FF`)
- **Strong Interactive Fill** (`#1689F5`)

## 3. Typography Rules

### Font Direction
Use a clean humanist or neo-grotesk sans. The references feel closest to:
- **Primary UI / Headings**: `Inter`, `Plus Jakarta Sans`, `Manrope`, or `Nunito Sans`
- **Body**: same family as UI, no serif pairing needed
- **Numbers / Weather / Stats**: same family, heavier weights allowed

Avoid ornamental display fonts. This system relies more on weight, spacing, and color than font novelty.

### Hierarchy

| Role              | Size | Weight | Line Height | Notes                                    |
| ----------------- | ---- | ------ | ----------- | ---------------------------------------- |
| Screen Hero       | 40px | 800    | 1.05        | Large mobile-first section openers       |
| Screen Title      | 24px | 800    | 1.10        | Main page heading                        |
| Section Title     | 18px | 800    | 1.15        | “Upcoming trips”, “Itinerary”, “Explore” |
| Card Title XL     | 16px | 800    | 1.20        | Primary destination/trip card heading    |
| Card Title        | 15px | 700    | 1.25        | Secondary cards                          |
| Body              | 14px | 500    | 1.45        | Main descriptive copy                    |
| Body Small        | 13px | 500    | 1.40        | Support text                             |
| Label / Chip      | 12px | 700    | 1.20        | Tags, progress labels, meta badges       |
| Tiny Meta         | 11px | 700    | 1.20        | Over-card markers, tab labels            |
| Numeric Highlight | 28px | 800    | 1.00        | Weather, stats, counters                 |

### Typography Notes
- Headings should be dark navy, not pure black
- Support text should stay in muted slate blue
- Use bold weights generously for hierarchy, not larger sizes everywhere
- Chips and small labels should use uppercase or high-contrast semibold selectively

## 4. Component Stylings

### Buttons

**Primary CTA Pill**
- Background: `#1689F5`
- Text: `#FFFFFF`
- Radius: 999px or 20px to 24px on shorter buttons
- Padding: 12px to 16px vertical, 18px to 24px horizontal
- Shadow: optional soft blue shadow at low opacity

**Secondary Soft Pill**
- Background: `#EAF4FF`
- Text: `#1689F5` or `#133B73`
- Radius: 999px
- Used for refine, filter, and review actions

**Destructive Soft Action**
- Background: `#FFECEF`
- Text/Icon: warm red-pink
- Radius: 999px
- Used for delete or removal actions only

### Bottom Navigation

**Floating Nav Capsule**
- Background: `#FFFFFF`
- Radius: 26px to 32px
- Inset from bottom with visible breathing room
- Uses soft shadow or contrast from blue shell background

**Active Nav Item**
- Filled rounded capsule in pale blue or bright blue depending on emphasis
- Icon and label switch to strong blue
- Should feel like a lifted segment, not only a color change

### Cards & Containers

**Primary Content Card**
- Background: `#FFFFFF`
- Radius: 24px to 28px
- Padding: 16px to 20px
- Border: usually none, rely on surface separation
- Shadow: very light, blur-heavy, low opacity

**Secondary Information Card**
- Background: `#F7FBFF`
- Radius: 20px to 24px
- Used for itinerary rows, embedded previews, weather, mini stats

**Image Card**
- Large top image with rounded 20px to 24px clipping
- Text block beneath with generous whitespace
- Strong destination title over image or below depending on context

### Chips & Tags
- Background: `#EAF4FF`
- Text: `#1689F5` or `#6F8FB5`
- Radius: full pill
- Compact horizontal padding
- Used for country, weather window, status, selected filters

### Itinerary Blocks
- Day card background: `#FFFFFF`
- Inner activity card: `#F7FBFF`
- Progress bar: pale track with strong blue fill
- Completed states: use blue check + soft success highlight instead of heavy green UI

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Primary scale: 4, 8, 12, 16, 20, 24, 32, 40
- Cards should feel airy, especially on mobile
- Use larger top/bottom spacing around section headings than within card internals

### Border Radius Scale
- Small: 12px for tiny chips and small pills
- Medium: 16px to 20px for nested content blocks
- Large: 24px for standard cards
- XL: 28px to 32px for major floating surfaces and nav capsules
- Full Pill: 999px for buttons, chips, filters

### Screen Composition
- Blue shell or hero color often frames the phone composition
- App background inside the shell is pale blue, not pure white
- Major sections are stacked cards with soft separations rather than hard dividers
- Favor rounded containers and embedded sub-cards over flat list rows

## 6. Depth & Elevation

Depth is soft and friendly.

- Use light shadows sparingly: blur-heavy, low-opacity, low-y-offset
- Prefer surface tint shifts over dramatic drop shadows
- Floating elements like bottom nav and chat button can have stronger elevation than cards
- Avoid dark shadows and harsh borders

Example shadow direction:
- `0 10px 30px rgba(22, 137, 245, 0.08)` for floating surfaces
- `0 4px 16px rgba(19, 59, 115, 0.06)` for cards

## 7. Imagery & Illustration

- Use bright destination photography with strong blue/teal presence
- Crop images into rounded rectangles with generous corner radii
- Mascot or travel illustration can appear in hero sections and assistant moments
- Maps should use simplified light geographic fills with strong blue highlights
- Keep imagery warm and inviting, not gritty or editorial

## 8. Motion & Interaction

- Tabs and chips should transition with soft movement and fill changes
- Carousels should feel swipe-native with visible peeking cards
- Chat suggestions and travel prompts can float above the layout with rounded blue pills
- Use subtle scale or tint changes on press, not dramatic animations

## 9. Do's and Don'ts

### Do
- Use bright blue for primary actions and active navigation states
- Keep surfaces rounded and spacious
- Use navy for hierarchy and trust
- Layer white cards over pale blue backgrounds
- Let travel imagery do some of the emotional work
- Use chips generously for structure, but keep them soft and compact

### Don't
- Don’t introduce dark mode styling into this visual system unless intentionally redesigned
- Don’t use harsh black text or stark gray borders
- Don’t flatten the UI into plain white screens with rectangular cards
- Don’t overuse gradients; this system is mostly solid fills and tint layering
- Don’t make the bottom navigation look like a standard Android bar; it should feel floating and capsule-based

## 10. Responsive Behavior

This system is mobile-first.

### Mobile Rules
- Cards should nearly fill the width with small outer margins
- Floating nav should remain prominent and thumb-friendly
- Hero sections should keep illustration or imagery visible without crowding the title
- Carousels should show partial neighboring cards to imply swipe behavior

## 11. LexChain Legal Repository Adaptation

When this system is adapted from travel UI into LexChain's legal-document repository flows, keep the same rounded, bright, mobile-first language but shift the content behavior toward trust, upload clarity, and status communication.

### Content Translation
- Destination cards become document and repository cards.
- Weather/info capsules become integrity, processing, and access-status capsules.
- Itinerary progress patterns become upload-processing step flows.
- Assistant drafts become summary or review cards for extracted legal content.

### Interaction Tone
- Primary blue still marks the main action, but use it for secure workflow steps such as `Upload Document`, `Verify Integrity`, and `Grant Access`.
- Secondary actions should remain pale-blue or white pills.
- Critical status should rely on icon + label + color together, never color alone.

## 12. FAB Toolbar Pattern

For LexChain's mobile add-document flow, the recommended floating action pattern is a single closed FAB that expands into two choices: `Upload` and `Camera`.

### Default Pattern
- Closed state: one primary floating `Upload/Add` button.
- Open state: reveal `Upload` and `Camera` as secondary actions above the FAB.
- Treat `Camera` as an alternative acquisition method, not a co-equal primary action.

### Why This Pattern Wins
- It matches the user intent better: users usually think "add a document" first.
- It keeps the resting UI simpler and less visually heavy.
- It stays closer to the floating-toolbar reference style used in the LexChain kit.

### Mode Variants
- Standard mode: use the compact pill-action version for the main app flow.
- Settings or old-mode variant: a larger action-card version is acceptable when you want bigger targets, stronger explicitness, or accessibility-oriented sizing.

### Naming In `layout.pen`
- `Toolbar/FabClosed`: default closed floating action toolbar
- `Toolbar/FabOpen`: default expanded floating action toolbar
- Large/old-mode variants should be added as separate components rather than replacing the standard pair

### Tablet / Large Screen Adaptation
- Preserve the same rounded-card language
- Increase outer margins instead of stretching card internals too much
- Convert stacked sections into 2-column modules only when content benefits from it

## 11. Agent Prompt Guide

### Quick Color Reference
- Primary blue: `#1689F5`
- Deep navy text: `#133B73`
- App background: `#F3F8FF`
- White card: `#FFFFFF`
- Soft blue surface: `#EAF4FF`
- Muted text: `#6F8FB5`

### Example Component Prompts
- “Create a travel card on a pale blue app background. White 24px radius card, destination photo on top, navy title, muted subtitle, bright blue CTA chip.”
- “Build a floating bottom navigation with white capsule background, one active blue-filled tab, soft shadow, and rounded 28px corners.”
- “Design a trip itinerary section with stacked white day cards, blue progress accents, compact status pills, and soft secondary activity blocks.”
- “Create an assistant draft card: white rounded card, navy heading, blue tags, primary blue CTA, secondary soft-blue CTA.”
