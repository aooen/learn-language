/**
 * Extract video ID from different YouTube URL formats:
 * - https://www.youtube.com/watch?v=-4GmbBoYQjE
 * - https://www.youtube.com/watch?v=-4GmbBoYQjE&t=2
 * - https://youtu.be/-4GmbBoYQjE
 * - https://youtu.be/-4GmbBoYQjE?t=2
 */
export function getYoutubeId(url: string) {
  let matches;

  // For youtu.be format
  if (url.includes('youtu.be')) {
    matches = url.match(/youtu\.be\/([^?&]+)/);
    if (matches?.[1]) {
      return matches[1];
    }
  }

  // For youtube.com format
  matches = url.match(/[?&]v=([^?&]+)/);
  if (matches?.[1]) {
    return matches[1];
  }

  throw new Error("It's not a youtube url.");
}
