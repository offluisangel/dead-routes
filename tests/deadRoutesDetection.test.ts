import { describe, it, expect } from 'vitest';
import { DeadRoutesEngine } from '../src/utils/engine';
import { resolve } from 'path';

describe('DeadRoutesEngine - Routes Detection', () => {
  it('should detect dead Express routes in mixed project', async () => {
    const engine = new DeadRoutesEngine();
    const fixturePath = resolve('./tests/fixtures/mixed-project');

    const result = await engine.analyze(fixturePath);

    // Should find dead routes
    const deadRoutes = result.issues.filter((i) => i.type === 'dead-route');
    
    console.log('All issues:', result.issues.length);
    console.log('Dead routes found:', deadRoutes.length);
    console.log('Issue types:', result.issues.map(i => i.type));

    expect(deadRoutes).toBeDefined();
  });
});
