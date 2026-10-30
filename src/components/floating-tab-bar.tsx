import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Shadows, TabBar } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { tabBarBottom } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

const PILL_GAP = 5;
const PILL_RADIUS = (TabBar.height - PILL_GAP * 2) / 2;

/**
 * Floating pill tab bar, as in Paniere. Each item fills its whole column so the thumb
 * hits it outside the grey pill of the active tab too.
 */
export function FloatingTabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const styles = useStyles();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: tabBarBottom(insets.bottom) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              aria-selected={focused}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              hitSlop={{ top: 8, bottom: 12 }}
              style={styles.item}>
              <View style={styles.pill}>
                {/* The active background is its own view, mounted with its color and radius:
                    recoloring an existing view drew square corners on Android (new architecture). */}
                {focused ? <View style={styles.pillActive} /> : null}
                {/* A view, so the icon stacks above the active background on web too. */}
                <View>
                  {options.tabBarIcon?.({ focused, color: theme.text, size: TabBar.iconSize })}
                </View>
                <Text numberOfLines={1} allowFontScaling={false} style={styles.label}>
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    left: TabBar.marginHorizontal,
    right: TabBar.marginHorizontal,
    alignItems: 'center',
  },
  // The same gap between the bar's edge and the active pill on all sides, and between pills.
  bar: {
    flexDirection: 'row',
    width: `${TabBar.widthRatio * 100}%`,
    maxWidth: TabBar.maxWidth,
    height: TabBar.height,
    borderRadius: TabBar.height / 2,
    backgroundColor: theme.surface,
    padding: PILL_GAP,
    gap: PILL_GAP,
    ...Shadows.floating,
  },
  item: {
    flex: 1,
    height: '100%',
  },
  pill: {
    flex: 1,
    borderRadius: PILL_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  pillActive: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: PILL_RADIUS,
    backgroundColor: theme.surfaceMuted,
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    color: theme.text,
  },
}));
