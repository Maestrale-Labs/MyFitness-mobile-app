import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Icon, type IconData } from '@/components/icon';
import { Radius, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: IconData;
  /** primary: orange fill; secondary: grey fill; plain: orange text only. */
  variant?: 'primary' | 'secondary' | 'plain';
  disabled?: boolean;
  loading?: boolean;
};

/** Full-width pill button. */
export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const styles = useStyles();
  const theme = useTheme();
  const color =
    variant === 'primary' ? theme.onTint : variant === 'plain' ? theme.tint : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : icon ? (
        <View>
          <Icon icon={icon} size={20} color={color} strokeWidth={2} />
        </View>
      ) : null}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    height: 52,
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
  },
  primary: {
    backgroundColor: theme.tint,
  },
  secondary: {
    backgroundColor: theme.surfaceMuted,
  },
  plain: {
    height: 44,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 17,
    fontWeight: 600,
  },
}));
