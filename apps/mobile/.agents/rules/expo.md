# Expo project rule

Always use the official Expo LLM documentation for Expo-related work.

References:
- @../../AGENTS.md

Official Expo docs (cached locally in docs/expo-llms/):
- docs/expo-llms/llms.txt
- docs/expo-llms/llms-sdk.txt
- docs/expo-llms/llms-eas.txt

Online URLs (for reference):
- https://docs.expo.dev/llms.txt
- https://docs.expo.dev/llms-sdk.txt
- https://docs.expo.dev/llms-eas.txt

When modifying this project:
- Inspect package.json to determine the Expo SDK version.
- Use Expo SDK docs before changing Expo APIs, app config, permissions, plugins, or native modules.
- Use EAS docs before changing eas.json, builds, updates, submissions, or credentials.
- Prefer npx expo install for Expo-compatible packages.

To update local docs:
  curl -s "https://docs.expo.dev/llms.txt" -o docs/expo-llms/llms.txt
  curl -s "https://docs.expo.dev/llms-sdk.txt" -o docs/expo-llms/llms-sdk.txt
  curl -s "https://docs.expo.dev/llms-eas.txt" -o docs/expo-llms/llms-eas.txt
