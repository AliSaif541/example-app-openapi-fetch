import { GoogleDriveService } from './services/googleDriveService';
import { SchemaFetch } from './processes/schemaFetch';

async function implementingFetch() {
  const storageService = new GoogleDriveService();
  const fetchProcess = new SchemaFetch(storageService);

  await fetchProcess.fetchFile();
}

implementingFetch();
