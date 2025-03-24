import { $ } from 'bun';
import { access, chmod, constants, mkdir, readdir } from 'node:fs/promises';
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
    const ytdlpRes = await fetch(
      `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${ytdlpName}`,
    );
    const ytdlpBlob = await ytdlpRes.blob();
    const ytdlpFile = path.join(vendorFolderName, ytdlpName);
    await Bun.write(ytdlpFile, await ytdlpBlob.arrayBuffer());
    if (platform !== 'win32') {
      await chmod(ytdlpFile, '777');
    }
  }

  if (!files.find((file) => file === ffmpegName)) {
    const ffmpegRes = await fetch(
      `https://github.com/eugeneware/ffmpeg-static/releases/latest/download/${ffmpegZipName}`,
    );
    const ffmpegBlob = await ffmpegRes.blob();
    const ffmpegFile = path.join(vendorFolderName, ffmpegName);
    await Bun.write(ffmpegFile, await ffmpegBlob.arrayBuffer());
    if (platform !== 'win32') {
      await chmod(ffmpegFile, '777');
    }
  }
}

export async function getYoutubeSubtitle(locale: string, url: string) {
  const prefix = platform === 'win32' ? '' : './';
  await $`${prefix}${ytdlpName} --skip-download --write-sub --sub-lang ${locale} -o temp ${url}`
    .cwd(vendorFolderName)
    .quiet();

  const file = await Bun.file(path.join(vendorFolderName, `temp.${locale}.vtt`));
  return await file.text();
}
