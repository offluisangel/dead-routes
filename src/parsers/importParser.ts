import { parse } from '@typescript-eslint/typescript-estree';
import type { ImportInfo, ExportInfo } from '../types/index.js';

export class ImportExportParser {
  parseImports(content: string, filePath: string): ImportInfo[] {
    const imports: ImportInfo[] = [];

    try {
      const ast = parse(content, {
        filePath,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      });

      // Traverse AST to find imports
      this.traverseAST(ast, (node: any) => {
        if (node.type === 'ImportDeclaration') {
          const importInfo: ImportInfo = {
            source: node.source.value,
            named: [],
          };

          for (const spec of node.specifiers) {
            if (spec.type === 'ImportSpecifier') {
              importInfo.named.push(spec.imported.name);
            } else if (spec.type === 'ImportDefaultSpecifier') {
              importInfo.default = true;
            } else if (spec.type === 'ImportNamespaceSpecifier') {
              importInfo.namespace = spec.local.name;
            }
          }

          imports.push(importInfo);
        }
      });
    } catch (error) {
      // Fallback to regex-based parsing
      return this.parseImportsRegex(content);
    }

    return imports;
  }

  parseExports(content: string, filePath: string): ExportInfo[] {
    const exports: ExportInfo[] = [];

    try {
      const ast = parse(content, {
        filePath,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      });

      // Traverse AST to find exports
      this.traverseAST(ast, (node: any, line?: number) => {
        if (node.type === 'ExportNamedDeclaration') {
          if (node.declaration) {
            if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
              exports.push({
                name: node.declaration.id.name,
                type: 'named',
                line: line || 0,
              });
            } else if (node.declaration.type === 'VariableDeclaration') {
              for (const decl of node.declaration.declarations) {
                if (decl.id && decl.id.name) {
                  exports.push({
                    name: decl.id.name,
                    type: 'named',
                    line: line || 0,
                  });
                }
              }
            }
          } else if (node.specifiers) {
            for (const spec of node.specifiers) {
              exports.push({
                name: spec.exported.name,
                type: 'named',
                line: line || 0,
              });
            }
          }
        } else if (node.type === 'ExportDefaultDeclaration') {
          exports.push({
            name: 'default',
            type: 'default',
            line: line || 0,
          });
        }
      });
    } catch (error) {
      // Fallback to regex-based parsing
      return this.parseExportsRegex(content);
    }

    return exports;
  }

  private traverseAST(node: any, callback: (node: any, line?: number) => void): void {
    callback(node, node.loc?.start?.line || 0);
    for (const key in node) {
      if (typeof node[key] === 'object' && node[key] !== null) {
        if (Array.isArray(node[key])) {
          for (const item of node[key]) {
            if (typeof item === 'object' && item !== null) {
              this.traverseAST(item, callback);
            }
          }
        } else {
          this.traverseAST(node[key], callback);
        }
      }
    }
  }

  private parseImportsRegex(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const importRegex = /import\s+(?:(?:\{([^}]*)\})|(?:\*\s+as\s+(\w+))|(\w+))\s+from\s+['"]([^'"]+)['"]/gm;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const [, named, namespace, defaultImport, source] = match;
      const importInfo: ImportInfo = {
        source,
        named: named ? named.split(',').map((n) => n.trim()) : [],
      };

      if (namespace) importInfo.namespace = namespace;
      if (defaultImport) importInfo.default = true;

      imports.push(importInfo);
    }

    return imports;
  }

  private parseExportsRegex(content: string): ExportInfo[] {
    const exports: ExportInfo[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // export function
      const funcMatch = line.match(/export\s+(?:async\s+)?function\s+(\w+)/);
      if (funcMatch) {
        exports.push({
          name: funcMatch[1],
          type: 'named',
          line: index + 1,
        });
      }

      // export const/let/var
      const varMatch = line.match(/export\s+(?:const|let|var)\s+(\w+)/);
      if (varMatch) {
        exports.push({
          name: varMatch[1],
          type: 'named',
          line: index + 1,
        });
      }

      // export default
      if (line.includes('export default')) {
        exports.push({
          name: 'default',
          type: 'default',
          line: index + 1,
        });
      }
    });

    return exports;
  }
}
