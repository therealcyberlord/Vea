export function stripBase64Header(base64String: string): string {
  const matches = base64String.match(/^data:image\/[a-zA-Z]+;base64,(.+)$/);
  return matches ? matches[1] : base64String;
}
