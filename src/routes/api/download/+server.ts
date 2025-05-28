import ffmpeg from 'ffmpeg-static';

import { rm, mkdir, readFile, writeFile } from 'fs/promises';
import { spawn } from 'child_process';
import { json } from '@sveltejs/kit';
import { join } from 'path';
import { tmpdir } from 'os';

async function downloadM3U8(url: string, outputPath: string): Promise<void> {
  let response: Response;
  let content: string;
  try {
    response = await fetch(url);
    if (response.ok) {
      content = await response.text();
    } else {
      throw new Error(`Network response was not ok (${response.status})`);
    }
  } catch (error) {
    throw new Error(`Error downloading m3u8 file: ${error}`);
  }

  try {
    const file = join(outputPath, 'playlist.m3u8');
    await writeFile(file, content);
  } catch (error) {
    throw new Error(`Error writing m3u8 file: ${error}`);
  }

  const segments = Array.from(new Set(
    content.split('\n').filter(line => line.endsWith('.ts'))
  ));
  console.debug('segments:', segments);

  await Promise.all(
    segments.map(async (file) => {
      let fileBlob: Blob;
      try {
        const fileUrl = new URL(file, url).href;
        response = await fetch(fileUrl);
        if (response.ok) {
          fileBlob = await response.blob();
        } else {
          throw new Error(`Network response was not ok (${response.status})`);
        }
      } catch (error) {
        throw new Error(`Error downloading segment "${file}": ${error}`);
      }

      try {
        const filePath = join(outputPath, file);
        const fileBytes = await fileBlob.bytes();
        await writeFile(filePath, fileBytes);
        console.debug('wrote', file, '(', fileBytes.length, 'bytes)');
      } catch (error) {
        throw new Error(`Error writing "${file}": ${error}`);
      }
    })
  );
}

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

  const fileDir = join(tmpdir(), 'KickClipTool', clipId);
  try {
    await mkdir(fileDir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
    return json({ error: 'cant create temporal directory' }, { status: 500 });
  }

  console.debug('downloading segments...');
  try {
    await downloadM3U8(url, fileDir);
  } catch (error) {
    console.error('Error downloading m3u8:', error);
    return json({ error: 'error downloading m3u8' }, { status: 500 });
  }

  const fileName = `${clipId}.mp4`;
  const filePath = join(fileDir, fileName);
  const args = [
    '-i', join(fileDir, 'playlist.m3u8'),
    '-f', 'mp4',
    '-bsf:a', 'aac_adtstoasc',
    '-c', 'copy',
    filePath
  ];

  console.debug('transcoding to mpeg-4...');
  try {
    await runFFmpeg(ffmpeg, args);
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

  console.debug('removing temporary files...');
  try {
    await rm(fileDir, { recursive: true });
  } catch (error) {
    console.error('Error removing temporary files:', error);
  }

  return new Response(fileBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${fileName}"`
    }
  });
}
