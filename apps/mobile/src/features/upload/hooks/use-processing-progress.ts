import { useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import {
  PROCESSING_STEPS,
  SUMMARY_STEP_INDEX,
  SUMMARY_WAIT_PERCENT,
  UPLOADED_STEP_INDEX,
} from '../constants/processing.constants';

export function useProcessingProgress(isDocumentComplete: boolean) {
  const hasNotifiedCompletionRef = useRef(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeStepPercent, setActiveStepPercent] = useState(1);

  useEffect(() => {
    if (activeStepIndex >= PROCESSING_STEPS.length) {
      return;
    }

    setActiveStepPercent(1);

    const intervalMs = Math.max(
      24,
      activeStepIndex >= UPLOADED_STEP_INDEX || isDocumentComplete
        ? 48
        : Math.floor(PROCESSING_STEPS[activeStepIndex].durationMs / 100),
    );

    const interval = setInterval(() => {
      setActiveStepPercent((currentPercent) => {
        if (
          activeStepIndex === SUMMARY_STEP_INDEX &&
          !isDocumentComplete &&
          currentPercent >= SUMMARY_WAIT_PERCENT
        ) {
          return SUMMARY_WAIT_PERCENT;
        }

        if (currentPercent >= 100) {
          clearInterval(interval);
          setActiveStepIndex((currentStep) => currentStep + 1);
          return 100;
        }

        const increment =
          isDocumentComplete && currentPercent >= SUMMARY_WAIT_PERCENT
            ? Math.max(1, Math.floor((currentPercent - SUMMARY_WAIT_PERCENT) / 8) + 1)
            : 1;

        return Math.min(100, currentPercent + increment);
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [activeStepIndex, isDocumentComplete]);

  const isComplete = activeStepIndex >= PROCESSING_STEPS.length;
  const progressPercent = isComplete
    ? 100
    : Math.min(
        100,
        Math.round(
          ((activeStepIndex + activeStepPercent / 100) / PROCESSING_STEPS.length) * 100,
        ),
      );
  const progressValueLabel = isComplete ? 'COMPLETE' : `${progressPercent}%`;

  const statusSteps = useMemo(
    () =>
      PROCESSING_STEPS.map((step, index) => {
        if (index < activeStepIndex) {
          return {
            label: step.label,
            status: 'done' as const,
            value: index === UPLOADED_STEP_INDEX ? 'COMPLETE' : 'DONE',
          };
        }

        if (index === activeStepIndex && !isComplete) {
          return {
            label: step.label,
            status: 'active' as const,
            value: `${activeStepPercent}%`,
          };
        }

        return { label: step.label, status: 'pending' as const, value: 'Pending' };
      }),
    [activeStepIndex, activeStepPercent, isComplete],
  );

  useEffect(() => {
    if (!isComplete || hasNotifiedCompletionRef.current) {
      return;
    }

    hasNotifiedCompletionRef.current = true;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [isComplete]);

  return {
    isComplete,
    progressValueLabel,
    statusSteps,
  };
}
