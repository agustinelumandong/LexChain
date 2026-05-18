import React from 'react';
import { toast } from 'sonner-native';

import { Button } from '@/ui';

import { ProfileDetailScreen } from '../profile-detail-screen';
import { InfoRow } from '../profile-info-row';
import { SettingsCard } from '../settings-card';

export default function HelpSupportScreen() {
  return (
    <ProfileDetailScreen
      title="Help and support"
      subtitle="Troubleshoot common LexChain account, upload, and access issues."
    >
      <SettingsCard title="Common issues">
        <InfoRow
          iconName="upload-file"
          title="Upload did not finish"
          body="Check network status, file type, and file size. Supported document types are PDF, DOCX, DOC, and TXT."
        />
        <InfoRow
          iconName="verified"
          title="Verification looks pending"
          body="Open the document details screen and refresh the document status after processing completes."
        />
        <InfoRow
          iconName="admin-panel-settings"
          title="Cannot access a document"
          body="Ask the document owner to add your account to the document whitelist."
        />
      </SettingsCard>

      <SettingsCard
        title="Account recovery"
        description="Use the auth screen recovery flow for password or sign-in issues."
      >
        <InfoRow
          iconName="mail-outline"
          title="Email verification"
          body="If the verification link expired, use the resend verification option from sign-in."
        />
        <InfoRow
          iconName="help-outline"
          title="Support contact"
          body="Support ticket submission is not connected yet. Use your project adviser or system administrator for manual escalation."
        />
        <Button
          label="Contact support"
          variant="secondary"
          fullWidth
          onPress={() => toast('Support contact will be connected later')}
        />
      </SettingsCard>
    </ProfileDetailScreen>
  );
}
