import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner-native';

import { useCreateDocumentRequest } from '@/services/query';
import { parseApiError } from '@/shared/utils/api-error';

import { DEFAULT_DOCUMENT_HEADER_HEIGHT } from '../constants/document-details.constants';
import { getDocumentPermissions } from '../services/document-permissions';

function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function useDocumentPdfViewer() {
  const router = useRouter();
  const createRequestMutation = useCreateDocumentRequest();
  const [isRequestSheetVisible, setIsRequestSheetVisible] = useState(false);
  const [isToolsSheetVisible, setIsToolsSheetVisible] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_DOCUMENT_HEADER_HEIGHT);
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

  const handleOpenRequestSheet = () => {
    setIsRequestSheetVisible(true);
  };

  const handleCloseRequestSheet = () => {
    if (!createRequestMutation.isPending) {
      setIsRequestSheetVisible(false);
    }
  };

  const handleConfirmRequestECopy = async () => {
    if (createRequestMutation.isPending) {
      return;
    }

    const documentTitle = title.trim() || 'document';

    try {
      await createRequestMutation.mutateAsync({
        document_type: 'PDF',
        description: `Client requested an e-copy PDF for ${documentTitle}${documentId ? ` (${documentId})` : ''}.`,
      });
      setIsRequestSheetVisible(false);
      toast.success('E-copy request submitted');
    } catch (error) {
      toast.error(parseApiError(error).message);
    }
  };

  return {
    documentId,
    title,
    uri,
    permissions,
    isRequestingECopy: createRequestMutation.isPending,
    isRequestSheetVisible,
    isToolsSheetVisible,
    headerHeight,
    handleBack,
    handleHeaderHeightChange,
    handleOpenTools,
    handleCloseTools,
    handleOpenRequestSheet,
    handleCloseRequestSheet,
    handleConfirmRequestECopy,
  };
}
