import { useCallback, useEffect, useRef, useState } from "react";

import { msToKmh } from "../constants/movement";
import type {
  DevicePosition,
  PermissionState,
  UseDeviceLocationResult,
} from "./location.types";

function mapPosition(pos: GeolocationPosition): DevicePosition {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    speedKmh: msToKmh(pos.coords.speed),
    accuracyMeters: pos.coords.accuracy ?? null,
    timestamp: pos.timestamp,
  };
}

export function useDeviceLocation(): UseDeviceLocationResult {
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [position, setPosition] = useState<DevicePosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const isSupported =
    typeof navigator !== "undefined" && !!navigator.geolocation;

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setPermission("unsupported");
      setError("Geolocation is not supported in this browser");
      return false;
    }
    setPermission("requesting");
    setError(null);
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition(mapPosition(pos));
          setPermission("granted");
          resolve(true);
        },
        (err) => {
          setPermission("denied");
          setError(err.message);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10_000 }
      );
    });
  }, [isSupported]);

  const startTracking = useCallback(async () => {
    if (!isSupported) {
      setPermission("unsupported");
      setError("Geolocation is not supported in this browser");
      return;
    }
    setError(null);
    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return;
    }

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setPosition(mapPosition(pos)),
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 1_000, timeout: 10_000 }
    );
    setTracking(true);
  }, [isSupported, permission, requestPermission]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current != null && isSupported) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    setTracking(false);
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null && isSupported) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
    };
  }, [isSupported]);

  return { permission, position, error, tracking, requestPermission, startTracking, stopTracking };
}
