import type { RouteDefinition } from '../types/index.js';
import type { FrameworkAdapter } from '../parsers/routeParser.js';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];

export class ExpressAdapter implements FrameworkAdapter {
  name: 'express' = 'express';

  detect(content: string): boolean {
    return content.includes('express') || content.includes('app.get') || content.includes('app.post');
  }

  parseRoutes(content: string, filePath: string): RouteDefinition[] {
    const routes: RouteDefinition[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Match app.get(), app.post(), etc.
      for (const method of HTTP_METHODS) {
        const regex = new RegExp(
          `(?:app|router)\\.${method}\\(['"]([^'"]+)['"]`,
          'g'
        );
        
        let match;
        while ((match = regex.exec(line)) !== null) {
          routes.push({
            path: match[1],
            method: method.toUpperCase(),
            framework: 'express',
            file: filePath,
            line: index + 1,
          });
        }
      }

      // Match app.route()
      const routeMatch = line.match(/app\.route\(['"]([^'"]+)['"]\)/);
      if (routeMatch) {
        // Look ahead for methods on this route
        for (let i = index + 1; i < Math.min(index + 10, lines.length); i++) {
          for (const method of HTTP_METHODS) {
            if (lines[i].includes(`.${method}(`)) {
              routes.push({
                path: routeMatch[1],
                method: method.toUpperCase(),
                framework: 'express',
                file: filePath,
                line: i + 1,
              });
            }
          }
          if (lines[i].includes(');')) break;
        }
      }
    });

    return routes;
  }
}
