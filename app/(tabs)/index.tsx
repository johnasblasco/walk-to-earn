import { Clock, PersonStanding, Play, Square, Star } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WalkMap } from "@/src/features/walk-session/components";
import {
  classifySpeed,
  haversineKm,
  type MovementValidity,
} from "@/src/features/walk-session/constants/movement";
import {
  useDeviceLocation,
  type DevicePosition,
} from "@/src/features/walk-session/hooks";
import { colors } from "@/src/shared/constants/colors";

const STEPS_PER_KM = 1312;

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function validityColor(validity: MovementValidity): string {
  switch (validity) {
    case "valid":
      return "#4ade80";
    case "invalid_fast":
      return colors.red500;
    case "still":
    default:
      return colors.n400;
  }
}

function validityLabel(validity: MovementValidity, speedKmh: number): string {
  if (validity === "invalid_fast") return `${speedKmh.toFixed(1)} km/h · too fast`;
  if (validity === "still") return `${speedKmh.toFixed(1)} km/h · still`;
  return `${speedKmh.toFixed(1)} km/h`;
}

export default function Walk() {
  const { permission, position, error, requestPermission, startTracking, stopTracking } =
    useDeviceLocation();

  const [sessionActive, setSessionActive] = useState(false);
  const [path, setPath] = useState<DevicePosition[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (permission === "idle") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!sessionActive) return;
    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    const id = setInterval(() => {
      if (startedAtRef.current == null) return;
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionActive]);

  useEffect(() => {
    if (!sessionActive || !position) return;
    setPath((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.timestamp - position.timestamp) < 250) return prev;
      return [...prev, position];
    });
  }, [position, sessionActive]);

  const distanceKm = useMemo(() => {
    let km = 0;
    for (let i = 1; i < path.length; i++) km += haversineKm(path[i - 1], path[i]);
    return km;
  }, [path]);

  const speedKmh = position?.speedKmh ?? 0;
  const validity = classifySpeed(speedKmh);
  const estimatedSteps = Math.round(distanceKm * STEPS_PER_KM);
  const earned = (estimatedSteps / 1000) * 4; // base reward per 1000 valid steps

  const handleToggleSession = async () => {
    if (sessionActive) {
      stopTracking();
      setSessionActive(false);
      return;
    }

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Location required",
          Platform.OS === "web"
            ? "Allow location access in your browser to start a walking session."
            : "Walk-to-Earn needs your location to validate walking or jogging activity.",
        );
        return;
      }
    }

    setPath([]);
    setElapsedSeconds(0);
    await startTracking();
    setSessionActive(true);
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const speedBadgeColor = validityColor(validity);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 100 }}>
          <View className="px-5 pt-12 pb-4 flex-row justify-between items-center">
            <Text className="text-[26px] font-extrabold tracking-tight" style={{ color: colors.n800 }}>
              Walk
            </Text>
            <View className="px-3.5 py-1.5 rounded-full" style={{ backgroundColor: colors.g100 }}>
              <Text className="text-xs font-extrabold tracking-wide" style={{ color: colors.g700 }}>
                7 Day Streak
              </Text>
            </View>
          </View>

          <View
            className="mx-4 rounded-[28px] h-[470px] overflow-hidden shadow-2xl"
            style={{ backgroundColor: colors.g700 }}
          >
            <WalkMap position={position} path={path} followUser={sessionActive} />

            <View
              style={{ pointerEvents: "box-none" }}
              className="absolute inset-0 justify-between p-4"
            >
              <View className="flex-row gap-2 flex-wrap">
                <View
                  className="px-3.5 py-2 rounded-full flex-row items-center gap-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.88)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.6)",
                  }}
                >
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: speedBadgeColor }}
                  />
                  <Text className="text-[13px] font-bold" style={{ color: colors.n800 }}>
                    {validityLabel(validity, speedKmh)}
                  </Text>
                </View>

                <View
                  className="px-3.5 py-2 rounded-full flex-row items-center gap-1.5"
                  style={{
                    backgroundColor: "rgba(245,158,11,0.95)",
                    borderWidth: 1,
                    borderColor: "rgba(245,158,11,1)",
                  }}
                >
                  <Star size={12} fill="#fff" stroke="none" />
                  <Text className="text-xs font-extrabold text-white">Boost 4:21</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-end gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleToggleSession}
                  className="flex-1 min-w-[190px] rounded-full shadow-2xl px-5 py-4 flex-row items-center justify-center gap-2"
                  style={{ backgroundColor: sessionActive ? colors.red500 : colors.g500 }}
                >
                  {sessionActive ? (
                    <Square size={16} color="white" strokeWidth={3} fill="white" />
                  ) : (
                    <PersonStanding size={18} color="white" strokeWidth={2} />
                  )}
                  <Text className="text-[17px] font-extrabold text-white tracking-wide">
                    {sessionActive ? "Stop Walk" : "Start Walk"}
                  </Text>
                </TouchableOpacity>

                <View
                  className="px-3 py-2 rounded-2xl flex-row items-center gap-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.14)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.16)",
                  }}
                >
                  <Clock size={14} color="white" strokeWidth={2} />
                  <Text className="text-xs font-extrabold text-white">
                    {formatClock(elapsedSeconds)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {(permission === "denied" || permission === "unsupported" || error) && (
            <View
              className="mx-4 mt-3 rounded-2xl p-3.5 border"
              style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}
            >
              <Text className="text-xs font-extrabold mb-0.5" style={{ color: colors.red500 }}>
                Location {permission === "unsupported" ? "unavailable" : "blocked"}
              </Text>
              <Text className="text-xs" style={{ color: colors.n600 }}>
                {error ??
                  "Enable location permission to track valid walking or jogging movement."}
              </Text>
            </View>
          )}

          <View className="flex-row gap-2.5 px-4 -mt-[74px] z-10">
            {[
              {
                label: "Steps",
                value: estimatedSteps.toLocaleString(),
                color: colors.g600,
              },
              {
                label: "Earned",
                value: earned.toFixed(1),
                color: colors.amber,
              },
              {
                label: "Shoe",
                value: "Runner",
                color: colors.n800,
                small: true,
              },
            ].map((stat) => (
              <View
                key={stat.label}
                className="flex-1 rounded-[20px] px-3 py-3.5 gap-1 border shadow-lg"
                style={{
                  backgroundColor: "rgba(255,255,255,0.96)",
                  borderColor: "rgba(255,255,255,0.7)",
                }}
              >
                <Text
                  className="text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ color: colors.n400 }}
                >
                  {stat.label}
                </Text>
                <Text
                  className="font-extrabold leading-none"
                  style={{ color: stat.color, fontSize: stat.small ? 18 : 22 }}
                >
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          <View
            className="mx-4 mt-3.5 mb-4 rounded-[20px] p-4 border"
            style={{ backgroundColor: "white", borderColor: colors.n100 }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              className="rounded-[18px] p-4 flex-row items-center gap-3 border-[1.5px]"
              style={{ backgroundColor: colors.g50, borderColor: colors.g200 }}
            >
              <View
                className="w-12 h-12 rounded-[14px] items-center justify-center"
                style={{ backgroundColor: colors.g100 }}
              >
                <Play size={20} fill={colors.g500} stroke={colors.g500} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-extrabold mb-0.5" style={{ color: colors.n800 }}>
                  Get Boost
                </Text>
                <Text className="text-xs" style={{ color: colors.n600 }}>
                  Watch and earn ×1.5
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                className="px-3.5 py-2 rounded-full"
                style={{ backgroundColor: colors.g600 }}
              >
                <Text className="text-xs font-extrabold text-white">Watch</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
