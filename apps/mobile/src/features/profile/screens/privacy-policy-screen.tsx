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
          body="Documents are uploaded so LexChain can support review, search, access control, summaries, audit trails, and verification workflows."
        />
        <InfoRow
          iconName="auto-awesome"
          title="AI assistance"
          body="LexChain may use a third-party language model service for AI summaries, risk signals, and document answers. Only content needed for the requested AI feature is sent; account credentials, access tokens, and permission settings are not sent to the model provider."
        />
        <InfoRow
          iconName="manage-search"
          title="Search indexes"
          body="Document content may be indexed so you can search within a document or across your repository."
        />
      </SettingsCard>

      <SettingsCard title="Data protection">
        <InfoRow
          iconName="lock-outline"
          title="Encrypted transport and storage"
          body="LexChain uses secured network requests and protects application data in database and storage systems with encryption and access controls where supported by the platform."
        />
        <InfoRow
          iconName="privacy-tip"
          title="Privacy by permission"
          body="Document visibility is controlled by authenticated access, role checks, and document-level permissions. Shared access should be granted only to people who are allowed to view the record."
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
          body="Access tokens are stored through secure device storage and are used only for authenticated API requests. They are not shared with AI model providers."
        />
      </SettingsCard>
    </ProfileDetailScreen>
  );
}
