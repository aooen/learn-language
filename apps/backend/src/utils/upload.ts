import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import * as path from 'path';

const UPLOAD_DIR = 'uploads';
mkdirSync(UPLOAD_DIR, { recursive: true });

export async function uploadFile(file: File | Buffer, extension: string = '') {
  const filename = `${randomUUID()}${extension}`;
  const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return filename;
}
