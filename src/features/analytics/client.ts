import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

import { useSettings } from '@/features/settings/store';

import type { AnalyticsEventName, AnalyticsEvents } from './events';

/**
 * Anonymous usage statistics (docs/analytics.md). Each install gets a random id, kept on
 * the device; events are queued on the device and sent in batches to Supabase's
 * `track_events` function, so nothing is lost while offline. Turned off from the profile.
 */

const INSTALL_ID_KEY = 'analytics.installId';
const QUEUE_KEY = 'analytics.queue';
const MAX_QUEUE = 500;
const BATCH_SIZE = 50;
const FLUSH_DELAY_MS = 3000;

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

type QueuedEvent = {
  name: AnalyticsEventName;
  occurredAt: string;
  properties: Record<string, unknown>;
};

// Loaded once from storage; every caller then shares the same array.
let queuePromise: Promise<QueuedEvent[]> | null = null;
let installIdPromise: Promise<string> | null = null;
let flushing = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function isEnabled() {
  return useSettings.getState().analyticsEnabled && Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function loadQueue() {
  queuePromise ??= AsyncStorage.getItem(QUEUE_KEY)
    .then((saved) => (saved ? (JSON.parse(saved) as QueuedEvent[]) : []))
    .catch(() => []);
  return queuePromise;
}

async function saveQueue(events: QueuedEvent[]) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(events));
  } catch {
    // Storage full or unavailable: the events stay in memory until the next flush.
  }
}

function getInstallId() {
  installIdPromise ??= AsyncStorage.getItem(INSTALL_ID_KEY).then(async (saved) => {
    if (saved) {
      return saved;
    }
    const id = randomUUID();
    await AsyncStorage.setItem(INSTALL_ID_KEY, id);
    return id;
  });
  return installIdPromise;
}

/** Records an event. Never throws and never blocks the UI. */
export function track<Name extends AnalyticsEventName>(
  name: Name,
  ...[properties]: AnalyticsEvents[Name] extends Record<string, never>
    ? []
    : [AnalyticsEvents[Name]]
) {
  if (!isEnabled()) {
    return;
  }
  void (async () => {
    const events = await loadQueue();
    events.push({ name, occurredAt: new Date().toISOString(), properties: properties ?? {} });
    // On a long offline stretch keep the newest events.
    events.splice(0, Math.max(0, events.length - MAX_QUEUE));
    await saveQueue(events);
    scheduleFlush();
  })();
}

function scheduleFlush() {
  flushTimer ??= setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_DELAY_MS);
}

/** Sends the queued events, a batch at a time. Batches that can't be sent stay queued. */
export async function flush() {
  if (flushing || !isEnabled()) {
    return;
  }
  flushing = true;
  try {
    const events = await loadQueue();
    const installId = await getInstallId();
    while (events.length > 0) {
      const batch = events.slice(0, BATCH_SIZE);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/track_events`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY!, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          install_id: installId,
          context: {
            platform: Platform.OS,
            appVersion: Constants.expoConfig?.version,
            locale: getLocales()[0]?.languageCode,
            dev: __DEV__,
          },
          events: batch,
        }),
      });
      // Server trouble, or `track_events` not deployed yet (404): keep the batch for later.
      // Any other error means the batch itself is invalid and would fail forever, so it's
      // dropped like a sent one.
      if (response.status >= 500 || response.status === 404) {
        break;
      }
      events.splice(0, batch.length);
      await saveQueue(events);
    }
  } catch {
    // Offline: try again on the next event or app open.
  } finally {
    flushing = false;
  }
}

/** Forgets the queued events, e.g. when statistics are turned off. */
export async function clearQueue() {
  const events = await loadQueue();
  events.length = 0;
  await saveQueue(events);
}
