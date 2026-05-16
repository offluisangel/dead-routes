import { describe, it, expect, beforeAll } from 'vitest';
import { FileScanner } from '../src/scanner/fileScanner';
import { resolve } from 'path';

describe('FileScanner', () => {
  let scanner: FileScanner;

  beforeAll(() => {
    scanner = new FileScanner();
  });

  it('should scan fixture project files', async () => {
    const fixturePath = resolve('./tests/fixtures/express');
    const files = await scanner.scan(fixturePath);

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThan(0);

    // Check that we found TypeScript files
    const tsFiles = files.filter((f) => f.type === 'ts');
    expect(tsFiles.length).toBeGreaterThan(0);
  });

  it('should ignore node_modules by default', async () => {
    const fixturePath = resolve('./tests/fixtures/express');
    const files = await scanner.scan(fixturePath);

    const hasNodeModules = files.some((f) => f.path.includes('node_modules'));
    expect(hasNodeModules).toBe(false);
  });

  it('should detect Express framework', async () => {
    const fixturePath = resolve('./tests/fixtures/express');
    const files = await scanner.scan(fixturePath);
    const frameworks = scanner.detectFrameworks(files);

    expect(frameworks.size).toBeGreaterThan(0);
  });
});
