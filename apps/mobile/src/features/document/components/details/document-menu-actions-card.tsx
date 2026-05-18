import { View } from 'react-native';

import { documentMenuScreenStyles } from '../../screens/document-menu-screen.styles';
import { DocumentMenuRow } from './document-menu-row';

type DocumentMenuActionsCardProps = {
  onPressRename: () => void;
  onPressUpdate: () => void;
  onPressManageAccess: () => void;
};

export function DocumentMenuActionsCard({
  onPressRename,
  onPressUpdate,
  onPressManageAccess,
}: DocumentMenuActionsCardProps) {
  return (
    <View style={documentMenuScreenStyles.card}>
      <DocumentMenuRow
        iconName="edit"
        title="Rename"
        description="Change the document display name."
        onPress={onPressRename}
      />
      <View style={documentMenuScreenStyles.separator} />
      <DocumentMenuRow
        iconName="upload-file"
        title="Update document"
        description="Select a new PDF, review it, then upload."
        onPress={onPressUpdate}
      />
      <View style={documentMenuScreenStyles.separator} />
      <DocumentMenuRow
        iconName="groups"
        title="Manage access"
        description="Configure viewers, signers, and editors."
        onPress={onPressManageAccess}
      />
    </View>
  );
}
