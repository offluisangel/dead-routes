import { glob } from 'glob';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { ScannedFile, Framework } from '../types/index.js';
import { detectFramework } from '../utils/frameworkDetector.js';

export class FileScanner {
  private ignorePatterns = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '.next/**',
    'coverage/**',
    '**/*.d.ts',
  ];

  private fileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json'];

  async scan(projectPath: string, customIgnore?: string[]): Promise<ScannedFile[]> {
    const patterns = this.fileExtensions.map((ext) => `**/*.${ext}`);
    const ignores = [...this.ignorePatterns, ...(customIgnore || [])];

    try {
      const files = await glob(patterns, {
        cwd: projectPath,
        ignore: ignores,
        absolute: false,
      });

      const scannedFiles: ScannedFile[] = [];

      for (const filePath of files) {
        const absolutePath = resolve(projectPath, filePath);
        try {
          const content = readFileSync(absolutePath, 'utf-8');
          const ext = filePath.split('.').pop() as 'ts' | 'tsx' | 'js' | 'jsx' | 'json';
          const framework = detectFramework(filePath, content);
          
          scannedFiles.push({
            path: filePath,
            type: ext,
            content,
            framework: framework !== 'unknown' ? framework : undefined,
            lastModified: new Date(),
          });
        } catch (error) {
          console.warn(`Failed to read file: ${filePath}`, error);
        }
      }

      return scannedFiles;
    } catch (error) {
      throw new Error(`Failed to scan project: ${error}`);
    }
  }

  detectFrameworks(files: ScannedFile[]): Map<string, Framework> {
    const frameworks = new Map<string, Framework>();

    for (const file of files) {
      const framework = detectFramework(file.path, file.content);
      if (framework !== 'unknown') {
        frameworks.set(framework, framework);
      }
    }

    return frameworks;
  }
}
