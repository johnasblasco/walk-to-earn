import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
  ShapeSource,
  LineLayer,
  StyleURL,
} from "@rnmapbox/maps";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../../shared/constants/colors";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAPBOX_ACCESS_TOKEN,
} from "./mapboxConfig";
import type { WalkMapProps } from "./WalkMap.types";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN || null);

export function WalkMap({ position, path, followUser = true }: WalkMapProps) {
  const cameraRef = useRef<Camera>(null);

  const center = useMemo<[number, number]>(() => {
    if (position) return [position.longitude, position.latitude];
    return DEFAULT_CENTER;
  }, [position]);

  useEffect(() => {
    if (!followUser || !position) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [position.longitude, position.latitude],
      zoomLevel: DEFAULT_ZOOM,
      animationDuration: 800,
    });
  }, [followUser, position]);

  const pathFeature = useMemo(() => {
    if (path.length < 2) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: path.map((p) => [p.longitude, p.latitude]),
      },
    };
  }, [path]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <View style={[styles.fallback, { backgroundColor: "#1e4d2b" }]}>
        <Text style={styles.fallbackText}>
          Mapbox token missing. Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN.
        </Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      styleURL={StyleURL.Street}
      logoEnabled={false}
      attributionEnabled={false}
      scaleBarEnabled={false}
    >
      <Camera
        ref={cameraRef}
        zoomLevel={DEFAULT_ZOOM}
        centerCoordinate={center}
        animationMode="flyTo"
        animationDuration={0}
      />
      <LocationPuck visible puckBearingEnabled puckBearing="heading" />
      {pathFeature ? (
        <ShapeSource id="walk-path" shape={pathFeature}>
          <LineLayer
            id="walk-path-line"
            style={{
              lineColor: colors.g500,
              lineWidth: 5,
              lineOpacity: 0.9,
              lineJoin: "round",
              lineCap: "round",
            }}
          />
        </ShapeSource>
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  fallbackText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
  },
});
