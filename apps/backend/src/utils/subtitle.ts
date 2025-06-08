import { WebVTTParser } from 'webvtt-parser';

export function parseWebVTT(vttContent: string) {
  const parser = new WebVTTParser();
  const result = parser.parse(vttContent);

  return result.cues.map((cue) => ({
    startTime: Math.floor(cue.startTime * 1000),
    endTime: Math.floor(cue.endTime * 1000),
    subtitle: cue.text,
  }));
}
