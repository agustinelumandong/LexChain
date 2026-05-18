import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants';
import { applyWhitelistToDocument } from '@/features/document/services/whitelist-storage';
import type { MockDocument, WhitelistGrant, WhitelistSearchResult } from '@/types';

import { MOCK_DOCUMENTS } from '@/features/documents/data/mock-documents';

type PersistedWhitelist = {
  grants: WhitelistGrant[];
  searchResults: WhitelistSearchResult[];
};

type PersistedWhitelistMap = Record<string, PersistedWhitelist>;

type DocumentsStore = {
  documents: MockDocument[];
  whitelistByDocumentId: PersistedWhitelistMap;
  isHydrating: boolean;
  isPersisting: boolean;
  hydrationError: string | null;
  completeHydration: (error?: unknown) => void;
  resetDocumentsStore: () => void;
  addWhitelistResult: (documentId: string, resultId: string) => boolean;
  revokeWhitelistGrant: (documentId: string, grantId: string) => boolean;
};

const buildDocuments = (whitelistByDocumentId: PersistedWhitelistMap) =>
  MOCK_DOCUMENTS.map((document) => {
    const persistedWhitelist = whitelistByDocumentId[document.id];
    return persistedWhitelist ? applyWhitelistToDocument(document, persistedWhitelist) : document;
  });

const getPersistedWhitelist = (document: MockDocument): PersistedWhitelist => ({
  grants: document.whitelist.grants,
  searchResults: document.whitelist.searchResults,
});

export const useDocumentsStore = create<DocumentsStore>()(
  persist(
    (set, get) => ({
      documents: MOCK_DOCUMENTS,
      whitelistByDocumentId: {},
      isHydrating: true,
      isPersisting: false,
      hydrationError: null,
      completeHydration: (error) => {
        set((state) => ({
          documents: buildDocuments(state.whitelistByDocumentId),
          isHydrating: false,
          hydrationError: error ? 'Failed to load saved whitelist access' : null,
        }));
      },
      resetDocumentsStore: () => {
        set({
          documents: MOCK_DOCUMENTS,
          whitelistByDocumentId: {},
          isHydrating: false,
          isPersisting: false,
          hydrationError: null,
        });
      },
      addWhitelistResult: (documentId, resultId) => {
        const selectedDocument = get().documents.find((document) => document.id === documentId);
        const result = selectedDocument?.whitelist.searchResults.find(
          (entry) => entry.id === resultId,
        );

        if (!selectedDocument || !result) {
          return false;
        }

        const nextWhitelist: PersistedWhitelist = {
          ...getPersistedWhitelist(selectedDocument),
          grants: [
            {
              id: result.id,
              name: result.name,
              email: result.email,
              accessLabel: 'View access',
              actionLabel: 'View',
            },
            ...selectedDocument.whitelist.grants,
          ],
          searchResults: selectedDocument.whitelist.searchResults.filter(
            (entry) => entry.id !== resultId,
          ),
        };
        const nextWhitelistByDocumentId = {
          ...get().whitelistByDocumentId,
          [documentId]: nextWhitelist,
        };

        set({
          whitelistByDocumentId: nextWhitelistByDocumentId,
          documents: buildDocuments(nextWhitelistByDocumentId),
          isPersisting: true,
        });
        set({ isPersisting: false });

        return true;
      },
      revokeWhitelistGrant: (documentId, grantId) => {
        const selectedDocument = get().documents.find((document) => document.id === documentId);
        const grant = selectedDocument?.whitelist.grants.find((entry) => entry.id === grantId);

        if (!selectedDocument || !grant) {
          return false;
        }

        const nextWhitelist: PersistedWhitelist = {
          ...getPersistedWhitelist(selectedDocument),
          grants: selectedDocument.whitelist.grants.filter((entry) => entry.id !== grantId),
          searchResults:
            grant.email &&
            !selectedDocument.whitelist.searchResults.some((entry) => entry.id === grant.id)
              ? [
                  {
                    id: grant.id,
                    name: grant.name,
                    email: grant.email,
                  },
                  ...selectedDocument.whitelist.searchResults,
                ]
              : selectedDocument.whitelist.searchResults,
        };
        const nextWhitelistByDocumentId = {
          ...get().whitelistByDocumentId,
          [documentId]: nextWhitelist,
        };

        set({
          whitelistByDocumentId: nextWhitelistByDocumentId,
          documents: buildDocuments(nextWhitelistByDocumentId),
          isPersisting: true,
        });
        set({ isPersisting: false });

        return true;
      },
    }),
    {
      name: STORAGE_KEYS.documentsStore,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        whitelistByDocumentId: state.whitelistByDocumentId,
      }),
      onRehydrateStorage: () => (state, error) => {
        state?.completeHydration(error);
      },
    },
  ),
);
