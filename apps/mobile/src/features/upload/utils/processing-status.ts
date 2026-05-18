export function isCompleteStatus(status?: string) {
  return status?.toUpperCase() === 'COMPLETED';
}
