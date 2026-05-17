import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { getDocumentPermissions } from '../services/document-permissions';

const DEFAULT_HEADER_HEIGHT = 126;

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function useDocumentPdfViewer() {
  const router = useRouter();
  const [isToolsSheetVisible, setIsToolsSheetVisible] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const params = useLocalSearchParams<{
    documentId?: string;
    title?: string;
    uri?: string;
    role?: string;
  }>();

  const documentId = getStringParam(params.documentId);
  const title = getStringParam(params.title) ?? 'Document PDF';
  const uri = getStringParam(params.uri);
  const permissions = useMemo(
    () => getDocumentPermissions(getStringParam(params.role)),
    [params.role],
  );

  const handleBack = () => {
    router.back();
  };

  const handleHeaderHeightChange = (nextHeight: number) => {
    setHeaderHeight((height) => (height === nextHeight ? height : nextHeight));
  };

  const handleOpenTools = () => {
    setIsToolsSheetVisible(true);
  };

  const handleCloseTools = () => {
    setIsToolsSheetVisible(false);
  };

  return {
    documentId,
    title,
    uri,
    permissions,
    isToolsSheetVisible,
    headerHeight,
    handleBack,
    handleHeaderHeightChange,
    handleOpenTools,
    handleCloseTools,
  };
}
