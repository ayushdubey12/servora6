---
name: Precision Glass
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8b90a0'
  outline-variant: '#414755'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4b8eff'
  on-primary-container: '#00285c'
  inverse-primary: '#005bc1'
  secondary: '#68d3ff'
  on-secondary: '#003546'
  secondary-container: '#139cc7'
  on-secondary-container: '#002e3d'
  tertiary: '#ffb595'
  on-tertiary: '#571e00'
  tertiary-container: '#ef6719'
  on-tertiary-container: '#4c1a00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#bee9ff'
  secondary-fixed-dim: '#68d3ff'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#004d64'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

This design system centers on a "Precision Minimalism" aesthetic, designed for high-density information environments where clarity is paramount. The personality is clinical, sophisticated, and technically adept. 

The style utilizes **Glassmorphism** as its primary depth engine, but applies it with architectural rigor rather than whimsical fluff. Surfaces are thin, edges are sharp, and background blurs are heavy to ensure legibility remains high despite the translucency. This creates a sense of "digital hardware"—a UI that feels like a high-end physical instrument. The emotional response should be one of complete control, calm efficiency, and quiet luxury.

## Colors

The palette is optimized for a dark-mode-first experience to maximize the impact of translucent glass effects. 

- **Primary**: A high-vibrancy "Electric Blue" used exclusively for action states and critical indicators.
- **Secondary**: A "Cyan Frost" used for subtle accents and data visualization.
- **Neutral**: A deep "Obsidian" base. Surface colors are derived from varying opacities of white and grey overlays on this base to maintain a unified tonal range.
- **Functional**: Success, Warning, and Error colors are desaturated and lean towards cooler temperatures to fit the clinical aesthetic.

## Typography

The typography is built for precision and high-density readability. By utilizing **Geist** for the majority of the interface, we achieve a technical, developer-centric feel with superior legibility at small sizes. 

**JetBrains Mono** is introduced for labels, metadata, and data points to provide a distinct visual "grid" for the eye to follow when scanning information. Tracking is intentionally tight on headlines to create a compact, authoritative look, while labels utilize slightly increased tracking for clarity at microscopic sizes. All weights are chosen to maintain high contrast against blurred glass backgrounds.

## Layout & Spacing

This design system adheres to a strict **8px grid** (the "Octal System"). All dimensions, padding, and margins must be multiples of 8. 

- **Desktop**: A 12-column fluid grid with 16px gutters. Max container width is 1440px.
- **Tablet**: An 8-column fluid grid with 16px gutters.
- **Mobile**: A 4-column fluid grid with 16px gutters and 16px side margins.

Layouts should favor high-density information clusters over excessive whitespace. Use vertical stacks and tight groupings to keep related data within the same visual field.

## Elevation & Depth

Depth is established through **Glassmorphism** and precise lighting, rather than traditional shadows.

1.  **Surfaces**: Backgrounds use a 40px to 60px backdrop blur with a semi-transparent fill (`rgba(255, 255, 255, 0.04)`).
2.  **Borders**: Every glass container must have a 1px solid border at 10% opacity white. This "specular edge" defines the shape against complex backgrounds.
3.  **Tiering**: Increased elevation is represented by increased opacity of the fill and a subtle inner glow on the top edge to simulate a light source from above. 
4.  **Shadows**: Use sparingly. When required, use a 0-spread, wide-radius blur in a neutral dark tone to lift the element without muddying the glass effect.

## Shapes

To maintain the "Precision" narrative, the shape language is **Soft (0.25rem)**. This provides enough rounding to feel modern and "human-designed" without sacrificing the technical, sharp alignment of the 8px grid. 

- **Buttons & Inputs**: 4px (0.25rem) radius.
- **Large Cards/Modals**: 8px (0.5rem) radius.
- **Inner Elements**: When nested, inner corners should be 2px smaller than outer corners to maintain visual concentricity.

## Components

- **Buttons**: Use a solid Primary color for high-emphasis actions. Secondary actions use the glass effect with a 1px white border. Text should be all-caps for labels or Medium weight Geist.
- **Input Fields**: Ghost-style with a 1px bottom border or subtle 4-sided glass border. Use JetBrains Mono for placeholder text to signal "data entry."
- **Cards**: Background blur (40px) with 4px border radius. No drop shadow. Content should be tightly packed using the 8px grid.
- **Chips/Tags**: Small, 2px radius, utilizing the `label-sm` JetBrains Mono typography for a "serialized" look.
- **Lists**: Rows separated by 1px borders (10% opacity). Hover states should trigger a subtle increase in the glass fill opacity (from 4% to 8%).
- **Scrollbars**: Minimalist, thin, and non-intrusive. Gray-scale only.