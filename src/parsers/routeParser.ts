import type { RouteDefinition, Framework } from '../types/index.js';

export interface FrameworkAdapter {
  name: Framework;
  detect(content: string): boolean;
  parseRoutes(content: string, filePath: string): RouteDefinition[];
}

export class RouteParser {
  private adapters: FrameworkAdapter[] = [];

  registerAdapter(adapter: FrameworkAdapter): void {
    this.adapters.push(adapter);
  }

  parseRoutes(content: string, filePath: string, framework?: Framework): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    // If framework is specified, use that adapter
    if (framework) {
      const adapter = this.adapters.find((a) => a.name === framework);
      if (adapter) {
        return adapter.parseRoutes(content, filePath);
      }
    }

    // Otherwise, try all adapters
    for (const adapter of this.adapters) {
      if (adapter.detect(content)) {
        return adapter.parseRoutes(content, filePath);
      }
    }

    return routes;
  }

  getAllAdapters(): FrameworkAdapter[] {
    return this.adapters;
  }
}
