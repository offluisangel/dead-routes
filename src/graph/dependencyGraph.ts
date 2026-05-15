import type { RouteDefinition, HttpCall, ImportInfo, ExportInfo } from '../types/index.js';

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
    // Normalize paths for comparison
    const normalizedRoutePath = this.normalizePath(route.path);
    const normalizedCallUrl = this.normalizePath(call.url);

    // Check if the call matches the route path (with param consideration)
    return (
      normalizedRoutePath === normalizedCallUrl ||
      this.pathsMatch(normalizedRoutePath, normalizedCallUrl)
    );
  }

  private normalizePath(path: string): string {
    return path
      .replace(/:\w+/g, ':id') // Normalize params like :userId -> :id
      .replace(/\[([^\]]+)\]/g, ':$1') // Normalize [id] -> :id
      .replace(/\$\{[\w]+\}/g, ':id') // Normalize ${id} -> :id (template literals)
      .toLowerCase()
      .replace(/\/$/, ''); // Remove trailing slash
  }

  private pathsMatch(routePath: string, callUrl: string): boolean {
    const routeParts = routePath.split('/').filter(Boolean);
    const callParts = callUrl.split('/').filter(Boolean);

    if (routeParts.length !== callParts.length) return false;

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const callPart = callParts[i];

      // Skip param matching for now (simplified)
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
    // Check if this export is imported anywhere
    for (const [file, imports] of this.importsMap.entries()) {
      if (file === exportFile) continue; // Skip self

      for (const imp of imports) {
        // Check if this import references the export
        if (imp.source.includes(exportFile) || imp.source === `./${exportFile}`) {
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
