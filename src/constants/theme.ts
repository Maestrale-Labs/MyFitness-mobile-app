/**
 * Design tokens. Warm neutrals with an orange brand accent.
 *
 * - `brand` is the signature orange, for decorative fills (icons, splash, illustrations).
 * - `tint` is the accent for text, icons and selected fills: darker in light mode and
 *   lighter in dark mode so it stays readable (WCAG AA) on `background` and `surface`.
 *   Text drawn on a `tint` fill uses `onTint`.
 */

import '@/global.css';

import { Platform } from 'react-native';

const brand = '#E8622C';

export const Colors = {
  light: {
    brand,
    tint: '#BF4417',
    onTint: '#FFFFFF',
    brandSoft: '#FEF0E8',
    background: '#FAF9F5',
    surface: '#FFFFFF',
    surfaceMuted: '#F0EEE6',
    text: '#1F1E1D',
    textSecondary: '#6B6A65',
    separator: '#E6E3DA',
  },
  dark: {
    brand,
    tint: '#F07A3E',
    onTint: '#1A1918',
    brandSoft: '#3A2419',
    background: '#1A1918',
    surface: '#262624',
    surfaceMuted: '#30302E',
    text: '#F5F4EF',
    textSecondary: '#A6A39A',
    separator: '#3A3936',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemeColors = { [K in ThemeColor]: string };

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 24,
  pill: 999,
} as const;

export const MaxContentWidth = 720;
