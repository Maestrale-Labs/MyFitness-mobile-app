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

type SetTableProps = {
  sets: LoggedSet[];
  onChange: (setIndex: number, patch: Partial<LoggedSet>) => void;
  onToggle: (setIndex: number) => void;
};

/** The exercise's sets: kg and reps to fill in, and a tick for each. */
export function SetTable({ sets, onChange, onToggle }: SetTableProps) {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.number, styles.headerText]}>{t('session.set')}</Text>
        <Text style={[styles.headerText, styles.cell]}>{t('session.kg')}</Text>
        <Text style={[styles.headerText, styles.cell]}>{t('session.reps')}</Text>
        <View style={styles.checkSpace} />
      </View>
      {sets.map((set, index) => (
        <SetRow
          key={index}
          number={index + 1}
          set={set}
          onChange={(patch) => onChange(index, patch)}
          onToggle={() => onToggle(index)}
          last={index === sets.length - 1}
        />
      ))}
    </View>
  );
}

type SetRowProps = {
  number: number;
  set: LoggedSet;
  onChange: (patch: Partial<LoggedSet>) => void;
  onToggle: () => void;
  last: boolean;
};

function SetRow({ number, set, onChange, onToggle, last }: SetRowProps) {
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
        selectTextOnFocus
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
        placeholder="–"
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.tint}
        keyboardType="number-pad"
        selectTextOnFocus
        style={styles.input}
        accessibilityLabel={`${t('session.set')} ${number}, ${t('session.reps')}`}
      />
      <Pressable
        accessibilityRole="checkbox"
        aria-checked={set.done}
        accessibilityLabel={t('session.markDone', { number })}
        onPress={onToggle}
        hitSlop={8}
        style={({ pressed }) => [
          styles.check,
          set.done && styles.checkDone,
          pressed && styles.pressed,
        ]}>
        <Icon
          icon={icons.setDone}
          size={22}
          strokeWidth={2.6}
          color={set.done ? theme.onTint : theme.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const CHECK_SIZE = 48;

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
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: theme.textSecondary,
  },
  number: {
    width: 44,
    fontSize: 17,
    fontWeight: 600,
    color: theme.text,
  },
  // flexBasis and minWidth 0: on web an input keeps its default width otherwise.
  cell: {
    flex: 1,
    flexBasis: 0,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 52,
    borderRadius: Radius.small,
    backgroundColor: theme.background,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 700,
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
  pressed: {
    opacity: 0.7,
  },
  checkSpace: {
    width: CHECK_SIZE,
  },
}));
