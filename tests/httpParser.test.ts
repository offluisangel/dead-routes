import { describe, it, expect, beforeEach } from 'vitest';
import { HttpCallParser } from '../src/parsers/httpCallParser';

describe('HttpCallParser', () => {
  let parser: HttpCallParser;

  beforeEach(() => {
    parser = new HttpCallParser();
  });

  describe('fetch calls', () => {
    it('should detect fetch GET calls', () => {
      const code = `fetch('/api/users')`;
      const calls = parser.parseHttpCalls(code, 'client.ts');

      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe('/api/users');
      expect(calls[0].method).toBe('GET');
      expect(calls[0].client).toBe('fetch');
    });

    it('should detect fetch with method option', () => {
      const code = `fetch('/api/users', { method: 'POST' })`;
      const calls = parser.parseHttpCalls(code, 'client.ts');

      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe('/api/users');
      expect(calls[0].method).toBe('POST');
    });
  });

  describe('axios calls', () => {
    it('should detect axios.get', () => {
      const code = `axios.get('/api/data')`;
      const calls = parser.parseHttpCalls(code, 'client.ts');

      expect(calls.length).toBeGreaterThan(0);
      const getCall = calls.find((c) => c.client === 'axios');
      expect(getCall).toBeDefined();
    });

    it('should detect axios.post', () => {
      const code = `axios.post('/api/data', payload)`;
      const calls = parser.parseHttpCalls(code, 'client.ts');

      expect(calls.length).toBeGreaterThan(0);
    });
  });

  describe('ky calls', () => {
    it('should detect ky.get', () => {
      const code = `ky.get('/api/items')`;
      const calls = parser.parseHttpCalls(code, 'client.ts');

      expect(calls.length).toBeGreaterThan(0);
      const kyCall = calls.find((c) => c.client === 'ky');
      expect(kyCall).toBeDefined();
    });
  });
});
