import chalk from 'chalk';
import type { DeadIssue, AnalysisResult } from '../types/index.js';
import { getFrameworkLabel } from '../utils/frameworkDetector.js';

export class TerminalReporter {
  report(result: AnalysisResult): string {
    let output = '';

    // Header
    output += chalk.bold.cyan(`\n🔍 dead-routes v0.1.0 — scanning`);
    if (result.framework && result.framework !== 'unknown') {
      output += chalk.dim(` [${getFrameworkLabel(result.framework)}]`);
    }
    output += '\n';

    if (result.issues.length === 0) {
      output += chalk.green('✓ No dead routes or exports found!\n');
      return output;
    }

    // Group issues by type
    const deadRoutes = result.issues.filter((i) => i.type === 'dead-route');
    const unusedExports = result.issues.filter((i) => i.type === 'unused-export');
    const unusedComponents = result.issues.filter((i) => i.type === 'unused-component');

    // Dead routes section
    if (deadRoutes.length > 0) {
      output += chalk.red(`  🔴 Dead API routes (${deadRoutes.length})\n`);
      for (const issue of deadRoutes) {
        output += `     ${chalk.yellow(issue.identifier.padEnd(30))} → ${chalk.gray(
          `${issue.file}:${issue.line}`
        )}\n`;
      }
      output += '\n';
    }

    // Unused exports section
    if (unusedExports.length > 0) {
      output += chalk.yellow(`  🟡 Unused exports (${unusedExports.length})\n`);
      for (const issue of unusedExports) {
        output += `     ${chalk.gray(issue.identifier.padEnd(30))} → ${chalk.gray(
          `${issue.file}:${issue.line}`
        )}\n`;
      }
      output += '\n';
    }

    // Unused components section
    if (unusedComponents.length > 0) {
      output += chalk.yellow(`  🟡 Unused components (${unusedComponents.length})\n`);
      for (const issue of unusedComponents) {
        output += `     ${chalk.gray(issue.identifier.padEnd(30))} → ${chalk.gray(
          `${issue.file}:${issue.line}`
        )}\n`;
      }
      output += '\n';
    }

    // Summary
    const criticalCount = result.issues.filter((i) => i.severity === 'critical').length;
    const warningCount = result.issues.filter((i) => i.severity === 'warning').length;

    output += chalk.gray('──────────────────────────────────\n');
    output += chalk.white(
      `${result.issues.length} issues found  •  ${criticalCount} critical  •  ⏱️  ${result.duration}ms\n`
    );

    return output;
  }
}
