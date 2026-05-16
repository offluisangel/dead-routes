import { describe, it, expect } from 'vitest';
import { DeadRoutesEngine } from '../src/utils/engine';
import { resolve } from 'path';

describe('Integration Tests - Real World Scenarios', () => {
  describe('Express Project', () => {
    it('should correctly identify USED exports (no false positives)', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/express');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const usedExports = ['formatCurrency'];
      const unusedExportNames = unusedExports.map((e) => e.identifier);

      for (const used of usedExports) {
        expect(unusedExportNames).not.toContain(used);
      }
    });

    it('should correctly identify UNUSED exports', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/express');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const expectedUnused = ['calculateTax', 'validateEmail'];
      const unusedExportNames = unusedExports.map((e) => e.identifier);

      for (const unused of expectedUnused) {
        expect(unusedExportNames).toContain(unused);
      }
    });

    it('should detect routes that ARE called via HTTP', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/express');

      const result = await engine.analyze(fixturePath);
      const deadRoutes = result.issues.filter((i) => i.type === 'dead-route');

      const calledRoutes = ['GET /api/users', 'POST /api/users'];
      const deadRoutePaths = deadRoutes.map((r) => r.identifier);

      for (const called of calledRoutes) {
        expect(deadRoutePaths).not.toContain(called);
      }
    });

    it('should detect routes that are NOT called (dead routes)', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/express');

      const result = await engine.analyze(fixturePath);
      const deadRoutes = result.issues.filter((i) => i.type === 'dead-route');

      const expectedDead = ['GET /api/v1/export', 'PUT /api/settings/theme'];
      const deadRoutePaths = deadRoutes.map((r) => r.identifier);

      for (const dead of expectedDead) {
        expect(deadRoutePaths).toContain(dead);
      }
    });
  });

  describe('Next.js App Router', () => {
    it('should NOT report page.tsx as unused export', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/nextjs-app-router');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const pageExports = unusedExports.filter((e) => e.file.includes('page.tsx'));
      expect(pageExports.length).toBe(0);
    });

    it('should NOT report layout.tsx as unused export', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/nextjs-app-router');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const layoutExports = unusedExports.filter((e) => e.file.includes('layout.tsx'));
      expect(layoutExports.length).toBe(0);
    });

    it('should NOT report route.ts (API) as unused - these are implicit', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/nextjs-app-router');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const routeExports = unusedExports.filter((e) => e.file.includes('route.ts'));
      expect(routeExports.length).toBe(0);
    });

    it('should detect actually unused exports in lib/utils.ts', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/nextjs-app-router');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const utilsExports = unusedExports.filter((e) => e.file.includes('lib/utils.ts') || e.file.includes('lib\\utils.ts'));
      const exportNames = utilsExports.map((e) => e.identifier);

      expect(exportNames).toContain('calculateDiscount');
      expect(exportNames).toContain('formatDate');
      expect(exportNames).not.toContain('formatCurrency');
      expect(exportNames).not.toContain('validateEmail');
    });
  });

  describe('Next.js Pages Router API', () => {
    it('should correctly identify called vs uncalled API routes', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/nextjs');

      const result = await engine.analyze(fixturePath);
      const deadRoutes = result.issues.filter((i) => i.type === 'dead-route');

      expect(deadRoutes.length).toBeGreaterThan(0);
      const deadRoutePaths = deadRoutes.map((r) => r.identifier);
      expect(deadRoutePaths).toContain('DELETE /admin');
    });
  });

  describe('Path Aliases (@/lib/*)', () => {
    it('should detect imports using path aliases (no false positives)', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/path-aliases');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const libExports = unusedExports.filter((e) => e.file.includes('lib/utils.ts'));
      const exportNames = libExports.map((e) => e.identifier);

      expect(exportNames).not.toContain('formatPrice');
      expect(exportNames).not.toContain('calculateTax');
      expect(exportNames).not.toContain('validateInput');
    });

    it('should detect imports via index.ts (barrel exports)', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/path-aliases');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const indexExports = unusedExports.filter((e) => e.file.includes('lib/index.ts'));
      expect(indexExports.length).toBe(0);
    });
  });

  describe('Framework Detection', () => {
    it('should detect Next.js framework', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/nextjs-app-router');

      const result = await engine.analyze(fixturePath);
      expect(result.framework).toBe('nextjs');
    });

    it('should detect Express framework', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/express');

      const result = await engine.analyze(fixturePath);
      expect(result.framework).toBe('express');
    });

    it('should detect Fastify framework', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/fastify');

      const result = await engine.analyze(fixturePath);
      expect(result.framework).toBe('fastify');
    });
  });

  describe('Edge Cases', () => {
    it('should ignore index.ts files (barrel exports are intentional)', async () => {
      const engine = new DeadRoutesEngine();
      const fixturePath = resolve('./tests/fixtures/path-aliases');

      const result = await engine.analyze(fixturePath);
      const unusedExports = result.issues.filter((i) => i.type === 'unused-export');

      const indexExports = unusedExports.filter((e) => e.file.includes('index.ts'));
      expect(indexExports.length).toBe(0);
    });
  });
});