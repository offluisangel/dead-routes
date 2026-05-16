import { describe, it, expect, beforeEach } from 'vitest';
import { RouteParser } from '../src/parsers/routeParser';
import { ExpressAdapter } from '../src/adapters/expressAdapter';
import { NextjsAdapter } from '../src/adapters/nextjsAdapter';
import { FastifyAdapter } from '../src/adapters/fastifyAdapter';

describe('RouteParser', () => {
  let parser: RouteParser;

  beforeEach(() => {
    parser = new RouteParser();
    parser.registerAdapter(new ExpressAdapter());
    parser.registerAdapter(new NextjsAdapter());
    parser.registerAdapter(new FastifyAdapter());
  });

  describe('Express routes', () => {
    it('should parse GET routes', () => {
      const code = `app.get('/users', handler)`;
      const routes = parser.parseRoutes(code, 'server.ts', 'express');

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users');
      expect(routes[0].method).toBe('GET');
    });

    it('should parse POST routes', () => {
      const code = `app.post('/users', handler)`;
      const routes = parser.parseRoutes(code, 'server.ts', 'express');

      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('POST');
    });

    it('should parse router methods', () => {
      const code = `router.get('/books', handler)`;
      const routes = parser.parseRoutes(code, 'routes.ts', 'express');

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/books');
    });

    it('should parse route chaining', () => {
      const code = `app.route('/items')
        .get(getHandler)
        .post(postHandler)`;
      const routes = parser.parseRoutes(code, 'server.ts', 'express');

      expect(routes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Next.js routes', () => {
    it('should parse Next.js GET handler', () => {
      const code = `export async function GET(request) {
        return Response.json({});
      }`;
      const routes = parser.parseRoutes(code, 'app/api/users/route.ts', 'nextjs');

      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('GET');
    });

    it('should parse Next.js POST handler', () => {
      const code = `export async function POST(request) {
        return Response.json({});
      }`;
      const routes = parser.parseRoutes(code, 'app/api/users/route.ts', 'nextjs');

      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('POST');
    });
  });

  describe('Fastify routes', () => {
    it('should parse Fastify GET routes', () => {
      const code = `fastify.get('/users', async (req, res) => {})`;
      const routes = parser.parseRoutes(code, 'routes.ts', 'fastify');

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/users');
      expect(routes[0].method).toBe('GET');
    });

    it('should parse Fastify route config', () => {
      const code = `fastify.route({
        method: 'POST',
        url: '/users',
        handler: async (req, res) => {}
      })`;
      const routes = parser.parseRoutes(code, 'routes.ts', 'fastify');

      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('POST');
    });
  });
});
