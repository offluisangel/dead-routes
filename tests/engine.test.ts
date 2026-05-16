import { describe, it, expect } from 'vitest';
import { DeadRoutesEngine } from '../src/utils/engine';
import { resolve } from 'path';

describe('DeadRoutesEngine', () => {
  it('should analyze Express fixture project', async () => {
    const engine = new DeadRoutesEngine();
    const fixturePath = resolve('./tests/fixtures/express');

    const result = await engine.analyze(fixturePath);

    expect(result).toBeDefined();
    expect(result.issues).toBeDefined();
    expect(result.issues).toBeInstanceOf(Array);
    expect(result.totalFiles).toBeGreaterThan(0);
    expect(result.duration).toBeGreaterThan(0);
  });

  it('should detect dead routes in Express fixture', async () => {
    const engine = new DeadRoutesEngine();
    const fixturePath = resolve('./tests/fixtures/express');

    const result = await engine.analyze(fixturePath);

    // Should find dead routes
    const deadRoutes = result.issues.filter((i) => i.type === 'dead-route');
    expect(deadRoutes.length).toBeGreaterThan(0);

    // Check specific dead routes from our fixture
    const deadRoutePaths = deadRoutes.map((r) => r.identifier);
    expect(deadRoutePaths).toContain('GET /api/v1/export');
    expect(deadRoutePaths).toContain('PUT /api/settings/theme');
  });

  it('should detect unused exports', async () => {
    const engine = new DeadRoutesEngine();
    const fixturePath = resolve('./tests/fixtures/express');

    const result = await engine.analyze(fixturePath);

    // Should find unused exports
    const unusedExports = result.issues.filter((i) => i.type === 'unused-export');
    expect(unusedExports.length).toBeGreaterThan(0);
  });
});
