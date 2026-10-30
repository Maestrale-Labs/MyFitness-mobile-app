import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Screens under the tabs have the tab bar below them: no bottom inset there. */
  withBottomInset?: boolean;
};

/** Page container: theme background, top safe area, side margins. There are no native headers. */
export function Screen({ children, style, withBottomInset = false }: ScreenProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: withBottomInset ? insets.bottom : 0 },
      ]}>
      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
}));
