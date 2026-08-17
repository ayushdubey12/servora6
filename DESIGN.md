---
name: Plush Clay
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#a43073'
  on-secondary: '#ffffff'
  secondary-container: '#fc79bd'
  on-secondary-container: '#76014e'
  tertiary: '#006949'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855d'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#ffd8e7'
  secondary-fixed-dim: '#ffafd3'
  on-secondary-fixed: '#3d0026'
  on-secondary-fixed-variant: '#85145a'
  tertiary-fixed: '#68fcbf'
  tertiary-fixed-dim: '#45dfa4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is built on the principles of **Claymorphism**, a tactile and approachable evolution of soft UI. It targets creative platforms, educational tools, and modern wellness apps that prioritize a friendly, non-intimidating user experience. The aesthetic mimics high-end 3D renders using 2D CSS techniques, specifically dual inner shadows to create volume.

The personality is optimistic and playful. The UI should feel "squishy" to the touch, evoking a sense of physical comfort and whimsy. To maintain a modern edge, the soft elements are set against a clean, expansive white background with ample negative space, ensuring the 3D effects remain the hero of the interface.

## Colors

The palette utilizes vibrant, saturated pastels that provide enough contrast for accessibility while maintaining a "candy-coated" feel. 

- **Primary (Indigo):** Used for main actions and branding.
- **Secondary (Pink):** Used for accents, notifications, and secondary highlights.
- **Tertiary (Mint):** Reserved for success states and positive reinforcement.
- **Neutral (Slate):** Used sparingly for text and subtle borders to keep the focus on the colorful clay elements.

The background is a pure or slightly off-white (#FAFAFA) to allow the shadows and highlights of the clay elements to pop without visual mud.

## Typography

This design system utilizes **Plus Jakarta Sans** across all levels. Its soft curves and modern geometry perfectly complement the rounded clay components. 

Headlines are set with extra-bold weights and tight letter-spacing to create a "heavy" visual presence that matches the thickness of the 3D elements. Body text remains medium-weight to ensure legibility against the vibrant background colors. Labels are frequently uppercase or high-weight to maintain the playful, bold character of the system.

## Layout & Spacing

The layout philosophy follows a **fluid grid** with generous margins to allow the "clay" components enough room to breathe. Elements should never feel cramped; the 3D shadows require extra white space to avoid visual overlap.

- **Desktop:** 12-column grid, 24px gutters, 80px side margins.
- **Tablet:** 8-column grid, 24px gutters, 40px side margins.
- **Mobile:** 4-column grid, 16px gutters, 20px side margins.

Use the 8px base unit for all internal component padding. Larger spacing values (LG, XL) are preferred between sections to emphasize the "floating" nature of the clay objects.

## Elevation & Depth

Depth is achieved through a specific stack of three shadows that create the "clay" effect:

1.  **Outer Shadow:** A soft, diffused drop shadow using a darker version of the background color (e.g., `rgba(0,0,0,0.08)`) with a large blur (20px-40px). This "lifts" the object off the page.
2.  **Inner Highlight:** A top-left inner shadow using white (`rgba(255,255,255,0.4)`) to simulate a light source hitting the top edge of the object.
3.  **Inner Shadow:** A bottom-right inner shadow using a darker shade of the component's own color (e.g., `rgba(0,0,0,0.2)`) to simulate the rounded "underbelly" of the clay shape.

Interactive elements should "press" down when clicked by reducing the outer shadow blur and shifting the inner shadow offsets.

## Shapes

The shape language is strictly **Pill-shaped**. Straight lines and sharp corners are avoided to maintain the friendly, organic feel. 

Small components (buttons, chips, inputs) use full pill-rounding. Larger containers (cards, modals) use the `rounded-xl` setting (3rem / 48px) to maintain a consistent radius-to-size ratio. Elements should appear inflated, never flat.

## Components

### Buttons
Primary buttons are pill-shaped with the full clay shadow stack. The text is bold and high-contrast (usually white). Hover states increase the "inflation" by slightly increasing the inner highlight.

### Chips
Chips use a lighter pastel version of the primary or secondary colors. They feature smaller shadow offsets to appear thinner than buttons, but still maintain the 3D rounded edges.

### Input Fields
Inputs are recessed. Instead of an outer shadow, they use an **inner shadow** to appear as if they are carved into the clay surface. When focused, they transition into an "outset" clay button style.

### Cards
Cards are large, white or very pale-tinted containers with `rounded-xl` corners. They use a very soft, large-radius outer shadow to float above the main background.

### Checkboxes & Radios
These are rendered as small clay "marbles." Checkboxes use a rounded-square (12px radius), while radios are perfect circles. When active, they "inflate" with a vibrant primary color fill.

### Additional Components: "Plushies"
Decorative 3D icons or blobs used as background elements. These should follow the same clay shadow rules but with more organic, irregular paths to enhance the playful aesthetic.