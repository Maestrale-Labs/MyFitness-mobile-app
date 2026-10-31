import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import { formatSets } from '../format';
import type { LoggedSet } from '../types';

type SetListProps = {
  sets: LoggedSet[];
  /** The set being done now, highlighted; null when all are done. */
  currentIndex: number | null;
  /** Reopens a finished set to correct it. */
  onEdit: (setIndex: number) => void;
};

/** The exercise's sets at a glance: finished ones with what was lifted, the current one. */
export function SetList({ sets, currentIndex, onEdit }: SetListProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

  return (
    <View>
      {sets.map((set, index) => {
        const value = formatSets([set], locale) || '–';
        const current = index === currentIndex;
        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={t('session.setSummary', { number: index + 1, value })}
            disabled={!set.done}
            onPress={() => onEdit(index)}
            style={({ pressed }) => [
              styles.row,
              index < sets.length - 1 && styles.divider,
              current && styles.rowCurrent,
              pressed && styles.pressed,
            ]}>
            <View
              style={[styles.badge, set.done && styles.badgeDone, current && styles.badgeCurrent]}>
              {set.done ? (
                <Icon icon={icons.setDone} size={16} strokeWidth={2.6} color={theme.onTint} />
              ) : (
                <Text style={[styles.badgeText, current && styles.badgeTextCurrent]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.value, !set.done && !current && styles.valuePending]}>
              {set.done || current
                ? value
                : t('session.setOf', { current: index + 1, total: sets.length })}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const BADGE = 28;

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
  rowCurrent: {
    backgroundColor: theme.brandSoft,
  },
  pressed: {
    backgroundColor: theme.background,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceMuted,
  },
  badgeDone: {
    backgroundColor: theme.tint,
  },
  badgeCurrent: {
    borderWidth: 2,
    borderColor: theme.tint,
    backgroundColor: theme.surface,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.textSecondary,
  },
  badgeTextCurrent: {
    color: theme.tint,
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontWeight: 500,
    color: theme.text,
  },
  valuePending: {
    color: theme.textSecondary,
  },
}));
