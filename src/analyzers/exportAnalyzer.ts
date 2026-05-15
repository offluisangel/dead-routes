import type { DeadIssue } from '../types/index.js';
import { DependencyGraph } from '../graph/dependencyGraph.js';

export class ExportAnalyzer {
  analyze(graph: DependencyGraph): DeadIssue[] {
    const issues: DeadIssue[] = [];
    const unusedExports = graph.getUnusedExports();

    for (const [file, exports] of unusedExports.entries()) {
      for (const exp of exports) {
        // Skip index files and barrel exports (often intentional)
        if (file.endsWith('index.ts') || file.endsWith('index.tsx')) {
          continue;
        }

        issues.push({
          type: 'unused-export',
          identifier: exp.name,
          file,
          line: exp.line,
          confidence: 'medium', // Medium confidence because sometimes exports are intentional
          reason: `Export '${exp.name}' is never imported in the codebase`,
          severity: 'warning',
        });
      }
    }

    return issues;
  }
}
