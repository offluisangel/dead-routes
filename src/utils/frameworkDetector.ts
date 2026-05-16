import type { Framework } from '../types/index.js';

const NEXTJS_APP_ROUTE_FILES = [
  'page.tsx', 'page.ts', 'page.js', 'page.jsx',
  'layout.tsx', 'layout.ts', 'layout.js', 'layout.jsx',
  'loading.tsx', 'loading.ts', 'loading.js', 'loading.jsx',
  'error.tsx', 'error.ts', 'error.js', 'error.jsx',
  'not-found.tsx', 'not-found.ts', 'not-found.js', 'not-found.jsx',
  'template.tsx', 'template.ts', 'template.js', 'template.jsx',
  'default.tsx', 'default.ts', 'default.js', 'default.jsx',
  'route.ts', 'route.js',
  'middleware.ts',
];

const NEXTJS_SPECIAL_FILES = [
  'layout.tsx', 'layout.ts', 'layout.js', 'layout.jsx',
  'template.tsx', 'template.ts', 'template.js', 'template.jsx',
  'loading.tsx', 'loading.ts', 'loading.js', 'loading.jsx',
  'error.tsx', 'error.ts', 'error.js', 'error.jsx',
  'not-found.tsx', 'not-found.ts', 'not-found.js', 'not-found.jsx',
  'default.tsx', 'default.ts', 'default.js', 'default.jsx',
  'middleware.ts',
];

export function isNextJsAppRouterFile(filePath: string): boolean {
  const fileName = filePath.split(/[/\\]/).pop() || '';
  return NEXTJS_APP_ROUTE_FILES.includes(fileName);
}

export function isNextJsSpecialExportFile(filePath: string): boolean {
  const pathParts = filePath.split(/[/\\]/);
  const fileName = (pathParts.pop() || '').toLowerCase();

  if (NEXTJS_SPECIAL_FILES.includes(fileName)) {
    return true;
  }

  if (fileName === 'route.ts' || fileName === 'route.js') {
    const hasApp = pathParts.includes('app');
    const hasApi = pathParts.includes('api');
    return hasApp && hasApi;
  }

  return false;
}

export function isNextJsPageFile(filePath: string): boolean {
  const fileName = filePath.split(/[/\\]/).pop() || '';
  return fileName === 'page.tsx' || fileName === 'page.ts' || fileName === 'page.js' || fileName === 'page.jsx';
}

export function detectFramework(filePath: string, content: string): Framework {
  const normalizedPath = filePath.split(/[/\\]/).join('/');
  const pathParts = normalizedPath.split('/');

  if (pathParts.includes('app') && pathParts.includes('page.tsx')) {
    return 'nextjs';
  }
  if (pathParts.includes('app') && pathParts.includes('layout.tsx')) {
    return 'nextjs';
  }
  if (pathParts.includes('app') && pathParts.includes('route.ts')) {
    return 'nextjs';
  }
  if (pathParts.includes('pages') || normalizedPath.includes('pages/api')) {
    return 'nextjs';
  }

  // Fastify detection
  if (content.includes('fastify') && (content.includes('fastify.get') || content.includes('fastify.post'))) {
    return 'fastify';
  }

  // Express detection
  if (content.includes('express') && (content.includes('app.get') || content.includes('app.post') || content.includes('Router'))) {
    return 'express';
  }

  // Hono detection
  if (content.includes('@hono/hono') || content.includes('new Hono()')) {
    return 'hono';
  }

  // Remix detection
  if (filePath.includes('routes/') && (content.includes('loader') || content.includes('action'))) {
    return 'remix';
  }

  return 'unknown';
}

export function getFrameworkLabel(framework: Framework): string {
  const labels: Record<Framework, string> = {
    express: 'Express.js',
    fastify: 'Fastify',
    nextjs: 'Next.js',
    remix: 'Remix',
    hono: 'Hono',
    unknown: 'Unknown',
  };
  return labels[framework];
}

export function isNextJsImplicitExport(filePath: string): boolean {
  const fileName = (filePath.split(/[/\\]/).pop() || '').toLowerCase();
  const pathParts = filePath.split(/[/\\]/);

  const isNextJsDir = pathParts.includes('app') || pathParts.includes('pages');
  if (!isNextJsDir) {
    return false;
  }

  const implicitExports = [
    'page.tsx', 'page.ts', 'page.js', 'page.jsx',
    'layout.tsx', 'layout.ts', 'layout.js', 'layout.jsx',
    'loading.tsx', 'loading.ts', 'loading.js', 'loading.jsx',
    'error.tsx', 'error.ts', 'error.js', 'error.jsx',
    'not-found.tsx', 'not-found.ts', 'not-found.js', 'not-found.jsx',
    'template.tsx', 'template.ts', 'template.js', 'template.jsx',
    'default.tsx', 'default.ts', 'default.js', 'default.jsx',
  ];

  return implicitExports.includes(fileName);
}
