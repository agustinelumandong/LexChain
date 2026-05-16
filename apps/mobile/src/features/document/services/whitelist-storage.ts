import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import type {
  ManageWhitelistData,
  MockDocument,
  WhitelistGrant,
  WhitelistSearchResult,
} from '@/types';

type PersistedWhitelist = {
  grants: WhitelistGrant[];
  searchResults: WhitelistSearchResult[];
};

type PersistedWhitelistMap = Record<string, PersistedWhitelist>;

export function formatWhitelistCountLabel(count: number) {
  return `${count} allowed wallet${count === 1 ? '' : 's'}/users`;
}

export function applyWhitelistToDocument(
  document: MockDocument,
  whitelist: PersistedWhitelist | ManageWhitelistData,
): MockDocument {
  return {
    ...document,
    preview: {
      ...document.preview,
      whitelist: {
        ...document.preview.whitelist,
        allowedCountLabel: formatWhitelistCountLabel(whitelist.grants.length),
      },
    },
    whitelist: {
      ...document.whitelist,
      grants: whitelist.grants,
      searchResults: whitelist.searchResults,
    },
  };
}

async function loadWhitelistMap(): Promise<PersistedWhitelistMap> {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEYS.documentWhitelist);

  if (!rawValue) return {};

  try {
    return JSON.parse(rawValue) as PersistedWhitelistMap;
  } catch {
    return {};
  }
}

async function saveWhitelistMap(value: PersistedWhitelistMap) {
  await AsyncStorage.setItem(STORAGE_KEYS.documentWhitelist, JSON.stringify(value));
}

export async function hydrateDocumentsWithPersistedWhitelists(
  documents: MockDocument[],
) {
  const persistedWhitelists = await loadWhitelistMap();

  return documents.map((document) => {
    const persistedWhitelist = persistedWhitelists[document.id];
    if (!persistedWhitelist) return document;

    return applyWhitelistToDocument(document, persistedWhitelist);
  });
}

export async function persistDocumentWhitelist(
  documentId: string,
  whitelist: PersistedWhitelist,
) {
  const currentMap = await loadWhitelistMap();

  await saveWhitelistMap({
    ...currentMap,
    [documentId]: whitelist,
  });
}
