import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

import { MOVEMENT, msToKmh } from "../constants/movement";
import type {
  DevicePosition,
  PermissionState,
  UseDeviceLocationResult,
} from "./location.types";

function mapPosition(loc: Location.LocationObject): DevicePosition {
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    speedKmh: msToKmh(loc.coords.speed),
    accuracyMeters: loc.coords.accuracy ?? null,
    timestamp: loc.timestamp,
  };
}

export function useDeviceLocation(): UseDeviceLocationResult {
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [position, setPosition] = useState<DevicePosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async () => {
    setPermission("requesting");
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      setPermission(granted ? "granted" : "denied");
      return granted;
    } catch (e) {
      setPermission("denied");
      setError(e instanceof Error ? e.message : "Failed to request permission");
      return false;
    }
  }, []);

  const startTracking = useCallback(async () => {
    setError(null);
    let currentPermission = permission;
    if (currentPermission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return;
      currentPermission = "granted";
    }

    try {
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setPosition(mapPosition(initial));

      subscriptionRef.current?.remove();
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: MOVEMENT.LOCATION_INTERVAL_MS,
          distanceInterval: MOVEMENT.LOCATION_DISTANCE_M,
        },
        (loc) => setPosition(mapPosition(loc))
      );
      setTracking(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start location tracking");
      setTracking(false);
    }
  }, [permission, requestPermission]);

  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  return { permission, position, error, tracking, requestPermission, startTracking, stopTracking };
}
