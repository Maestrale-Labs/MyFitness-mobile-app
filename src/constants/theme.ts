/**
 * Design tokens, modelled on Paniere: cool neutral greys, white cards with soft shadows,
 * and a single brand color (orange).
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
    background: '#F1F1F4',
    surface: '#FFFFFF',
    surfaceMuted: '#E9E9EE',
    text: '#111111',
    heading: '#25282C',
    textSecondary: '#6E6E73',
    separator: '#E5E5EA',
  },
  dark: {
    brand,
    tint: '#F07A3E',
    onTint: '#101214',
    brandSoft: '#3A2419',
    background: '#101214',
    surface: '#1B1E21',
    surfaceMuted: '#2A2E33',
    text: '#F3F4F5',
    heading: '#E6E8EA',
    textSecondary: '#9BA1A8',
    separator: '#2E3338',
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
  small: 10,
  medium: 14,
  large: 18,
  pill: 999,
} as const;

export const Shadows = {
  /** Cards and round buttons. */
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  /** Elements floating over the content: the tab bar. */
  floating: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
} as const;

/** The floating pill tab bar. Screens under the tabs make room for it with `useTabBarInset()`. */
export const TabBar = {
  height: 61,
  widthRatio: 0.9,
  maxWidth: 440,
  marginHorizontal: 14,
  iconSize: 22,
  // On phones with a home indicator the bar overlaps part of the safe area;
  // on the others it keeps a minimum margin.
  minBottomMargin: 10,
  safeAreaOverlap: 14,
} as const;

export const MaxContentWidth = 720;
