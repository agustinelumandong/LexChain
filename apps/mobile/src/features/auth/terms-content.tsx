import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View } from 'react-native';

import { termsBottomSheetStyles as styles } from './terms-bottom-sheet.styles';

const TERMS_SECTIONS = [
  {
    title: '1. Account responsibility',
    body: 'You are responsible for information submitted through your account, including document metadata, uploaded files, and access permissions you grant to others.',
  },
  {
    title: '2. Legal document handling',
    body: 'LexChain helps organize, summarize, and verify legal documents. You should only upload content you are authorized to manage, review, or share.',
  },
  {
    title: '3. Privacy and confidentiality',
    body: 'LexChain is designed for private legal records. Document access is limited by account role, whitelist permissions, and authenticated requests. Do not upload records you are not allowed to store, process, or share.',
  },
  {
    title: '4. Storage and encryption',
    body: 'Account and document records are transmitted through secured connections and protected in application storage and database systems with encryption and access controls where supported by the platform.',
  },
  {
    title: '5. AI and third-party processing',
    body: 'Some AI features may use a third-party language model service to create summaries, risk signals, or document answers. LexChain sends only the content needed for the requested AI task; account credentials, access tokens, and permission settings are not sent to the model provider.',
  },
  {
    title: '6. Acceptable use',
    body: 'You must not use the platform for fraud, identity misrepresentation, unauthorized disclosure, tampering, or unlawful access to protected records.',
  },
  {
    title: '7. Consent to processing',
    body: 'By continuing, you consent to the storage and processing needed to provide uploads, search, AI-assisted review, access control, audit trails, and verification features inside LexChain.',
  },
];

type TermsContentProps = {
  acceptedTerms: boolean;
  hasReachedEnd: boolean;
  onToggleAcceptedTerms: () => void;
};

export function TermsContent({
  acceptedTerms,
  hasReachedEnd,
  onToggleAcceptedTerms,
}: TermsContentProps) {
  return (
    <>
      {TERMS_SECTIONS.map((section) => (
        <TermsSection key={section.title} title={section.title} body={section.body} />
      ))}

      <Pressable
        style={[
          styles.checkboxRow,
          styles.acceptanceRow,
          !hasReachedEnd && styles.checkboxRowDisabled,
        ]}
        onPress={hasReachedEnd ? onToggleAcceptedTerms : undefined}
      >
        <View
          style={[
            styles.checkbox,
            acceptedTerms && styles.checkboxChecked,
            !hasReachedEnd && styles.checkboxDisabled,
          ]}
        >
          {acceptedTerms ? <MaterialIcons name="check" size={16} color="#FFFFFF" /> : null}
        </View>

        <Text
          style={[
            styles.checkboxLabel,
            !hasReachedEnd && styles.checkboxLabelDisabled,
          ]}
        >
          I accept Terms of Service and Privacy Policy
        </Text>
      </Pressable>
    </>
  );
}

type TermsSectionProps = {
  title: string;
  body: string;
};

function TermsSection({ title, body }: TermsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}
