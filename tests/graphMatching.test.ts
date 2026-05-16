import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyGraph } from '../src/graph/dependencyGraph';
import { ExpressAdapter } from '../src/adapters/expressAdapter';
import { HttpCallParser } from '../src/parsers/httpCallParser';
import { fs } from 'fs';
import { resolve } from 'path';

describe('DependencyGraph - Route Matching', () => {
  let graph: DependencyGraph;
  let adapter: ExpressAdapter;
  let httpParser: HttpCallParser;

  beforeEach(() => {
    graph = new DependencyGraph();
    adapter = new ExpressAdapter();
    httpParser = new HttpCallParser();
  });

  it('should correctly match routes with HTTP calls', () => {
    // Add routes
    graph.addRoute({
      path: '/api/users',
      method: 'GET',
      framework: 'express',
      file: 'server.ts',
      line: 10,
    });

    graph.addRoute({
      path: '/api/legacy',
      method: 'GET',
      framework: 'express',
      file: 'server.ts',
      line: 20,
    });

    // Add HTTP calls
    graph.addHttpCall({
      url: '/api/users',
      method: 'GET',
      file: 'client.ts',
      line: 5,
      client: 'fetch',
    });

    // Check unused routes
    const unused = graph.getUnusedRoutes();
    
    expect(unused.length).toBe(1);
    expect(unused[0].path).toBe('/api/legacy');
  });

  it('should work with real fixture files', async () => {
    const readFileSync = require('fs').readFileSync;
    
    const serverContent = readFileSync(resolve('./tests/fixtures/mixed-project/server.ts'), 'utf-8');
    const clientContent = readFileSync(resolve('./tests/fixtures/mixed-project/client.ts'), 'utf-8');

    // Parse routes
    const routes = adapter.parseRoutes(serverContent, 'server.ts');
    console.log('Routes parsed:', routes.map(r => `${r.method} ${r.path}`));

    for (const route of routes) {
      graph.addRoute(route);
    }

    // Parse HTTP calls
    const calls = httpParser.parseHttpCalls(clientContent, 'client.ts');
    console.log('HTTP calls parsed:', calls.map(c => `${c.method} ${c.url}`));

    for (const call of calls) {
      graph.addHttpCall(call);
    }

    // Check unused routes
    const unused = graph.getUnusedRoutes();
    console.log('Unused routes:', unused.map(r => `${r.method} ${r.path}`));

    expect(routes.length).toBeGreaterThan(0);
    expect(calls.length).toBeGreaterThan(0);
    expect(unused.length).toBeGreaterThan(0);
  });
});
