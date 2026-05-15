import type { AnalysisResult, DeadRoutesConfig } from '../types/index.js';
import { FileScanner } from '../scanner/fileScanner.js';
import { ImportExportParser } from '../parsers/importParser.js';
import { RouteParser } from '../parsers/routeParser.js';
import { HttpCallParser } from '../parsers/httpCallParser.js';
import { DependencyGraph } from '../graph/dependencyGraph.js';
import { RouteAnalyzer } from '../analyzers/routeAnalyzer.js';
import { ExportAnalyzer } from '../analyzers/exportAnalyzer.js';
import { ExpressAdapter } from '../adapters/expressAdapter.js';
import { NextjsAdapter } from '../adapters/nextjsAdapter.js';
import { FastifyAdapter } from '../adapters/fastifyAdapter.js';

export class DeadRoutesEngine {
  private fileScanner: FileScanner;
  private importParser: ImportExportParser;
  private routeParser: RouteParser;
  private httpCallParser: HttpCallParser;

  constructor() {
    this.fileScanner = new FileScanner();
    this.importParser = new ImportExportParser();
    this.routeParser = new RouteParser();
    this.httpCallParser = new HttpCallParser();

    // Register framework adapters
    this.routeParser.registerAdapter(new ExpressAdapter());
    this.routeParser.registerAdapter(new NextjsAdapter());
    this.routeParser.registerAdapter(new FastifyAdapter());
  }

  async analyze(projectPath: string, config?: DeadRoutesConfig): Promise<AnalysisResult> {
    const startTime = Date.now();

    // Step 1: Scan files
    const files = await this.fileScanner.scan(projectPath, config?.ignore);
    const frameworks = this.fileScanner.detectFrameworks(files);
    const primaryFramework = Array.from(frameworks.values())[0] || 'unknown';

    // Step 2: Build dependency graph
    const graph = new DependencyGraph();

    for (const file of files) {
      // Skip non-code files
      if (file.type === 'json') continue;

      // Parse imports/exports
      const imports = this.importParser.parseImports(file.content, file.path);
      const exports = this.importParser.parseExports(file.content, file.path);

      for (const imp of imports) {
        graph.addImport(file.path, imp);
      }

      for (const exp of exports) {
        graph.addExport(file.path, exp);
      }

      // Parse routes (if applicable)
      const routes = this.routeParser.parseRoutes(file.content, file.path, file.framework);
      for (const route of routes) {
        graph.addRoute(route);
      }

      // Parse HTTP calls
      const httpCalls = this.httpCallParser.parseHttpCalls(file.content, file.path);
      for (const call of httpCalls) {
        graph.addHttpCall(call);
      }
    }

    // Step 3: Run analyzers
    const routeAnalyzer = new RouteAnalyzer();
    const exportAnalyzer = new ExportAnalyzer();

    const issues = [
      ...routeAnalyzer.analyze(graph),
      ...exportAnalyzer.analyze(graph),
    ];

    // Apply confidence filter if specified
    let filteredIssues = issues;
    if (config?.confidence) {
      const confidenceLevels: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const minLevel = confidenceLevels[config.confidence];
      filteredIssues = issues.filter((i) => confidenceLevels[i.confidence] >= minLevel);
    }

    const duration = Date.now() - startTime;

    return {
      issues: filteredIssues,
      totalFiles: files.length,
      framework: primaryFramework as any,
      duration,
    };
  }
}
