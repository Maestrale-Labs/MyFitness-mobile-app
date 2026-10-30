import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { Icon, type IconData } from '@/components/icon';
import { icons } from '@/constants/icons';
import { useTheme } from '@/hooks/use-theme';

function tabIcon(icon: IconData) {
  return function TabIcon({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: ColorValue;
    size: number;
  }) {
    // The active tab is marked by its pill and a heavier stroke, not by color.
    return <Icon icon={icon} size={size} color={color} strokeWidth={focused ? 2 : 1.5} />;
  };
}

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.exercises'), tabBarIcon: tabIcon(icons.tabExercises) }}
      />
      <Tabs.Screen
        name="workouts"
        options={{ title: t('tabs.workouts'), tabBarIcon: tabIcon(icons.tabWorkouts) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: tabIcon(icons.tabProfile) }}
      />
    </Tabs>
  );
}
