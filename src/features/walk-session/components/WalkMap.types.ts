import type { DevicePosition } from "../hooks/location.types";

export interface WalkMapProps {
  position: DevicePosition | null;
  path: DevicePosition[];
  followUser?: boolean;
}
