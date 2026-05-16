import type { AnalysisResult } from '../types/index.js';

export class JsonReporter {
  report(result: AnalysisResult): string {
    return JSON.stringify(
      {
        version: '0.1.0',
        timestamp: new Date().toISOString(),
        framework: result.framework,
        duration: result.duration,
        summary: {
          total: result.issues.length,
          critical: result.issues.filter((i) => i.severity === 'critical').length,
          warning: result.issues.filter((i) => i.severity === 'warning').length,
        },
        issues: result.issues.map((issue) => ({
          type: issue.type,
          identifier: issue.identifier,
          file: issue.file,
          line: issue.line,
          confidence: issue.confidence,
          severity: issue.severity,
          reason: issue.reason,
        })),
      },
      null,
      2
    );
  }
}
