export enum SiteType {
  Plain = 'plain',
  Youtube = 'youtube',
}

export function determineSiteType(_url: string) {
  try {
    const url = new URL(_url);
    switch (true) {
      case url.hostname.endsWith('youtube.com'):
      case url.hostname.endsWith('youtu.be'):
        return SiteType.Youtube;
    }
  } catch (e) {}

  return SiteType.Plain;
}
