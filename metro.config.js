const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.maxWorkers = Number(process.env.EXPO_METRO_MAX_WORKERS ?? 1);

const MAPLIBRE_ENTRY = path.resolve(
  __dirname,
  "node_modules/maplibre-gl/dist/maplibre-gl.js"
);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "maplibre-gl" && platform === "web") {
    return { filePath: MAPLIBRE_ENTRY, type: "sourceFile" };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativewind(config);
