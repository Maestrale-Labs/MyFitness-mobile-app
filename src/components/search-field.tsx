import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  clearLabel: string;
};

/** White pill search bar, as in Paniere's catalog. */
export function SearchField({ value, onChangeText, placeholder, clearLabel }: SearchFieldProps) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Icon icon={icons.search} size={20} color={theme.textSecondary} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.tint}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel={placeholder}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}>
          <Icon icon={icons.clear} size={20} color={theme.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 48,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
    backgroundColor: theme.surface,
    ...Shadows.card,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 17,
    color: theme.text,
  },
}));
