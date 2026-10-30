import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type IconData = IconSvgElement;

type IconProps = {
  icon: IconData;
  size?: number;
  /** Defaults to the theme's text color. */
  color?: ColorValue;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

/** The only place icons are rendered: pick them in `src/constants/icons.ts`. */
export function Icon({ icon, size = 22, color, strokeWidth = 1.6, style }: IconProps) {
  const theme = useTheme();

  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color ?? theme.text}
      strokeWidth={strokeWidth}
      style={style}
    />
  );
}
