import type { Framework } from '../types/index.js';

export function detectFramework(filePath: string, content: string): Framework {
  // Next.js detection
  if (filePath.includes('pages/api/') || filePath.includes('app/') && filePath.includes('route.ts')) {
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
