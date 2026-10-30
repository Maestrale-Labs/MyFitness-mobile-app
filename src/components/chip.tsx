import { Pressable, Text } from 'react-native';

import { Radius, Shadows, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** A toggleable filter pill: white with a soft shadow, orange when selected. */
export function Chip({ label, selected, onPress }: ChipProps) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      aria-selected={selected}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  chip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
    backgroundColor: theme.surface,
    ...Shadows.card,
  },
  chipSelected: {
    backgroundColor: theme.tint,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.text,
  },
  labelSelected: {
    fontWeight: 600,
    color: theme.onTint,
  },
}));
