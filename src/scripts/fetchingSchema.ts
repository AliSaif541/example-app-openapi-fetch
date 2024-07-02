import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function fetchSwagger() {
  const branchName = process.env['BRANCH_NAME'];
  const fileName = `swagger-${branchName}.json`;

  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const listResponse = await drive.files.list({
      q: `name='${fileName}' and '1cRBjK_sBYiy1DtHhjC0nHXoG7tHol9zO' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = listResponse.data.files;
    if (files && files.length > 0) {
      const fileId = files[0]?.id;
      if (fileId) {
        const dest = fs.createWriteStream(`./src/Schema/${fileName}`);

        await drive.files.get(
          { fileId, alt: 'media' },
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
        console.error('File ID is undefined.');
      }
    } else {
      console.log(`No ${fileName} file found.`);
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }
}

fetchSwagger();
