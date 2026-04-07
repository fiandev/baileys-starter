import { spawn } from "child_process";
import { Readable } from "stream";
import { tmpdir } from "os";
import { join } from "path";
import { readFileSync, unlinkSync } from "fs";
import { type WAMessage } from "baileys";

class Sticker {
  public static async convertToSticker(message: WAMessage, stream: Readable): Promise<Buffer> {
    console.log('Sticker.convertToSticker: Starting conversion process using spawn.');
    const isVideo = !!message.message?.videoMessage;
    const filePath = join(tmpdir(), `sticker-${Date.now()}.webp`);
    console.log(`Sticker.convertToSticker: Temporary file path: ${filePath}`);

    try {
      await new Promise<void>((resolve, reject) => {
        // Explicitly define the ffmpeg path
        const ffmpegPath = "/usr/bin/ffmpeg";

        // Build arguments for the ffmpeg command line
        const baseArgs = [
          '-hide_banner',
          '-i', '-',          // Read input from stdin
          '-f', 'webp',       // Output format is webp
          '-loop', '0',
          '-qscale', '1',
          '-vsync', '0',
        ];

        const videoArgs = [
          '-preset', 'default',
          '-an',              // No audio
          '-vcodec', 'libwebp',
          '-t', '10',         // Maximum duration of 10 seconds
          '-r', '20',         // Frame rate of 20 fps
        ];

        const imageArgs = [
          '-vcodec', 'libwebp'
        ];

        // Combine arguments based on media type and append the output path at the end
        const ffmpegArgs = [...baseArgs, ...(isVideo ? videoArgs : imageArgs), filePath];

        console.log(`Sticker.convertToSticker: Spawning FFmpeg with command: ${ffmpegPath} ${ffmpegArgs.join(' ')}`);

        // Spawn the ffmpeg process
        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

        // Pipe the media stream to the ffmpeg process stdin
        stream.pipe(ffmpegProcess.stdin);

        // Collect stderr output for debugging
        let stderrOutput = '';
        ffmpegProcess.stderr.on('data', (data) => {
          stderrOutput += data.toString();
        });

        // Handle process startup failure (e.g., ENOENT)
        ffmpegProcess.on('error', (err) => {
          console.error('Sticker.convertToSticker: Failed to start FFmpeg process:', err);
          reject(err);
        });

        // Handle process completion
        ffmpegProcess.on('close', (code) => {
          if (code === 0) {
            console.log('Sticker.convertToSticker: FFmpeg process finished successfully.');
            resolve();
          } else {
            console.error(`Sticker.convertToSticker: FFmpeg process exited with non-zero code: ${code}`);
            console.error('Sticker.convertToSticker: FFmpeg stderr:', stderrOutput);
            reject(new Error(`FFmpeg exited with code ${code}`));
          }
        });
      });
    } catch (error) {
      console.error('Sticker.convertToSticker: Error during FFmpeg promise:', error);
      throw error; // Rethrow the error to be handled upstream
    }

    // This section works perfectly, no changes required.
    let webpBuffer: Buffer;
    try {
      webpBuffer = readFileSync(filePath);
      console.log('Sticker.convertToSticker: WebP file read into buffer.');
    } catch (error) {
      console.error('Sticker.convertToSticker: Error reading WebP file:', error);
      throw error;
    } finally {
      try {
        unlinkSync(filePath); // Cleanup
        console.log('Sticker.convertToSticker: Temporary file unlinked.');
      } catch (unlinkError) {
        console.error('Sticker.convertToSticker: Error unlinking temporary file:', unlinkError);
      }
    }

    console.log('Sticker.convertToSticker: Conversion process completed.');
    return webpBuffer;
  }

  // This function doesn't require any changes, it works perfectly.
  public static async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }
}

export default Sticker;
