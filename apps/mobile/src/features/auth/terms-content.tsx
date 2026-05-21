import { MaterialIcons } from '@expo/vector-icons';
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
    body: 'Documents may contain private or sensitive legal information. You agree to use the platform carefully and avoid uploading data in violation of confidentiality duties or applicable law.',
  },
  {
    title: '4. Acceptable use',
    body: 'You must not use the platform for fraud, identity misrepresentation, unauthorized disclosure, tampering, or unlawful access to protected records.',
  },
  {
    title: '5. Consent to processing',
    body: 'By continuing, you consent to storage and processing required to provide upload, summary, access control, and verification features within the LexChain system.',
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
