export type PermissionState = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export interface DevicePosition {
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  accuracyMeters: number | null;
  timestamp: number;
}

export interface UseDeviceLocationResult {
  permission: PermissionState;
  position: DevicePosition | null;
  error: string | null;
  tracking: boolean;
  requestPermission: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}
