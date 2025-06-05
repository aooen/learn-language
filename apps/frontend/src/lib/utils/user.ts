export function getImageUrl(path: string): string {
  if (path.startsWith('http') || path === '') {
    return path;
  }
  return `${import.meta.env.VITE_API_URL}${path}`;
}
