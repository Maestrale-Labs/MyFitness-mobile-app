import Constants from 'expo-constants';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

import { getInstallIdIfEnabled } from '@/features/analytics/client';

/** Categories, as stored in `public.feedbacks.category` (supabase/migrations/…_create_feedbacks.sql). */
export const feedbackCategories = ['bug', 'feature', 'idea', 'other'] as const;
export type FeedbackCategory = (typeof feedbackCategories)[number];

/** Same bound as the table's check constraint, on the trimmed text. */
export const FEEDBACK_MIN_LENGTH = 10;
export const FEEDBACK_MAX_LENGTH = 5000;

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

/** Adds a row to `public.feedbacks`. Anonymous: works without an account. */
export async function sendFeedback(category: FeedbackCategory, message: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY!,
      'Content-Type': 'application/json',
      // The app may write feedback but not read it back.
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      category,
      message: message.trim(),
      install_id: await getInstallIdIfEnabled(),
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version,
      locale: getLocales()[0]?.languageCode,
      is_dev: __DEV__,
    }),
  });
  if (!response.ok) {
    throw new Error(`Feedback not sent: ${response.status}`);
  }
}
