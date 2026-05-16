import type { RouteDefinition, HttpCall, ImportInfo, ExportInfo, PathAlias } from '../types/index.js';

export interface DependencyNode {
  id: string;
  type: 'route' | 'export' | 'import' | 'http-call';
  file: string;
  line: number;
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();
  private edges: Map<string, Set<string>> = new Map(); // from -> to
  private routesMap: Map<string, RouteDefinition> = new Map();
  private httpCallsMap: Map<string, HttpCall[]> = new Map();
  private exportsMap: Map<string, Map<string, ExportInfo>> = new Map(); // file -> name -> ExportInfo
  private importsMap: Map<string, ImportInfo[]> = new Map(); // file -> ImportInfo[]
  private pathAliases: PathAlias[] = [];
  private projectPath: string = '';

  setProjectPath(path: string): void {
    this.projectPath = path;
  }

  setPathAliases(aliases: PathAlias[]): void {
    this.pathAliases = aliases;
  }

  addRoute(route: RouteDefinition): void {
    const id = `route:${route.method}:${route.path}`;
    this.nodes.set(id, {
      id,
      type: 'route',
      file: route.file,
      line: route.line,
    });
    this.routesMap.set(id, route);
    if (!this.edges.has(id)) {
      this.edges.set(id, new Set());
    }
  }

  addHttpCall(call: HttpCall): void {
    if (!this.httpCallsMap.has(call.file)) {
      this.httpCallsMap.set(call.file, []);
    }
    this.httpCallsMap.get(call.file)!.push(call);
  }

  addExport(file: string, exp: ExportInfo): void {
    if (!this.exportsMap.has(file)) {
      this.exportsMap.set(file, new Map());
    }
    const id = `export:${file}:${exp.name}`;
    this.nodes.set(id, {
      id,
      type: 'export',
      file,
      line: exp.line,
    });
    this.exportsMap.get(file)!.set(exp.name, exp);
  }

  addImport(file: string, imp: ImportInfo): void {
    if (!this.importsMap.has(file)) {
      this.importsMap.set(file, []);
    }
    this.importsMap.get(file)!.push(imp);
  }

  private resolveImportPath(importSource: string, importerFile: string): string | null {
    const normalizedImporter = importerFile.replace(/\\/g, '/');
    const importerDir = normalizedImporter.substring(0, normalizedImporter.lastIndexOf('/'));

    if (importSource.startsWith('@')) {
      for (const alias of this.pathAliases) {
        if (importSource.startsWith(alias.alias)) {
          const suffix = importSource.slice(alias.alias.length);
          const target = alias.target.replace(/^\.\//, '').replace(/\\/g, '/');
          return target + suffix;
        }
      }
    }

    if (importSource.startsWith('.')) {
      const basePath = importSource.replace(/^\.\/+/, '');
      let resolvedPath = `${importerDir}/${basePath}`;
      const resolvedNormalized = resolvedPath.replace(/\\/g, '/');

      const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
      for (const ext of extensions) {
        const testPath = resolvedPath + ext;
        const testNormalized = testPath.replace(/\\/g, '/');

        if (this.exportsMap.has(testPath) || this.exportsMap.has(testNormalized)) {
          return testPath;
        }
      }

      for (const [existingFile] of this.exportsMap.entries()) {
        const existingNormalized = existingFile.replace(/\\/g, '/');
        const existingFileName = existingNormalized.split('/').pop()?.replace(/\.[^.]+$/, '');
        const importedFileName = resolvedNormalized.split('/').pop()?.replace(/\.[^.]+$/, '');
        if (existingFileName === importedFileName) {
          return existingFile;
        }
      }

      return resolvedPath;
    }

    return null;
  }

  // Find routes that are not called by any HTTP client
  getUnusedRoutes(): RouteDefinition[] {
    const unused: RouteDefinition[] = [];

    for (const [routeId, route] of this.routesMap.entries()) {
      const isCalled = this.isRouteCalled(route);
      if (!isCalled) {
        unused.push(route);
      }
    }

    return unused;
  }

  private isRouteCalled(route: RouteDefinition): boolean {
    // Check if any HTTP call matches this route
    for (const [_file, calls] of this.httpCallsMap.entries()) {
      for (const call of calls) {
        if (this.routeMatchesCall(route, call)) {
          return true;
        }
      }
    }
    return false;
  }

  private routeMatchesCall(route: RouteDefinition, call: HttpCall): boolean {
    const normalizedRoutePath = this.normalizePath(route.path);
    const normalizedCallUrl = this.normalizePath(call.url);

    if (normalizedRoutePath === normalizedCallUrl) {
      return true;
    }

    if (this.pathsMatch(normalizedRoutePath, normalizedCallUrl)) {
      return true;
    }

    const routeBase = this.getBasePath(normalizedRoutePath);
    const callBase = this.getBasePath(normalizedCallUrl);
    if (routeBase === callBase) {
      return true;
    }

    if (normalizedCallUrl.includes(normalizedRoutePath) || normalizedRoutePath.includes(normalizedCallUrl)) {
      return true;
    }

    const routeKey = normalizedRoutePath.replace(/^\//, '');
    const callKey = normalizedCallUrl.replace(/^\//, '');
    if (routeKey === callKey) {
      return true;
    }

    return false;
  }

  private getBasePath(path: string): string {
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 2) return path;
    return parts.slice(1).join('/');
  }

  private normalizePath(path: string): string {
    let normalized = path
      .replace(/:\w+/g, ':id')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replace(/\$\{[\w]+\}/g, ':id')
      .toLowerCase()
      .replace(/\/$/, '')
      .replace(/\/+/g, '/');

    normalized = normalized.replace(/^\/api\/?/, '/');

    return normalized;
  }

  private pathsMatch(routePath: string, callUrl: string): boolean {
    const routeParts = routePath.split('/').filter(Boolean);
    const callParts = callUrl.split('/').filter(Boolean);

    if (routeParts.length !== callParts.length) return false;

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const callPart = callParts[i];

      if (!routePart.startsWith(':') && routePart !== callPart) {
        return false;
      }
    }

    return true;
  }

  // Find exports that are not imported anywhere
  getUnusedExports(): Map<string, ExportInfo[]> {
    const unused = new Map<string, ExportInfo[]>();

    for (const [file, exports] of this.exportsMap.entries()) {
      const unusedInFile: ExportInfo[] = [];

      for (const [name, exp] of exports.entries()) {
        if (!this.isExportImported(file, name)) {
          unusedInFile.push(exp);
        }
      }

      if (unusedInFile.length > 0) {
        unused.set(file, unusedInFile);
      }
    }

    return unused;
  }

  private isExportImported(exportFile: string, exportName: string): boolean {
    const normalizedExportFile = exportFile.replace(/\\/g, '/');
    const exportFileName = normalizedExportFile.split('/').pop() || '';
    const exportFileWithoutExt = exportFileName.replace(/\.[^.]+$/, '');
    const exportDir = normalizedExportFile.substring(0, normalizedExportFile.lastIndexOf('/'));

    for (const [importerFile, imports] of this.importsMap.entries()) {
      if (importerFile === exportFile) continue;

      for (const imp of imports) {
        const resolvedPath = this.resolveImportPath(imp.source, importerFile);

        if (resolvedPath) {
          const normalizedResolved = resolvedPath.replace(/\\/g, '/');
          const resolvedFileName = normalizedResolved.split('/').pop() || '';
          const resolvedWithoutExt = resolvedFileName.replace(/\.[^.]+$/, '');
          const resolvedDir = normalizedResolved.substring(0, normalizedResolved.lastIndexOf('/'));

          const sameFile = normalizedResolved === normalizedExportFile ||
            resolvedFileName === exportFileName ||
            resolvedWithoutExt === exportFileWithoutExt ||
            resolvedWithoutExt === exportFileName ||
            resolvedFileName === exportFileWithoutExt;

          const sameDir = resolvedDir === exportDir ||
            resolvedDir.endsWith(exportDir) ||
            exportDir.endsWith(resolvedDir);

          if (sameFile && (sameDir || exportDir === '' || resolvedDir === '')) {
            if (imp.named.includes(exportName) || imp.default) {
              return true;
            }
          }

          if (imp.default && exportName === 'default' && sameFile) {
            return true;
          }
        }

        const sourceNormalized = imp.source.replace(/\\/g, '/');
        if (sourceNormalized.includes(exportFileWithoutExt) || sourceNormalized.includes(exportFileName)) {
          if (imp.named.includes(exportName) || imp.default) {
            return true;
          }
        }
      }
    }

    return false;
  }

  getStats() {
    return {
      totalRoutes: this.routesMap.size,
      totalExports: this.exportsMap.size,
      totalHttpCalls: Array.from(this.httpCallsMap.values()).reduce((acc, calls) => acc + calls.length, 0),
    };
  }
}
