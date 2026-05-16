import type { RouteDefinition } from '../types/index.js';
import type { FrameworkAdapter } from '../parsers/routeParser.js';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];

export class FastifyAdapter implements FrameworkAdapter {
  name: 'fastify' = 'fastify';

  detect(content: string): boolean {
    return (
      content.includes('fastify') &&
      (content.includes('fastify.get') || content.includes('fastify.post') || content.includes('fastify.route'))
    );
  }

  parseRoutes(content: string, filePath: string): RouteDefinition[] {
    const routes: RouteDefinition[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Match fastify.get(), fastify.post(), etc.
      for (const method of HTTP_METHODS) {
        const regex = new RegExp(`fastify\\.${method}\\(['"]([^'"]+)['"]`, 'g');
        
        let match;
        while ((match = regex.exec(line)) !== null) {
          routes.push({
            path: match[1],
            method: method.toUpperCase(),
            framework: 'fastify',
            file: filePath,
            line: index + 1,
          });
        }
      }

      // Match fastify.route()
      const routeMatch = line.match(/fastify\.route\(\s*\{/);
      if (routeMatch) {
        // Look ahead for method and url
        let routeConfig = '';
        for (let i = index; i < Math.min(index + 5, lines.length); i++) {
          routeConfig += lines[i];
        }

        const methodMatch = routeConfig.match(/method\s*:\s*['"]([^'"]+)['"]/);
        const urlMatch = routeConfig.match(/url\s*:\s*['"]([^'"]+)['"]/);

        if (methodMatch && urlMatch) {
          routes.push({
            path: urlMatch[1],
            method: methodMatch[1].toUpperCase(),
            framework: 'fastify',
            file: filePath,
            line: index + 1,
          });
        }
      }
    });

    return routes;
  }
}
