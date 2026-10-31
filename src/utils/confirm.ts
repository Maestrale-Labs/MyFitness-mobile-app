import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Shows the confirm button in red on iOS. */
  destructive?: boolean;
};

/**
 * Asks a yes/no question and resolves to the answer. Native alert on iOS and Android;
 * the browser's dialog on web, where `Alert` has no buttons.
 */
export function confirm({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
