# shadcn Button Hover Fix

## Problem

Button components from shadcn/ui were not displaying hover effects properly. The cursor would change to pointer, but the background color transitions were not working as expected.

## Root Cause

The issue was with the **CSS configuration format** in `app/globals.css`. The project was using an outdated Tailwind v4 CSS format that was incompatible with shadcn/ui's latest requirements.

### What Was Wrong

Our original `globals.css` was using:
- **HSL color format** (`--primary: 207 90% 54%`)
- **@layer base** with direct CSS properties
- **Manual hsl() wrapping** in CSS rules
- **No @theme inline directive**
- **No @custom-variant for dark mode**

### What Was Needed

shadcn/ui with Tailwind v4 requires:
- **OKLCH color format** for better perceptual uniformity
- **@theme inline directive** to map CSS variables to Tailwind tokens
- **@custom-variant dark** for proper dark mode handling
- **@apply directives** in base layer for Tailwind utilities

## Solution

### Step 1: Compare with Working Implementation

Created a fresh Next.js project with shadcn/ui using:
```bash
npx shadcn@latest init
npx shadcn@latest add button
```

Compared the working `globals.css` format.

### Step 2: Update globals.css Format

Replaced the entire `app/globals.css` with the proper Tailwind v4 + shadcn format:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.5rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.54 0.18 237);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.96 0.01 237);
  --secondary-foreground: oklch(0.25 0.05 237);
  --muted: oklch(0.96 0.005 237);
  --muted-foreground: oklch(0.556 0.01 237);
  --accent: oklch(0.94 0.015 237);
  --accent-foreground: oklch(0.25 0.05 237);
  --destructive: oklch(0.58 0.245 27.325);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.82 0.005 237);
  --input: oklch(0.88 0.005 237);
  --ring: oklch(0.54 0.18 237);
}

.dark {
  --background: oklch(0.1 0.005 237);
  --foreground: oklch(0.95 0 0);
  --card: oklch(0.12 0.005 237);
  --card-foreground: oklch(0.95 0 0);
  --popover: oklch(0.12 0.005 237);
  --popover-foreground: oklch(0.95 0 0);
  --primary: oklch(0.54 0.18 237);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.25 0.01 237);
  --secondary-foreground: oklch(0.95 0 0);
  --muted: oklch(0.18 0.005 237);
  --muted-foreground: oklch(0.6 0.01 237);
  --accent: oklch(0.2 0.01 237);
  --accent-foreground: oklch(0.95 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0.01 237);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 3: Clear Cache and Restart

```bash
rm -rf .next
npm run dev
```

## Key Differences Explained

### 1. @custom-variant dark
```css
@custom-variant dark (&:is(.dark *));
```
This tells Tailwind v4 how to handle the `dark:` variant. Without this, dark mode styles won't apply correctly.

### 2. @theme inline
```css
@theme inline {
  --color-primary: var(--primary);
  /* ... other mappings ... */
}
```
This maps CSS variables to Tailwind's color system, allowing classes like `bg-primary` to work with our custom colors.

### 3. OKLCH Color Format
```css
/* Old HSL format */
--primary: 207 90% 54%;

/* New OKLCH format */
--primary: oklch(0.54 0.18 237);
```
OKLCH provides better perceptual uniformity and wider color gamut support.

### 4. @apply Directives
```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```
Uses Tailwind utilities instead of raw CSS properties for consistency.

## Color Theme

The fix also standardized the color theme using a blue hue (237°) throughout:
- **Light mode**: Bright backgrounds with dark blue accents
- **Dark mode**: Dark backgrounds with light text and blue accents
- **Hover states**: Subtle background color changes using accent colors

## Result

After applying this fix:
- ✅ Button hover effects work correctly
- ✅ Cursor changes to pointer on hover
- ✅ Background colors transition smoothly
- ✅ Dark mode works properly
- ✅ All button variants (default, outline, ghost, etc.) display correctly

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/docs/components/button)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- Test project: `/Volumes/T7 Shield/01_Projects/DueRify/Test/test-project`

## Date Fixed

November 20, 2025
