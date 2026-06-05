# Design System Specification

## Brand Colors
- **Primary Indigo (Accent):** Tailwind `indigo-600`
- **Background Slate:** `bg-slate-50` / `bg-slate-900`
- **Text Strategy:** High contrast readability. \`text-slate-900\` for primary headings, \`text-slate-500\` for softer captions.

## Typography
Inherited from `font-sans` with deep legible tracking adjustments native to Vite templates.

## Spacing & Geometry
- **Corners:** Consistent use of \`rounded-xl\`, \`rounded-2xl\` for panels, emphasizing "soft, approachable tech".
- **Borders:** Subtle bounding through \`border-slate-200\` keeps shapes clean without overpowering the content hierarchy.
- **Shadows:** Floating depth via \`shadow-md\` and \`shadow-xl\` applied to cards bridging interactive prominence against static backdrops.

## Loading and Animations
Strictly handled by \`framer-motion\`, primarily manipulating `opacity` to invoke fade-based visual state adjustments (preventing distracting layout shifts).
