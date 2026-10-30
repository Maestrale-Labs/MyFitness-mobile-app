/**
 * Two-bone inverse kinematics: where the elbow (or knee) goes for a limb of the given
 * lengths to reach from `shoulder` to `hand`. `outward` picks the side the joint bends
 * towards: -1 for left (smaller x), 1 for right. Runs on the UI thread.
 */
export function solveElbow(
  shoulderX: number,
  shoulderY: number,
  handX: number,
  handY: number,
  upperLength: number,
  lowerLength: number,
  outward: -1 | 1,
): [number, number] {
  'worklet';
  const dx = handX - shoulderX;
  const dy = handY - shoulderY;
  const distance = Math.max(Math.hypot(dx, dy), 0.001);
  const reach = Math.min(distance, upperLength + lowerLength - 0.01);
  const ux = dx / distance;
  const uy = dy / distance;
  // Distance from the shoulder, along the shoulder-hand line, to the elbow's projection.
  const along = (upperLength ** 2 - lowerLength ** 2 + reach ** 2) / (2 * reach);
  const across = Math.sqrt(Math.max(upperLength ** 2 - along ** 2, 0));
  // Perpendicular to the shoulder-hand line, flipped to the outward side.
  let nx = -uy;
  let ny = ux;
  if (nx * outward < 0) {
    nx = -nx;
    ny = -ny;
  }
  return [shoulderX + ux * along + nx * across, shoulderY + uy * along + ny * across];
}
