import { ScrollView } from 'react-native';

import { Card } from '@/components/card';
import type { IconData } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SettingsRow } from '@/components/settings-row';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

type OptionListScreenProps<T extends string> = {
  title: string;
  options: { value: T; label: string; icon?: IconData }[];
  selected: T;
  onSelect: (value: T) => void;
  footer?: string;
};

/** A single-choice settings page: a card of options with a check circle on the selected one. */
export function OptionListScreen<T extends string>({
  title,
  options,
  selected,
  onSelect,
  footer,
}: OptionListScreenProps<T>) {
  const styles = useStyles();

  return (
    <Screen withBottomInset>
      <SubScreenHeader title={title} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          {options.map((option, index) => (
            <SettingsRow
              key={option.value}
              icon={option.icon}
              label={option.label}
              selected={option.value === selected}
              onPress={() => onSelect(option.value)}
              last={index === options.length - 1}
            />
          ))}
        </Card>
        {footer ? (
          <ThemedText type="subhead" themeColor="textSecondary" style={styles.footer}>
            {footer}
          </ThemedText>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  content: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  footer: {
    paddingHorizontal: Spacing.one,
  },
}));
