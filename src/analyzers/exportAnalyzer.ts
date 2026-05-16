import type { DeadIssue } from '../types/index.js';
import { DependencyGraph } from '../graph/dependencyGraph.js';
import { isNextJsImplicitExport, isNextJsSpecialExportFile, isNextJsAppRouterFile, isNextJsPageFile } from '../utils/frameworkDetector.js';

export class ExportAnalyzer {
  analyze(graph: DependencyGraph): DeadIssue[] {
    const issues: DeadIssue[] = [];
    const unusedExports = graph.getUnusedExports();

    for (const [file, exports] of unusedExports.entries()) {
      for (const exp of exports) {
        if (file.endsWith('index.ts') || file.endsWith('index.tsx') || file.endsWith('index.js') || file.endsWith('index.jsx')) {
          continue;
        }

        if (isNextJsImplicitExport(file)) {
          continue;
        }

        if (isNextJsSpecialExportFile(file)) {
          continue;
        }

        if (isNextJsAppRouterFile(file) || isNextJsPageFile(file)) {
          continue;
        }

        if (file.includes('components/ui/') || file.includes('components\\ui\\')) {
          const confidence = this.isShadcnUiComponentLikelyUsed(exp.name) ? 'medium' : 'high';
          const reason = confidence === 'high'
            ? `Export '${exp.name}' in UI library is likely unused`
            : `Export '${exp.name}' is never imported in the codebase`;

          issues.push({
            type: 'unused-export',
            identifier: exp.name,
            file,
            line: exp.line,
            confidence,
            reason,
            severity: confidence === 'high' ? 'warning' : 'warning',
          });
          continue;
        }

        issues.push({
          type: 'unused-export',
          identifier: exp.name,
          file,
          line: exp.line,
          confidence: 'medium',
          reason: `Export '${exp.name}' is never imported in the codebase`,
          severity: 'warning',
        });
      }
    }

    return issues;
  }

  private isShadcnUiComponentLikelyUsed(componentName: string): boolean {
    const commonUsedComponents = [
      'Button', 'Card', 'Input', 'Label', 'Select', 'Checkbox',
      'RadioGroup', 'Switch', 'Slider', 'Tabs', 'Dialog', 'Sheet',
      'DropdownMenu', 'Avatar', 'Badge', 'Alert', 'Toast', 'Skeleton',
    ];
    return commonUsedComponents.includes(componentName);
  }
}
