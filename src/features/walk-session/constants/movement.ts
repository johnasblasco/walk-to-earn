export const MOVEMENT = {
  MIN_VALID_SPEED_KMH: 1.5,
  MAX_VALID_SPEED_KMH: 14,
  STILL_THRESHOLD_KMH: 1.0,
  LOCATION_INTERVAL_MS: 2000,
  LOCATION_DISTANCE_M: 3,
} as const;

export type MovementValidity = "still" | "valid" | "invalid_fast";

export function classifySpeed(speedKmh: number | null | undefined): MovementValidity {
  if (speedKmh == null || speedKmh < MOVEMENT.STILL_THRESHOLD_KMH) return "still";
  if (speedKmh > MOVEMENT.MAX_VALID_SPEED_KMH) return "invalid_fast";
  return "valid";
}

export function msToKmh(metersPerSecond: number | null | undefined): number {
  if (metersPerSecond == null || metersPerSecond < 0) return 0;
  return metersPerSecond * 3.6;
}

export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
