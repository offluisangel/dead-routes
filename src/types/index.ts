export type Framework = 'express' | 'fastify' | 'nextjs' | 'remix' | 'hono' | 'unknown';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type IssueType = 'dead-route' | 'unused-export' | 'unused-component' | 'unused-dependency' | 'orphan-env';

export interface ScannedFile {
  path: string;
  type: 'ts' | 'tsx' | 'js' | 'jsx' | 'json' | 'env';
  framework?: Framework;
  content: string;
  lastModified: Date;
}

export interface ImportInfo {
  source: string; // e.g., './utils', '@/lib', 'react'
  named: string[]; // exported names being imported
  default?: boolean;
  namespace?: string; // e.g., * as name
}

export interface ExportInfo {
  name: string;
  type: 'named' | 'default';
  line: number;
}

export interface RouteDefinition {
  path: string;
  method: string; // GET, POST, PUT, DELETE, etc.
  framework: Framework;
  file: string;
  line: number;
  handler?: string; // function name or identifier
}

export interface HttpCall {
  url: string;
  method?: string;
  file: string;
  line: number;
  client: 'fetch' | 'axios' | 'ky' | 'got' | 'http' | 'https' | 'other';
}

export interface DeadIssue {
  type: IssueType;
  identifier: string;
  file: string;
  line: number;
  confidence: ConfidenceLevel;
  reason: string;
  lastModified?: Date;
  severity: 'critical' | 'warning';
}

export interface AnalysisResult {
  issues: DeadIssue[];
  totalFiles: number;
  framework: Framework;
  duration: number; // ms
}

export interface DeadRoutesConfig {
  ignore?: string[];
  frameworks?: Framework[];
  confidence?: ConfidenceLevel;
  customParsers?: string[];
  watch?: boolean;
  json?: boolean;
  fix?: boolean;
}
