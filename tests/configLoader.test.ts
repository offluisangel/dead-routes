import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigLoader } from '../src/utils/configLoader';
import { resolve } from 'path';

describe('ConfigLoader', () => {
  let loader: ConfigLoader;

  beforeEach(() => {
    loader = new ConfigLoader();
  });

  it('should load default config when no file exists', async () => {
    const config = await loader.loadConfig('./tests/fixtures/express');

    expect(config).toBeDefined();
    expect(config.confidence).toBeDefined();
    expect(config.ignore).toBeDefined();
  });

  it('should have expected defaults', async () => {
    const config = await loader.loadConfig('./tests/fixtures/nextjs');

    expect(config.confidence).toBe('medium');
    expect(Array.isArray(config.ignore)).toBe(true);
  });
});
