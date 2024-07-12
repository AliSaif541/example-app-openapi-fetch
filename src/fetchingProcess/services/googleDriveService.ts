import { google } from 'googleapis';
import fs from 'fs';
import { StorageService } from './storageService.ts';

export class GoogleDriveService implements StorageService {
  private drive;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: './credentials.json',
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async listFiles(query: string): Promise<{ id: string, name: string }[]> {
    const listResponse = await this.drive.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    return listResponse.data.files?.map(file => ({
      id: file.id!,
      name: file.name!,
    })) || [];
  }

  async getFile(fileId: string, destinationPath: string): Promise<void> {
    const dest = fs.createWriteStream(destinationPath);

    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      if (response.data && typeof response.data.pipe === 'function') {
        await this.streamToFile(response.data, dest);
      } else {
        throw new Error('Unexpected response format.');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      throw err;
    }
  }

  private async streamToFile(readableStream: NodeJS.ReadableStream, writableStream: NodeJS.WritableStream): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      readableStream
        .pipe(writableStream)
        .on('finish', () => resolve())
        .on('error', (err) => {
          writableStream.end();
          reject(err);
        });
    });
  }
}
