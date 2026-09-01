import confetti from 'canvas-confetti';

export function fireCelebration(): void {
  try {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'],
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback if canvas is not supported
  }
}
