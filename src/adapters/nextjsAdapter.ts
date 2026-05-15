import type { RouteDefinition } from '../types/index.js';
import type { FrameworkAdapter } from '../parsers/routeParser.js';

export class NextjsAdapter implements FrameworkAdapter {
  name: 'nextjs' = 'nextjs';

  detect(content: string): boolean {
    // Detect Next.js route handlers
    return (
      content.includes('export async function GET') ||
      content.includes('export async function POST') ||
      content.includes('export async function PUT') ||
      content.includes('export async function DELETE') ||
      content.includes('export async function PATCH')
    );
  }

  parseRoutes(content: string, filePath: string): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    // Next.js API routes: app/api/users/route.ts
    if (filePath.includes('/api/') && filePath.includes('route.ts')) {
      const path = this.extractPathFromFilePath(filePath);
      const methods = this.extractHttpMethods(content);

      for (const method of methods) {
        routes.push({
          path,
          method,
          framework: 'nextjs',
          file: filePath,
          line: 1, // Would need more parsing for exact line
        });
      }
    }

    return routes;
  }

  private extractPathFromFilePath(filePath: string): string {
    // Convert app/api/users/route.ts -> /api/users
    const match = filePath.match(/app\/(.+?)\/route\.ts$/);
    if (match) {
      const path = match[1].replace(/\[([^\]]+)\]/g, ':$1');
      return '/' + path;
    }
    return '/api/unknown';
  }

  private extractHttpMethods(content: string): string[] {
    const methods: string[] = [];
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

    for (const method of httpMethods) {
      if (content.includes(`export async function ${method}`)) {
        methods.push(method);
      }
    }

    return methods;
  }
}
