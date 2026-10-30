import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, TabBar } from '@/constants/theme';

/** Distance of the floating tab bar from the bottom edge of the screen. */
export function tabBarBottom(safeAreaBottom: number): number {
  return Math.max(safeAreaBottom - TabBar.safeAreaOverlap, TabBar.minBottomMargin);
}

/**
 * Bottom padding for scrolling content under the tabs: the tab bar floats
 * (position: absolute) and would otherwise cover the last rows.
 */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return tabBarBottom(insets.bottom) + TabBar.height + Spacing.four;
}
