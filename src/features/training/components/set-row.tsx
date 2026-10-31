import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import { formatWeight, parseNumber } from '../format';
import type { LoggedSet } from '../types';

type SetRowProps = {
  number: number;
  set: LoggedSet;
  /** Shown in the reps field when empty, e.g. "10–12". */
  repsPlaceholder: string;
  onChange: (patch: Partial<LoggedSet>) => void;
  onToggleDone: () => void;
  last: boolean;
};

/** One set: number, weight, reps and a tick. Done sets turn orange. */
export function SetRow({
  number,
  set,
  repsPlaceholder,
  onChange,
  onToggleDone,
  last,
}: SetRowProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();
  // While a field is being edited it shows the raw text, so "22," can be typed on the way
  // to "22,5"; otherwise it shows the stored value, which can also change from outside.
  const [weightText, setWeightText] = useState<string | null>(null);
  const [repsText, setRepsText] = useState<string | null>(null);
  const weight = set.weightKg !== null ? formatWeight(set.weightKg, locale) : '';
  const reps = set.reps !== null ? String(set.reps) : '';

  return (
    <View style={[styles.row, set.done && styles.rowDone, !last && styles.divider]}>
      <Text style={styles.number}>{number}</Text>
      <TextInput
        value={weightText ?? weight}
        onFocus={() => setWeightText(weight)}
        onBlur={() => setWeightText(null)}
        onChangeText={(text) => {
          setWeightText(text);
          onChange({ weightKg: parseNumber(text) });
        }}
        placeholder="–"
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.tint}
        keyboardType="decimal-pad"
        style={styles.input}
        accessibilityLabel={`${t('session.set')} ${number}, ${t('session.kg')}`}
      />
      <TextInput
        value={repsText ?? reps}
        onFocus={() => setRepsText(reps)}
        onBlur={() => setRepsText(null)}
        onChangeText={(text) => {
          setRepsText(text);
          const value = parseNumber(text);
          onChange({ reps: value === null ? null : Math.round(value) });
        }}
        placeholder={repsPlaceholder}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.tint}
        keyboardType="number-pad"
        style={styles.input}
        accessibilityLabel={`${t('session.set')} ${number}, ${t('session.reps')}`}
      />
      <Pressable
        accessibilityRole="checkbox"
        aria-checked={set.done}
        accessibilityLabel={t('session.markDone', { number })}
        onPress={onToggleDone}
        hitSlop={8}
        style={[styles.check, set.done && styles.checkDone]}>
        <Icon
          icon={icons.setDone}
          size={20}
          strokeWidth={2.4}
          color={set.done ? theme.onTint : theme.textSecondary}
        />
      </Pressable>
    </View>
  );
}

/** Column headers matching `SetRow`. */
export function SetHeader() {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View style={[styles.row, styles.header]}>
      <Text style={[styles.number, styles.headerText]}>{t('session.set')}</Text>
      <Text style={[styles.headerText, styles.headerCell]}>{t('session.kg')}</Text>
      <Text style={[styles.headerText, styles.headerCell]}>{t('session.reps')}</Text>
      <View style={styles.checkSpace} />
    </View>
  );
}

const CHECK_SIZE = 40;

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  rowDone: {
    backgroundColor: theme.brandSoft,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  number: {
    width: 40,
    fontSize: 16,
    fontWeight: 600,
    color: theme.text,
  },
  input: {
    // flexBasis and minWidth 0: on web an input keeps its default width otherwise.
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 44,
    borderRadius: Radius.small,
    backgroundColor: theme.background,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 600,
    color: theme.text,
  },
  check: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceMuted,
  },
  checkDone: {
    backgroundColor: theme.tint,
  },
  header: {
    paddingTop: Spacing.three,
    paddingBottom: 0,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: theme.textSecondary,
  },
  headerCell: {
    flex: 1,
    flexBasis: 0,
    textAlign: 'center',
  },
  checkSpace: {
    width: CHECK_SIZE,
  },
}));
