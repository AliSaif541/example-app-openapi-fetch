export interface StorageService {
    listFiles(query: string): Promise<{ id: string, name: string }[]>;
    getFile(fileId: string, destinationPath: string): Promise<void>;
}
  