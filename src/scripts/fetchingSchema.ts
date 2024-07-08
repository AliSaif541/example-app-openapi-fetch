import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import semver from 'semver';

dotenv.config({ path: '.env.local' });

interface GoogleDriveFile {
  id: string;
  name: string;
}

async function fetchSwagger() {
  const branchName = process.env['BRANCH_NAME'];
  const currentVersion = process.env['VERSION_NUMBER'];
  const sourceFilePrefix = `schema-${branchName}`;
  const destinationFileName = 'schema.ts';

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
    console.log("files: ", files);

    if (files && files.length > 0) {
      const versionPattern = new RegExp(`${sourceFilePrefix}-(\\d+\\.\\d+\\.\\d+)\\.ts`);
      let latestFile: GoogleDriveFile | null = null;
      let latestVersion = currentVersion || '0.0.0';

      for (const file of files) {
        if (file.name) {
          const match = file.name.match(versionPattern);
          if (match && match[1]) {
            const fileVersion = match[1];
            if (semver.gt(fileVersion, latestVersion)) {
              latestVersion = fileVersion;
              latestFile = file;
              console.log("latest file: ", latestFile);
              console.log("latest version: ", latestVersion);
            }
          }
        }
      }

      if (latestFile && latestFile.id) {
        const dest = fs.createWriteStream(`./src/Schema/${destinationFileName}`);

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
                  updateEnvFile(latestVersion);
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
        console.log(`No newer version of ${sourceFilePrefix} found.`);
      }
    } else {
      console.log('No files found in the specified folder.');
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }
}

function updateEnvFile(newVersion: string) {
  const envPath = '.env.local';
  let envContent = fs.readFileSync(envPath, 'utf-8');
  const versionLinePattern = /^VERSION_NUMBER = .*/m;
  const newVersionLine = `VERSION_NUMBER = ${newVersion}`;

  if (versionLinePattern.test(envContent)) {
    envContent = envContent.replace(versionLinePattern, newVersionLine);
  } else {
    envContent += `\n${newVersionLine}`;
  }

  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log('Updated .env.local with new version number:', newVersion);
}

fetchSwagger();
