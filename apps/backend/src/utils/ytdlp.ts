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

export async function prepareBinary() {
  try {
    await access(vendorFolderName, constants.R_OK | constants.W_OK);
  } catch {
    await mkdir(vendorFolderName, { recursive: true });
  }

  const files = await readdir(vendorFolderName);
  if (!files.find((file) => file.startsWith('yt-dlp'))) {
    await Bun.write(
      path.join(vendorFolderName, ytdlpName),
      await fetch(`https://github.com/yt-dlp/yt-dlp/releases/latest/download/${ytdlpName}`),
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
