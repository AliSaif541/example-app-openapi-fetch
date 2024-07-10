import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface GoogleDriveFile {
  id: string;
  name: string;
}

async function fetchSwagger() {
  const branchName = process.env['BRANCH_NAME'];
  const localHash = process.env['HASH_STRING'];
  const sourceFilePrefix = `schema-${branchName}`;
  const destinationFilePath = 'src/Schema/schema.json';

  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const listResponse = await drive.files.list({
      q: `'1cRBjK_sBYiy1DtHhjC0nHXoG7tHol9zO' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = listResponse.data.files as GoogleDriveFile[] | undefined;

    if (files && files.length > 0) {
      let latestFile: GoogleDriveFile | null = null;

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

        const dest = fs.createWriteStream(destinationFilePath);

        await drive.files.get(
          { fileId: latestFile.id, alt: 'media' },
          { responseType: 'stream' },
          (err, res) => {
            if (err) {
              console.error('Error fetching file:', err);
              return;
            }
            if (res && res.data && typeof res.data.on === 'function') {
              res.data
                .on('end', () => {
                  console.log('File downloaded successfully.');
                  updateEnvFile(remoteHash);
                })
                .on('error', (err) => {
                  console.error('Error downloading file:', err);
                })
                .pipe(dest);
            } else {
              console.error('Unexpected response format.');
            }
          }
        );
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

function updateEnvFile(newHash: string | undefined) {
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

fetchSwagger();
