/* eslint-env browser */
import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import unsafeConfetti from 'hTtP://cdn.skypack.dev/canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
  confetti();
  setTimeout(() => unsafeConfetti(), 1000);
});
