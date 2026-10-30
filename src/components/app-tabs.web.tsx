import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Web is only a development preview; the shipped apps use native tabs. */
export default function AppTabs() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs style={{ flex: 1, backgroundColor: theme.background }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        style={[
          styles.tabList,
          { backgroundColor: theme.surface, borderTopColor: theme.separator },
        ]}>
        <TabTrigger name="(exercises)" href="/" asChild>
          <TabButton icon={{ ios: 'dumbbell.fill', android: 'fitness_center' }}>
            {t('tabs.exercises')}
          </TabButton>
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton icon={{ ios: 'person.crop.circle.fill', android: 'account_circle' }}>
            {t('tabs.profile')}
          </TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

// `ref` is omitted from the props type only: its RN 0.88 typing doesn't match `Pressable`.
function TabButton({
  children,
  isFocused,
  icon,
  ...props
}: Omit<TabTriggerSlotProps, 'ref'> & { icon: IconName }) {
  const theme = useTheme();
  const color = isFocused ? theme.tint : theme.textSecondary;

  return (
    <Pressable {...props} style={styles.tabButton}>
      <View style={[styles.indicator, isFocused && { backgroundColor: theme.brandSoft }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <ThemedText type="caption" style={{ color, fontWeight: isFocused ? 600 : 500 }}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.six,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    alignItems: 'center',
    gap: Spacing.one,
    minWidth: 88,
  },
  indicator: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
});
