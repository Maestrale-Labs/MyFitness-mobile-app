import { ScrollView, StyleSheet } from 'react-native';

import { ListRow, ListSection } from '@/components/list';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OptionListScreenProps<T extends string> = {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  footer?: string;
};

/** A single-choice settings screen: a list of options with a checkmark on the selected one. */
export function OptionListScreen<T extends string>({
  options,
  selected,
  onSelect,
  footer,
}: OptionListScreenProps<T>) {
  const theme = useTheme();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <ListSection footer={footer}>
        {options.map((option) => (
          <ListRow
            key={option.value}
            title={option.label}
            accessory="check"
            accessibilityRole="radio"
            selected={option.value === selected}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </ListSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
  },
});
