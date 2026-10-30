import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput } from 'react-native';

import { Screen } from '@/components/screen';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useSettings } from '@/features/settings/store';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

export default function NameScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const name = useSettings((state) => state.name);
  const setName = useSettings((state) => state.setName);

  return (
    <Screen withBottomInset>
      <SubScreenHeader title={t('profile.name')} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('profile.nameInputPlaceholder')}
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.tint}
          style={styles.input}
          autoFocus
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={40}
          returnKeyType="done"
          clearButtonMode="while-editing"
          accessibilityLabel={t('profile.name')}
        />
        <ThemedText type="subhead" themeColor="textSecondary" style={styles.footer}>
          {t('profile.nameFooter')}
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
  input: {
    height: 54,
    borderRadius: Radius.medium,
    backgroundColor: theme.surface,
    paddingHorizontal: Spacing.four,
    fontSize: 17,
    color: theme.text,
    ...Shadows.card,
  },
  footer: {
    paddingHorizontal: Spacing.one,
  },
}));
