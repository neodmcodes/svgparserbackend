import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

export class FileService {
  private static uploadDir: string;

  static initialize(uploadDir: string): void {
    this.uploadDir = uploadDir;
  }

  /**
   * Ensure upload directory exists
   */
  static async ensureUploadDir(): Promise<void> {
    try {
      await access(this.uploadDir);
    } catch {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save uploaded file to disk
   */
  static async saveFile(filename: string, buffer: Buffer): Promise<string> {
    await this.ensureUploadDir();
    const filePath = path.join(this.uploadDir, filename);
    await writeFile(filePath, buffer);
    return filePath;
  }

  /**
   * Read file content from disk
   */
  static async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }

  /**
   * Get full file path
   */
  static getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }
}

