import type { ComponentType } from 'react';

import { LatPulldownAnimation } from './lat-pulldown';

/**
 * Our own animations, drawn from scratch in the app's style (prototype). Keyed by exercise
 * id; exercises without one show the dataset GIF.
 */
export const exerciseAnimations: Partial<Record<string, ComponentType<{ size: number }>>> = {
  'lat-pulldown': LatPulldownAnimation,
};
