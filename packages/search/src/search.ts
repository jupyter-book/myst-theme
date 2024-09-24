export const SPACE_OR_PUNCTUATION = /[\n\r\p{Z}\p{P}]+/gu;
export function extractField(document: Record<string, unknown>, fieldName: string) {
  // Access nested fields
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return fieldName.split('.').reduce((doc, key) => doc && doc[key], document);
}
