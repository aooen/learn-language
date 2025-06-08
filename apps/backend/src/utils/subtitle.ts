import { WebVTTParser } from 'webvtt-parser';
import { countStem } from './stem';

export async function parseWebVTT(vttContent: string) {
  const parser = new WebVTTParser();
  const result = parser.parse(vttContent);

  const subtitles = result.cues.map((cue) => ({
    startTime: Math.floor(cue.startTime * 1000),
    endTime: Math.floor(cue.endTime * 1000),
    subtitle: cue.text,
  }));

  return {
    subtitles,
    stemCount: countStem(result.cues.map((cue) => cue.text)),
  };
}
