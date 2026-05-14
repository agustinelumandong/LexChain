const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const isProduction = process.env.NODE_ENV === "production";

config.projectRoot = __dirname;
config.watchFolders = [__dirname];

const aliases = [
  { find: "@/features/", replacement: "src/features/", prefix: true },
  { find: "@/shared/", replacement: "src/shared/", prefix: true },
  { find: "@/mocks/", replacement: "src/mocks/", prefix: true },
  { find: "@/theme", replacement: "src/shared/theme/theme.ts" },
  { find: "@/hooks", replacement: "src/shared/hooks/index.ts" },
  { find: "@/ui", replacement: "src/shared/components/ui/index.ts" },
  { find: "@/types", replacement: "src/types/index.ts" },
  { find: "@/constants", replacement: "src/constants/index.ts" },
  { find: "@/", replacement: "src/", prefix: true },
];

const resolveAlias = (moduleName) => {
  for (const alias of aliases) {
    if (moduleName === alias.find) {
      return path.resolve(__dirname, alias.replacement);
    }

    if (alias.prefix && moduleName.startsWith(alias.find)) {
      return path.resolve(
        __dirname,
        alias.replacement,
        moduleName.slice(alias.find.length),
      );
    }
  }

  return null;
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const aliasedModule = resolveAlias(moduleName);

  return context.resolveRequest(
    context,
    aliasedModule ?? moduleName,
    platform,
  );
};

config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    compress: {
      ...config.transformer?.minifierConfig?.compress,
      drop_console: isProduction,
      drop_debugger: isProduction,
    },
  },
};

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false,
});
