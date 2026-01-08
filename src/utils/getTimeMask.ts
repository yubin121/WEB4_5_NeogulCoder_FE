export const HOURS_IN_DAY = 24 as const;
export const FULL_DAY_MASK: number = (1 << HOURS_IN_DAY) - 1; // 0xFFFFFF

export function hoursToMask(hours: number[]): number {
  let mask = 0;
  for (const h of new Set(hours)) {
    if (h < 0 || h >= HOURS_IN_DAY) throw new Error(`Invalid hour: ${h}`);
    mask |= 1 << h;
  }
  return mask >>> 0;
}

export function maskToHours(mask: number): number[] {
  if (mask < 0 || mask > FULL_DAY_MASK)
    throw new Error(`Invalid mask: ${mask}`);
  const result: number[] = [];
  for (let h = 0; h < HOURS_IN_DAY; h++) {
    if (mask & (1 << h)) result.push(h);
  }
  return result;
}
