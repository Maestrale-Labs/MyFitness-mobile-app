import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconData } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

type SettingsRowProps = {
  label: string;
  icon?: IconData;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  /** Set for the options of a single choice: shows an empty or checked circle. */
  selected?: boolean;
  /** The last row of a card has no divider. */
  last?: boolean;
  accessibilityRole?: 'button' | 'link';
};

/** Settings-style row: icon, label (and subtitle), value, then a chevron or a choice circle. */
export function SettingsRow({
  label,
  icon,
  subtitle,
  value,
  onPress,
  selected,
  last = false,
  accessibilityRole = 'button',
}: SettingsRowProps) {
  const styles = useStyles();
  const theme = useTheme();
  const isChoice = selected !== undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={isChoice ? 'radio' : onPress ? accessibilityRole : undefined}
      aria-checked={isChoice ? selected : undefined}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
        !last && styles.rowDivider,
      ]}>
      {icon ? (
        <View style={styles.icon}>
          <Icon icon={icon} size={22} />
        </View>
      ) : null}
      <View style={styles.textColumn}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {value ? (
        <Text numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {isChoice ? (
        <Icon
          icon={selected ? icons.checked : icons.unchecked}
          size={22}
          color={selected ? theme.tint : theme.textSecondary}
          strokeWidth={selected ? 2 : 1.5}
        />
      ) : onPress ? (
        <Icon icon={icons.chevronRight} size={18} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
    backgroundColor: theme.surface,
  },
  rowPressed: {
    backgroundColor: theme.background,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  icon: {
    width: 24,
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 16,
    color: theme.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  value: {
    fontSize: 15,
    color: theme.textSecondary,
    maxWidth: 160,
  },
}));
