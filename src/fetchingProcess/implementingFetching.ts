import { GoogleDriveService } from './services/googleDriveService.ts';
import { SchemaFetch } from './processes/schemaFetch.ts';

async function implementingFetch() {
  const storageService = new GoogleDriveService();
  const fetchProcess = new SchemaFetch(storageService);

  await fetchProcess.fetchFile();
}

implementingFetch();
