import { fileTypeFromBuffer } from "file-type";

interface StickerMetadata {
  pack?: string;
  author?: string;
}

class StickerFormatter {
  private buffer: Buffer;
  private metadata: StickerMetadata;

  constructor(buffer: Buffer, metadata: StickerMetadata = {}) {
    this.buffer = buffer;
    this.metadata = metadata;
  }

  async toBuffer(): Promise<Buffer> {
    // Add EXIF metadata to WebP
    const webpBuffer = await this.addExifToWebp(this.buffer, this.metadata);
    return webpBuffer;
  }

  private async addExifToWebp(
    webpBuffer: Buffer,
    metadata: StickerMetadata,
  ): Promise<Buffer> {
    // Simple WebP with EXIF implementation
    const packName = metadata.pack || "Sticker";
    const authorName = metadata.author || "Bot";

    // EXIF metadata for WhatsApp stickers
    const exifData = this.createExifData(packName, authorName);

    // Insert EXIF into WebP
    return this.insertExifIntoWebp(webpBuffer, exifData);
  }

  private createExifData(pack: string, author: string): Buffer {
    // Create minimal EXIF data for WhatsApp stickers
    const exifHeader = Buffer.from([
      0x49,
      0x49,
      0x2a,
      0x00, // TIFF header (little endian)
      0x08,
      0x00,
      0x00,
      0x00, // Offset to first IFD
    ]);

    // IFD entries
    const makeEntry = this.createAsciiFieldEntry(0x010f, pack); // Make
    const modelEntry = this.createAsciiFieldEntry(0x0110, author); // Model
    const softwareEntry = this.createAsciiFieldEntry(0x0131, "WhatsApp"); // Software

    const ifdEntries = Buffer.concat([makeEntry, modelEntry, softwareEntry]);

    // IFD count and next IFD offset
    const ifdHeader = Buffer.alloc(2 + ifdEntries.length + 4);
    ifdHeader.writeUInt16LE(3, 0); // 3 entries
    ifdEntries.copy(ifdHeader, 2);
    // Next IFD offset is 0 (end of IFD chain)

    const exifData = Buffer.concat([exifHeader, ifdHeader]);
    return exifData;
  }

  private createAsciiFieldEntry(tag: number, value: string): Buffer {
    const valueBytes = Buffer.from(value + "\0");
    const entry = Buffer.alloc(12);
    entry.writeUInt16LE(tag, 0); // Tag
    entry.writeUInt16LE(2, 2); // Type (ASCII)
    entry.writeUInt32LE(valueBytes.length, 4); // Count
    entry.writeUInt32LE(0, 8); // Value/Offset (will be calculated later)
    return entry;
  }

  private insertExifIntoWebp(
    webpBuffer: Buffer,
    exifData: Buffer,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Check if it's a valid WebP
        if (webpBuffer.length < 12) {
          reject(new Error("Invalid WebP buffer"));
          return;
        }

        const riff = webpBuffer.toString("ascii", 0, 4);
        if (riff !== "RIFF") {
          reject(new Error("Not a WebP file"));
          return;
        }

        // Find VP8 chunk
        let offset = 12; // Skip RIFF header
        let foundVP8 = false;

        while (offset < webpBuffer.length - 4) {
          const chunkFourCC = webpBuffer.toString("ascii", offset, offset + 4);
          const chunkSize = webpBuffer.readUInt32LE(offset + 4);

          if (
            chunkFourCC === "VP8 " ||
            chunkFourCC === "VP8L" ||
            chunkFourCC === "VP8X"
          ) {
            foundVP8 = true;
            break;
          }

          offset += 8 + chunkSize + (chunkSize % 2); // Align to even boundary
        }

        if (!foundVP8) {
          reject(new Error("No VP8 chunk found in WebP"));
          return;
        }

        // Insert EXIF chunk before VP8 chunk
        const exifChunkHeader = Buffer.from("EXIF");
        const exifChunkSize = Buffer.alloc(4);
        exifChunkSize.writeUInt32LE(exifData.length, 0);

        // Pad EXIF data to even length
        const paddedExifData =
          exifData.length % 2 === 0
            ? exifData
            : Buffer.concat([exifData, Buffer.from([0])]);

        const newWebp = Buffer.concat([
          webpBuffer.slice(0, offset), // Before VP8
          exifChunkHeader, // EXIF chunk FourCC
          exifChunkSize, // EXIF chunk size
          paddedExifData, // EXIF data
          webpBuffer.slice(offset), // VP8 and rest
        ]);

        // Update RIFF file size
        const newFileSize = newWebp.length - 8; // Excluding RIFF header itself
        newWebp.writeUInt32LE(newFileSize, 4);

        resolve(newWebp);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async fromBuffer(buffer: Buffer): Promise<StickerFormatter> {
    // Validate buffer type
    const fileType = await fileTypeFromBuffer(buffer);
    if (
      !fileType ||
      !["image/webp", "image/png", "image/jpeg"].includes(fileType.mime)
    ) {
      throw new Error("Unsupported image format");
    }

    return new StickerFormatter(buffer);
  }
}

export { StickerFormatter };
