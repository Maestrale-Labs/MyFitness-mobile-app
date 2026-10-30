import { StyleSheet, Text, type TextProps } from 'react-native';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Sizes follow the iOS text styles, which also read well on Android.
export type TextType =
  | 'largeTitle'
  | 'title'
  | 'title2'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption';

export type ThemedTextProps = TextProps & {
  type?: TextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  // Titles are a shade lighter than body text, as in Paniere.
  const color = theme[themeColor ?? (type === 'title' ? 'heading' : 'text')];

  return <Text style={[{ color }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: 700,
  },
  // Tab titles: medium weight, so they don't feel heavy.
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 500,
    letterSpacing: -0.3,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 700,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 600,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
});
