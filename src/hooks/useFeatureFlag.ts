/**
 * useFeatureFlag — check if a feature is enabled.
 *
 * Usage:
 *   const aiEnabled = useFeatureFlag('aiAnalysis');
 *   if (aiEnabled) { ... }
 */

import { config } from '../utils/config';

type FeatureKey = keyof typeof config.features;

export function useFeatureFlag(flag: FeatureKey): boolean {
  return config.features[flag];
}
