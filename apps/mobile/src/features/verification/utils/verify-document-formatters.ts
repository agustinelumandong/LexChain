export function formatVerificationDate(value?: string) {
  if (!value) {
    return 'Pending';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatVerificationContentType(value?: string) {
  if (!value) {
    return 'Pending';
  }

  if (value === 'application/pdf') {
    return 'PDF';
  }

  return value.split('/').pop()?.toUpperCase() ?? value;
}

export function formatVerificationReference(value?: string) {
  if (!value) {
    return 'Pending';
  }

  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-7)}`;
}
