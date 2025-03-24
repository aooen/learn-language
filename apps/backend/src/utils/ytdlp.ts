import { $ } from 'bun';
import { access, constants, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { platform } from 'node:process';

export const vendorFolderName = path.resolve(__dirname, '../../', 'vendors/ytdlp');

export const ytdlpName = (() => {
  switch (platform) {
    case 'win32':
      return 'yt-dlp.exe';
    case 'darwin':
      return 'yt-dlp_macos';
    default:
      return 'yt-dlp';
  }
})();

export const ffmpegName = (() => {
  switch (platform) {
    case 'win32':
      return 'ffmpeg.exe';
    case 'darwin':
    default:
      return 'ffmpeg';
  }
})();

export const ffmpegZipName = (() => {
  switch (platform) {
    case 'win32':
      return 'ffmpeg-win32-x64';
    case 'darwin':
      return 'ffmpeg-darwin-x64';
    default:
      return 'ffmpeg-linux-x64';
  }
})();

export async function prepareBinaries() {
  try {
    await access(vendorFolderName, constants.R_OK | constants.W_OK);
  } catch {
    await mkdir(vendorFolderName, { recursive: true });
  }

  const files = await readdir(vendorFolderName);
  if (!files.find((file) => file === ytdlpName)) {
    await Bun.write(
      path.join(vendorFolderName, ytdlpName),
      await fetch(`https://github.com/yt-dlp/yt-dlp/releases/latest/download/${ytdlpName}`),
    );
  }

  if (!files.find((file) => file === ffmpegName)) {
    await Bun.write(
      path.join(vendorFolderName, ffmpegName),
      await fetch(
        `https://github.com/eugeneware/ffmpeg-static/releases/latest/download/${ffmpegZipName}`,
      ),
    );
  }
}

export async function getYoutubeSubtitle(locale: string, url: string) {
  await $`${ytdlpName} --skip-download --write-sub --sub-lang ${locale} -o temp ${url}`
    .cwd(vendorFolderName)
    .quiet();

  const file = await Bun.file(path.join(vendorFolderName, `temp.${locale}.vtt`));
  return await file.text();
}
