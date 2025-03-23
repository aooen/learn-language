export enum SiteType {
  Plain = 'plain',
  Youtube = 'youtube',
}

export function determineSiteType(_url: string) {
  const url = new URL(_url);
  switch (true) {
    case url.hostname.endsWith('youtube.com'):
      return SiteType.Youtube;
    default:
      return SiteType.Plain;
  }
}
