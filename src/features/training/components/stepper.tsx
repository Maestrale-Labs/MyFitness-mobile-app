import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

import { parseNumber } from '../format';

type StepperProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** How much − and + change the value. */
  step: number;
  format: (value: number) => string;
  /** Whole numbers only (reps) or decimals too (kg). */
  integer?: boolean;
};

/** A number to adjust with − and +, or to type directly. */
export function Stepper({ label, value, onChange, step, format, integer = false }: StepperProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  // While editing, the field shows the raw text, so "22," can be typed on the way to "22,5".
  const [text, setText] = useState<string | null>(null);
  const shown = value !== null ? format(value) : '';

  function nudge(direction: 1 | -1) {
    const next = Math.max(0, (value ?? 0) + direction * step);
    onChange(Math.round(next * 100) / 100);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('session.decrease', { label })}
          onPress={() => nudge(-1)}
          disabled={!value}
          hitSlop={6}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            !value && styles.disabled,
          ]}>
          <Icon icon={icons.decrease} size={20} strokeWidth={2.2} />
        </Pressable>
        <TextInput
          value={text ?? shown}
          onFocus={() => setText(shown)}
          onBlur={() => setText(null)}
          onChangeText={(typed) => {
            setText(typed);
            const parsed = parseNumber(typed);
            onChange(parsed === null ? null : integer ? Math.round(parsed) : parsed);
          }}
          placeholder="–"
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.tint}
          keyboardType={integer ? 'number-pad' : 'decimal-pad'}
          selectTextOnFocus
          style={styles.input}
          accessibilityLabel={label}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('session.increase', { label })}
          onPress={() => nudge(1)}
          hitSlop={6}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Icon icon={icons.increase} size={20} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const BUTTON_SIZE = 40;

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    flexBasis: 0,
    gap: Spacing.two,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: theme.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'stretch',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceMuted,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  // flexBasis and minWidth 0: on web an input keeps its default width otherwise.
  input: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 56,
    borderRadius: Radius.small,
    backgroundColor: theme.background,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 700,
    color: theme.text,
  },
}));
