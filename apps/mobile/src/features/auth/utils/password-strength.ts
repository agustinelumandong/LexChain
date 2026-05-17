import { APP_COLORS } from '@/theme';

import { PASSWORD_RULES } from '../schemas/sign-up.schema';

export function getPasswordStrengthState(value: string) {
  const checks = PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(value),
  }));

  const passedCount = checks.filter((rule) => rule.passed).length;
  const progress = passedCount / PASSWORD_RULES.length;

  let tone: string = APP_COLORS.danger;
  let label = 'Weak';

  if (passedCount >= 5) {
    tone = APP_COLORS.success;
    label = 'Strong';
  } else if (passedCount >= 3) {
    tone = APP_COLORS.warning;
    label = 'Fair';
  }

  return {
    checks,
    passedCount,
    progress,
    tone,
    label,
    missingRules: checks.filter((rule) => !rule.passed).map((rule) => rule.label),
  };
}
