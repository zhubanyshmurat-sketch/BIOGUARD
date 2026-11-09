import confetti from 'canvas-confetti';
export function celebrate() {
  const colors = ['#16a35a', '#14b8a6', '#deb862', '#ffffff', '#5bb8e8'];
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors }), 250);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors }), 400);
}
