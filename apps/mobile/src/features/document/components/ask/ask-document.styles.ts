import { StyleSheet } from 'react-native';

import { APP_COLORS, fonts } from '@/theme';

export const ASK_DOCUMENT_COLORS = {
  backdrop: 'rgba(4, 18, 40, 0.42)',
  sheet: APP_COLORS.bg,
  surface: APP_COLORS.white,
  white: APP_COLORS.white,
  surfaceSoft: APP_COLORS.surfaceSoft,
  primary: APP_COLORS.primary,
  navy: APP_COLORS.navy,
  textMuted: APP_COLORS.textMuted,
  borderSoft: APP_COLORS.borderSoft,
  error: '#DC2626',
};

const COLORS = ASK_DOCUMENT_COLORS;

export const askDocumentStyles = StyleSheet.create({
  overlay: {
    zIndex: 10000,
    elevation: 10000,
  },
  sheetBackground: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: COLORS.borderSoft,
    width: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: COLORS.sheet,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
    fontFamily: fonts.regular,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '92%',
  },
  botAvatar: {
    width: 32,
    height: 32,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    fontWeight: '600',
  },
  assistantText: {
    color: COLORS.navy,
  },
  userText: {
    color: COLORS.white,
  },
  footerContainer: {
    backgroundColor: 'transparent',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: COLORS.sheet,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
  inputShell: {
    flex: 1,
    minHeight: 56,
    maxHeight: 118,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surface,
  },
  input: {
    minHeight: 56,
    maxHeight: 118,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    color: COLORS.navy,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.borderSoft,
  },
});
