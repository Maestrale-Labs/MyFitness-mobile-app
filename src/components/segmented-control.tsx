import { Pressable, Text, View } from 'react-native';

import { Radius, Shadows, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
};

/** iOS-style switch between views: a grey pill with the selected segment raised in white. */
export function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentedControlProps<T>) {
  const styles = useStyles();

  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            aria-selected={isSelected}
            onPress={() => onSelect(option.value)}
            style={[styles.segment, isSelected && styles.segmentSelected]}>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.pill,
    backgroundColor: theme.surfaceMuted,
  },
  segment: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
  },
  segmentSelected: {
    backgroundColor: theme.surface,
    ...Shadows.card,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.textSecondary,
  },
  labelSelected: {
    fontWeight: 600,
    color: theme.text,
  },
}));
