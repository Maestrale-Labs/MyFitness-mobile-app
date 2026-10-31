import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import type { CalendarDay } from '../calendar';

type WeekCalendarProps = {
  days: CalendarDay[];
  /** Opens a day, e.g. to see what was done or log a forgotten workout. */
  onSelect: (date: Date) => void;
};

/** Monday to Sunday: workouts done, the ones ahead, and rest days. */
export function WeekCalendar({ days, onSelect }: WeekCalendarProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

  return (
    <View style={styles.week}>
      {days.map((day) => {
        const workout = day.dayIndex !== null ? t('plan.day', { number: day.dayIndex + 1 }) : '';
        const date = day.date.toLocaleDateString(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
        const label = {
          done: t('home.calendarDone', { date, workout }),
          inProgress: t('home.calendarInProgress', { date, workout }),
          planned: t('home.calendarPlanned', { date, workout }),
          missed: t('home.calendarMissed', { date }),
          rest: t('home.calendarRest', { date }),
          beforeStart: date,
        }[day.status];
        const training = day.status !== 'rest' && day.status !== 'beforeStart';

        return (
          <Pressable
            key={day.date.toISOString()}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => onSelect(day.date)}
            style={({ pressed }) => [
              styles.day,
              day.isToday && styles.today,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.weekday, day.isToday && styles.todayText]}>
              {day.date.toLocaleDateString(locale, { weekday: 'narrow' })}
            </Text>
            <Text style={[styles.date, day.isToday && styles.todayText]}>{day.date.getDate()}</Text>
            <View
              style={[
                styles.mark,
                day.status === 'done' && styles.markDone,
                (day.status === 'planned' || day.status === 'inProgress') && styles.markPlanned,
                day.status === 'inProgress' && styles.markInProgress,
                day.status === 'missed' && styles.markMissed,
                !training && styles.markRest,
              ]}>
              {day.status === 'done' ? (
                <Icon icon={icons.setDone} size={14} strokeWidth={3} color={theme.onTint} />
              ) : null}
            </View>
            <Text
              numberOfLines={1}
              style={[styles.caption, day.status === 'done' && styles.captionDone]}>
              {day.dayIndex !== null
                ? t('home.dayShort', { number: day.dayIndex + 1 })
                : day.status === 'rest'
                  ? t('home.rest')
                  : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const MARK = 26;

const useStyles = makeStyles((theme) => ({
  week: {
    flexDirection: 'row',
    gap: 2,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: Spacing.two,
    borderRadius: Radius.small,
  },
  today: {
    backgroundColor: theme.brandSoft,
  },
  pressed: {
    opacity: 0.6,
  },
  weekday: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    color: theme.textSecondary,
  },
  date: {
    fontSize: 15,
    fontWeight: 600,
    color: theme.text,
  },
  todayText: {
    color: theme.tint,
  },
  mark: {
    marginTop: 2,
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDone: {
    backgroundColor: theme.tint,
  },
  markPlanned: {
    borderWidth: 2,
    borderColor: theme.tint,
  },
  markInProgress: {
    backgroundColor: theme.brandSoft,
  },
  markMissed: {
    borderWidth: 2,
    borderColor: theme.surfaceMuted,
  },
  markRest: {
    width: 6,
    height: 6,
    marginVertical: (MARK - 6) / 2,
    backgroundColor: theme.surfaceMuted,
  },
  caption: {
    fontSize: 10,
    fontWeight: 600,
    color: theme.textSecondary,
  },
  captionDone: {
    color: theme.tint,
  },
}));
