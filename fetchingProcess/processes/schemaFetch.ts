import { FileFetchProcess } from './fetchProcess';
import { StorageService } from '../services/storageService';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

export class SchemaFetch extends FileFetchProcess {
  constructor(storageService: StorageService) {
    super(storageService);
  }

  private updateEnvFile(newHash: string | undefined) {
    if (!newHash) {
      console.error('No new hash to update.');
      return;
    }

    const envPath = '.env.local';
    let envContent = fs.readFileSync(envPath, 'utf-8');
    const hashLinePattern = /^HASH_STRING = .*/m;
    const newHashLine = `HASH_STRING = ${newHash}`;

    if (hashLinePattern.test(envContent)) {
      envContent = envContent.replace(hashLinePattern, newHashLine);
    } else {
      envContent += `\n${newHashLine}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('Updated .env.local with new hash number:', newHash);
  }

  async fetchFile(): Promise<void> {
    const branchName = process.env['BRANCH_NAME'];
    const localHash = process.env['HASH_STRING'];
    const sourceFilePrefix = `schema-${branchName}`;
    const destinationFilePath = 'src/Schema/schema.json';

    try {
      const files = await this.storageService.listFiles(`'${process.env['DRIVE_FOLDER_ID']}' in parents and trashed=false`);

      if (files.length > 0) {
        let latestFile: { id: string, name: string } | null = null;

        for (const file of files) {
          if (file.name && file.name.startsWith(sourceFilePrefix)) {
            latestFile = file;
            break;
          }
        }

        if (latestFile && latestFile.id) {
          const latestFileName = latestFile.name;
          const remoteHash = latestFileName.split('-').pop()?.replace('.json', '');

          if (localHash === remoteHash) {
            console.log(`Local file hash (${localHash}) is already the latest. Skipping download.`);
            return;
          }

          await this.storageService.getFile(latestFile.id, destinationFilePath);
          console.log('File downloaded successfully.');
          this.updateEnvFile(remoteHash);
        } else {
          console.log(`No file with the prefix ${sourceFilePrefix} found.`);
        }
      } else {
        console.log('No files found in the specified folder.');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }
}
