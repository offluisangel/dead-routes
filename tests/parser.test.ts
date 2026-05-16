import { describe, it, expect, beforeEach } from 'vitest';
import { ImportExportParser } from '../src/parsers/importParser';

describe('ImportExportParser', () => {
  let parser: ImportExportParser;

  beforeEach(() => {
    parser = new ImportExportParser();
  });

  describe('parseImports', () => {
    it('should parse named imports', () => {
      const code = `import { useState, useEffect } from 'react';`;
      const imports = parser.parseImports(code, 'test.ts');

      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('react');
      expect(imports[0].named).toContain('useState');
      expect(imports[0].named).toContain('useEffect');
    });

    it('should parse default imports', () => {
      const code = `import React from 'react';`;
      const imports = parser.parseImports(code, 'test.ts');

      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('react');
      expect(imports[0].default).toBe(true);
    });

    it('should parse namespace imports', () => {
      const code = `import * as path from 'path';`;
      const imports = parser.parseImports(code, 'test.ts');

      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('path');
      expect(imports[0].namespace).toBe('path');
    });
  });

  describe('parseExports', () => {
    it('should parse named function exports', () => {
      const code = `export function myFunc() { }`;
      const exports = parser.parseExports(code, 'test.ts');

      expect(exports.length).toBeGreaterThan(0);
      const myFuncExport = exports.find((e) => e.name === 'myFunc');
      expect(myFuncExport).toBeDefined();
    });

    it('should parse named variable exports', () => {
      const code = `export const MY_CONST = 42;`;
      const exports = parser.parseExports(code, 'test.ts');

      expect(exports.length).toBeGreaterThan(0);
      const constExport = exports.find((e) => e.name === 'MY_CONST');
      expect(constExport).toBeDefined();
    });

    it('should parse default exports', () => {
      const code = `export default MyComponent;`;
      const exports = parser.parseExports(code, 'test.ts');

      const defaultExport = exports.find((e) => e.type === 'default');
      expect(defaultExport).toBeDefined();
    });
  });
});
