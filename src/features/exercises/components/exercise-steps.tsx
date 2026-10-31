import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

/** How to do an exercise: numbered steps in a card. */
export function ExerciseSteps({ steps }: { steps: string[] }) {
  const styles = useStyles();

  return (
    <Card>
      {steps.map((step, index) => (
        <View key={index} style={[styles.row, index < steps.length - 1 && styles.divider]}>
          <View style={styles.number}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <Text style={styles.text}>{step}</Text>
        </View>
      ))}
    </Card>
  );
}

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  number: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.brandSoft,
  },
  numberText: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.tint,
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: theme.text,
  },
}));
