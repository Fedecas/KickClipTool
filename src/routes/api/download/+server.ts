import ffmpeg from 'ffmpeg-static';

import { rm, mkdir, readFile } from 'fs/promises';
import { spawn } from 'child_process';
import { json } from '@sveltejs/kit';
import { join } from 'path';
import { tmpdir } from 'os';

async function runFFmpeg(ffmpegDir: string, args: string[], log: boolean = false): Promise<void> {
  await new Promise((resolve, reject) => {
    const child = spawn(ffmpegDir, args);

    child.on('close', (code: number) => {
      console.debug('FFmpeg process exited with code:', code);
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`FFmpeg failed with exit code: ${code}`));
      }
    });

    child.on('error', reject);

    if (log) {
      child.stdout.on('data', (data) => {
        console.debug('stdout:', data);
      });

      child.stderr.on('data', (data) => {
        console.error('stderr:', data);
      });
    }
  });
}

export async function POST({ request }): Promise<Response> {
  const { url } = await request.json() as { url: string };
  if (!url) return json({ error: 'm3u8 url not found' }, { status: 400 });

  const match = url.match('(clip_[a-zA-Z0-9]+)');
  if (!match) return json({ error: 'invalid m3u8 url' }, { status: 400 });
  const clipId = match[0];

  if (!ffmpeg) {
    console.error('FFmpeg not found');
    return json({ error: 'FFmpeg not found' }, { status: 500 });
  }

  console.debug("FFmpeg found:", ffmpeg);

  const fileDir = join(tmpdir(), 'KickClipTool', clipId);
  try {
    await mkdir(fileDir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
    return json({ error: 'cant create temporal directory' }, { status: 500 });
  }

  const fileName = `${clipId}.mp4`;
  const filePath = join(fileDir, fileName);
  const args = [
    '-i', url,
    '-f', 'mp4',
    '-bsf:a', 'aac_adtstoasc',
    '-c', 'copy',
    filePath
  ];

  try {
    await runFFmpeg(ffmpeg, args, true);
  } catch (error) {
    console.error('Error running ffmpeg:', error);
    return json({ error: 'error running ffmpeg' }, { status: 500 });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(filePath);
  } catch (error) {
    console.error('Error reading output file:', error);
    return json({ error: 'error reading output file' }, { status: 500 });
  }

  /*console.debug('removing temporary files...');
  try {
    await rm(fileDir, { recursive: true });
  } catch (error) {
    console.error('Error removing temporary files:', error);
  }*/

  return new Response(fileBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${fileName}"`
    }
  });
}
