import maplibregl from "maplibre-gl";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../../shared/constants/colors";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAPBOX_ACCESS_TOKEN,
} from "./mapboxConfig";
import type { WalkMapProps } from "./WalkMap.types";

const MAPLIBRE_CSS_URL = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
const MAPBOX_STYLE = "mapbox/streets-v12";

function injectCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("maplibre-gl-css")) return;
  const link = document.createElement("link");
  link.id = "maplibre-gl-css";
  link.rel = "stylesheet";
  link.href = MAPLIBRE_CSS_URL;
  document.head.appendChild(link);
}

function buildRasterStyle(token: string): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {
      "mapbox-tiles": {
        type: "raster",
        tiles: [
          `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE}/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`,
        ],
        tileSize: 512,
        attribution:
          '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/about/">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "mapbox-tiles-layer",
        type: "raster",
        source: "mapbox-tiles",
      },
    ],
  };
}

export function WalkMap({ position, path, followUser = true }: WalkMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const styleLoadedRef = useRef(false);

  useEffect(() => {
    injectCss();
    if (!MAPBOX_ACCESS_TOKEN || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildRasterStyle(MAPBOX_ACCESS_TOKEN),
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.on("load", () => {
      styleLoadedRef.current = true;
      if (!map.getSource("walk-path")) {
        map.addSource("walk-path", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "walk-path-line",
          type: "line",
          source: "walk-path",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": colors.g500,
            "line-width": 5,
            "line-opacity": 0.9,
          },
        });
      }
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      styleLoadedRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;
    const lngLat: [number, number] = [position.longitude, position.latitude];

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.background = colors.g500;
      el.style.border = `3px solid ${colors.white}`;
      el.style.boxShadow = "0 0 0 6px rgba(16,185,129,0.25)";
      markerRef.current = new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    if (followUser) {
      map.easeTo({ center: lngLat, zoom: DEFAULT_ZOOM, duration: 800 });
    }
  }, [position, followUser]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const source = map.getSource("walk-path") as maplibregl.GeoJSONSource | undefined;
      if (!source) return;
      source.setData({
        type: "FeatureCollection",
        features:
          path.length < 2
            ? []
            : [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: path.map((p) => [p.longitude, p.latitude]),
                  },
                },
              ],
      });
    };

    if (styleLoadedRef.current) apply();
    else map.once("load", apply);
  }, [path]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>
          Mapbox token missing. Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN.
        </Text>
      </View>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1e4d2b",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  fallbackText: { color: "white", textAlign: "center", fontWeight: "700" },
});
