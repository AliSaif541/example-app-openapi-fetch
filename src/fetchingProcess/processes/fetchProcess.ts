import { StorageService } from '../services/storageService.ts';

export abstract class FileFetchProcess {
  protected storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  abstract fetchFile(): Promise<void>;
}
