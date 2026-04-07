import { spawn, type ChildProcessWithoutNullStreams, } from 'child_process';
import path, { join } from 'path';
import { env } from '../helpers/env';
import { existsSync, mkdirSync } from 'fs';

const storagePath = env("STORAGE_PATH");
const outputPath = path.join(storagePath, "tmp")

export function downloadAndMergeVideo(videoUrl: string): Promise<string> {
    if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true });
    }
    return new Promise<string>((resolve, reject) => {
        const ytDlp: ChildProcessWithoutNullStreams = spawn('yt-dlp', [
            '-f', 'bestvideo+bestaudio/best',
            '--merge-output-format', 'mp4',
            '-o', outputPath,
            videoUrl
        ]);

        ytDlp.stdout.on('data', (data: Buffer | string): void => {
            process.stdout.write(data.toString());
        });

        ytDlp.stderr.on('data', (data: Buffer | string): void => {
            process.stderr.write(data.toString());
        });

        ytDlp.on('close', (code: number | null): void => {
            if (code === 0) {
                const relativePath: string = path.relative(process.cwd(), outputPath);
                resolve(relativePath);
            } else {
                reject(new Error(`Proses berhenti dengan kode ${code}`));
            }
        });

        ytDlp.on('error', (error: Error): void => {
            reject(error);
        });
    });
}