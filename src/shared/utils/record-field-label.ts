/** Turns a stored field path such as `snapshot.signed_copy_id` into "Signed copy ID". */
export function recordFieldLabel(field: string): string {
  const words = (field.split('.').pop() ?? field).replaceAll('_', ' ').replace(/\bid\b/gi, 'ID');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
