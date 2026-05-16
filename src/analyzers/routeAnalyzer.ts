import type { RouteDefinition, DeadIssue } from '../types/index.js';
import { DependencyGraph } from '../graph/dependencyGraph.js';

export class RouteAnalyzer {
  analyze(graph: DependencyGraph): DeadIssue[] {
    const issues: DeadIssue[] = [];
    const unusedRoutes = graph.getUnusedRoutes();

    for (const route of unusedRoutes) {
      issues.push({
        type: 'dead-route',
        identifier: `${route.method} ${route.path}`,
        file: route.file,
        line: route.line,
        confidence: 'high',
        reason: `Route defined but never called by any HTTP client in the codebase`,
        severity: 'critical',
      });
    }

    return issues;
  }
}
