import { StyleSheet, Switch, Text, View } from 'react-native';

import { Icon, type IconData } from '@/components/icon';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

type SwitchRowProps = {
  label: string;
  icon?: IconData;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** The last row of a card has no divider. */
  last?: boolean;
};

/** Settings-style row with an on/off switch, laid out like `SettingsRow`. */
export function SwitchRow({
  label,
  icon,
  subtitle,
  value,
  onValueChange,
  last = false,
}: SwitchRowProps) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      {icon ? (
        <View style={styles.icon}>
          <Icon icon={icon} size={22} />
        </View>
      ) : null}
      <View style={styles.textColumn}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ true: theme.tint, false: theme.surfaceMuted }}
        ios_backgroundColor={theme.surfaceMuted}
      />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    backgroundColor: theme.surface,
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
}));
