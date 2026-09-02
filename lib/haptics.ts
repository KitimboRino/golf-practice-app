// Tiny haptic taps. No-ops where the Vibration API is absent (iOS Safari, desktop).
const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
};

export const tapFx = () => buzz(8);
export const bumpFx = () => buzz(18);
export const doneFx = () => buzz([12, 40, 12]);
