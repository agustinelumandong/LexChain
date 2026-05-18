import { Text, View } from 'react-native';

import { VerificationStepRow } from './verification-step-row';
import { verificationStatusCardStyles } from './verification-status-card.styles';

export type StepStatus = 'done' | 'verifying' | 'pending';

export type VerificationStep = {
  label: string;
  status: StepStatus;
};

type VerificationStatusCardProps = {
  title: string;
  steps: VerificationStep[];
};

const STATUS_COPY: Record<StepStatus, string> = {
  done: 'Done',
  verifying: 'Verifying',
  pending: 'Pending',
};

export function VerificationStatusCard({
  title,
  steps,
}: VerificationStatusCardProps) {
  return (
    <View style={verificationStatusCardStyles.card}>
      <Text style={verificationStatusCardStyles.title}>{title}</Text>

      <View style={verificationStatusCardStyles.stepsWrap}>
        {steps.map((step, index) => (
          <VerificationStepRow
            key={step.label}
            isLast={index === steps.length - 1}
            statusCopy={STATUS_COPY[step.status]}
            step={step}
          />
        ))}
      </View>
    </View>
  );
}
