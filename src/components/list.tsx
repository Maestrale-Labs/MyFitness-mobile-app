import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ListSectionProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
};

/** A grouped list, like the sections of the iOS Settings app. */
export function ListSection({ title, footer, children }: ListSectionProps) {
  const theme = useTheme();
  const rows = Children.toArray(children);

  return (
    <View style={styles.section}>
      {title ? (
        <ThemedText type="footnote" themeColor="textSecondary" style={styles.sectionTitle}>
          {title.toUpperCase()}
        </ThemedText>
      ) : null}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? (
              <View style={[styles.separator, { backgroundColor: theme.separator }]} />
            ) : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <ThemedText type="footnote" themeColor="textSecondary" style={styles.sectionFooter}>
          {footer}
        </ThemedText>
      ) : null}
    </View>
  );
}

type ListRowProps = {
  title: string;
  value?: string;
  icon?: IconName;
  /** `chevron` for rows that open a screen, `check` for the selected option of a choice. */
  accessory?: 'chevron' | 'check';
  onPress?: () => void;
  accessibilityRole?: 'button' | 'link' | 'radio';
  selected?: boolean;
};

export function ListRow({
  title,
  value,
  icon,
  accessory,
  onPress,
  accessibilityRole = 'button',
  selected,
}: ListRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityRole === 'radio' ? { checked: !!selected } : undefined}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceMuted }]}>
      {icon ? (
        <View style={[styles.iconBadge, { backgroundColor: theme.brandSoft }]}>
          <Icon name={icon} size={17} color={theme.tint} />
        </View>
      ) : null}
      <ThemedText style={styles.rowTitle} numberOfLines={1}>
        {title}
      </ThemedText>
      {value ? (
        <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.rowValue}>
          {value}
        </ThemedText>
      ) : null}
      {accessory === 'chevron' ? (
        <Icon
          name={{ ios: 'chevron.right', android: 'chevron_right' }}
          size={14}
          weight="semibold"
          color={theme.textSecondary}
        />
      ) : null}
      {accessory === 'check' && selected ? (
        <Icon
          name={{ ios: 'checkmark', android: 'check' }}
          size={17}
          weight="semibold"
          color={theme.tint}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.four,
  },
  sectionFooter: {
    paddingHorizontal: Spacing.four,
  },
  card: {
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.four,
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    flex: 1,
  },
  rowValue: {
    flexShrink: 1,
    maxWidth: '60%',
  },
});
