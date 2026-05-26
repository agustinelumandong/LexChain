import { Text, View } from 'react-native';

import {
  type VerificationStep,
  type StepStatus,
} from './verification-status-card';
import { verificationStatusCardStyles } from './verification-status-card.styles';

type VerificationStepRowProps = {
  step: VerificationStep;
  statusCopy: string;
  isLast: boolean;
};

export function VerificationStepRow({
  step,
  statusCopy,
  isLast,
}: VerificationStepRowProps) {
  return (
    <View style={verificationStatusCardStyles.stepRow}>
      <View style={verificationStatusCardStyles.stepLead}>
        <View style={[verificationStatusCardStyles.dot, getDotStyle(step.status)]} />
        {!isLast ? <View style={verificationStatusCardStyles.line} /> : null}
      </View>

      <View style={verificationStatusCardStyles.stepBody}>
        <Text style={verificationStatusCardStyles.stepLabel}>{step.label}</Text>
        <Text style={[verificationStatusCardStyles.stepStatus, getStatusStyle(step.status)]}>
          {statusCopy}
        </Text>
      </View>
    </View>
  );
}

function getDotStyle(status: StepStatus) {
  if (status === 'done') {
    return verificationStatusCardStyles.dotDone;
  }
  if (status === 'verifying') {
    return verificationStatusCardStyles.dotVerifying;
  }
  return null;
}

function getStatusStyle(status: StepStatus) {
  if (status === 'done') {
    return verificationStatusCardStyles.stepStatusDone;
  }
  if (status === 'verifying') {
    return verificationStatusCardStyles.stepStatusVerifying;
  }
  return null;
}
