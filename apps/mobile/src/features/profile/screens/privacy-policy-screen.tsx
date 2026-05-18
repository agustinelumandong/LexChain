import React from 'react';

import { ProfileDetailScreen } from '../profile-detail-screen';
import { InfoRow } from '../profile-info-row';
import { SettingsCard } from '../settings-card';

export default function PrivacyPolicyScreen() {
  return (
    <ProfileDetailScreen
      title="Privacy policy"
      subtitle="How LexChain handles account and document data in this app."
    >
      <SettingsCard title="Document data">
        <InfoRow
          iconName="description"
          title="Uploaded files"
          body="Documents are uploaded for processing, search, summary generation, and verification workflows."
        />
        <InfoRow
          iconName="auto-awesome"
          title="AI summaries"
          body="Extracted text can be used to produce summaries, risk flags, and question answers for authorized users."
        />
        <InfoRow
          iconName="manage-search"
          title="Search indexes"
          body="Document content may be indexed so you can search within a document or across your repository."
        />
      </SettingsCard>

      <SettingsCard title="Access control">
        <InfoRow
          iconName="admin-panel-settings"
          title="Whitelist grants"
          body="Access lists control who can view, verify, or manage document-related records."
        />
        <InfoRow
          iconName="verified-user"
          title="Verification activity"
          body="Verification events help establish document integrity and audit context inside LexChain."
        />
      </SettingsCard>

      <SettingsCard title="Account information">
        <InfoRow
          iconName="person-outline"
          title="Profile details"
          body="Local profile edits in this app are stored on this device until backend profile endpoints are connected."
        />
        <InfoRow
          iconName="lock-outline"
          title="Authentication"
          body="Access tokens are stored through secure device storage and are used only for authenticated API requests."
        />
      </SettingsCard>
    </ProfileDetailScreen>
  );
}
