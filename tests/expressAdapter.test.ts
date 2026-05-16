import { describe, it, expect, beforeEach } from 'vitest';
import { ExpressAdapter } from '../src/adapters/expressAdapter';

describe('ExpressAdapter Parsing', () => {
  let adapter: ExpressAdapter;

  beforeEach(() => {
    adapter = new ExpressAdapter();
  });

  it('should detect express content', () => {
    const content = `import express from 'express';
const app = express();
app.get('/api/users', handler);`;

    const canDetect = adapter.detect(content);
    expect(canDetect).toBe(true);
  });

  it('should parse routes correctly', () => {
    const content = `import express from 'express';
const app = express();
app.get('/api/users', handler);
app.post('/api/users', handler);
app.get('/api/legacy', handler);`;

    const routes = adapter.parseRoutes(content, 'server.ts');
    
    expect(routes.length).toBeGreaterThan(0);
    expect(routes.some(r => r.path === '/api/users' && r.method === 'GET')).toBe(true);
    expect(routes.some(r => r.path === '/api/users' && r.method === 'POST')).toBe(true);
    expect(routes.some(r => r.path === '/api/legacy' && r.method === 'GET')).toBe(true);
  });

  it('should parse actual fixture file', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve('./tests/fixtures/mixed-project/server.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    const canDetect = adapter.detect(content);
    expect(canDetect).toBe(true);

    const routes = adapter.parseRoutes(content, 'server.ts');
    expect(routes.length).toBeGreaterThan(0);
    
    console.log('Routes found:', routes.map(r => `${r.method} ${r.path}`));
  });
});
