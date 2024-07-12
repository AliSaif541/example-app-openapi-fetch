import { StorageService } from '../services/storageService';

export abstract class FileFetchProcess {
  protected storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  abstract fetchFile(): Promise<void>;
}
