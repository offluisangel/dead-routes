import type { HttpCall } from '../types/index.js';

export class HttpCallParser {
  parseHttpCalls(content: string, filePath: string): HttpCall[] {
    const calls: HttpCall[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Detect fetch calls
      const fetchMatches = this.parseFetchCalls(line);
      for (const match of fetchMatches) {
        calls.push({
          url: match.url,
          method: match.method,
          file: filePath,
          line: index + 1,
          client: 'fetch',
        });
      }

      // Detect axios calls
      const axiosMatches = this.parseAxiosCalls(line);
      for (const match of axiosMatches) {
        calls.push({
          url: match.url,
          method: match.method,
          file: filePath,
          line: index + 1,
          client: 'axios',
        });
      }

      // Detect ky calls
      const kyMatches = this.parseKyCalls(line);
      for (const match of kyMatches) {
        calls.push({
          url: match.url,
          method: match.method,
          file: filePath,
          line: index + 1,
          client: 'ky',
        });
      }

      // Detect got calls
      const gotMatches = this.parseGotCalls(line);
      for (const match of gotMatches) {
        calls.push({
          url: match.url,
          method: match.method,
          file: filePath,
          line: index + 1,
          client: 'got',
        });
      }
    });

    return calls;
  }

  private parseFetchCalls(line: string): Array<{ url: string; method?: string }> {
    const results: Array<{ url: string; method?: string }> = [];

    // fetch('/api/users', { method: 'POST' }) - check this first
    const fetchWithMethodRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{\s*method\s*:\s*['"](\w+)['"]/g;
    let match;
    while ((match = fetchWithMethodRegex.exec(line)) !== null) {
      results.push({ url: match[1], method: match[2].toUpperCase() });
    }

    // Only check for simple fetch if no method-based fetch was found
    if (results.length === 0) {
      const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
      while ((match = fetchRegex.exec(line)) !== null) {
        results.push({ url: match[1], method: 'GET' });
      }
    }

    return results;
  }

  private parseAxiosCalls(line: string): Array<{ url: string; method?: string }> {
    const results: Array<{ url: string; method?: string }> = [];

    // axios.get('/api/users')
    const methodsRegex = /(get|post|put|delete|patch|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    while ((match = methodsRegex.exec(line)) !== null) {
      if (line.includes('axios')) {
        results.push({ url: match[2], method: match[1].toUpperCase() });
      }
    }

    // axios({ method: 'GET', url: '/api/users' })
    const configRegex = /axios\s*\(\s*\{\s*(?:method\s*:\s*['"](\w+)['"].*?)?url\s*:\s*['"`]([^'"`]+)['"`]/gi;
    while ((match = configRegex.exec(line)) !== null) {
      results.push({ url: match[2], method: match[1]?.toUpperCase() || 'GET' });
    }

    return results;
  }

  private parseKyCalls(line: string): Array<{ url: string; method?: string }> {
    const results: Array<{ url: string; method?: string }> = [];

    // ky.get('/api/users')
    const methodsRegex = /ky\.(get|post|put|delete|patch|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    while ((match = methodsRegex.exec(line)) !== null) {
      results.push({ url: match[2], method: match[1].toUpperCase() });
    }

    return results;
  }

  private parseGotCalls(line: string): Array<{ url: string; method?: string }> {
    const results: Array<{ url: string; method?: string }> = [];

    // got.get('/api/users')
    const methodsRegex = /got\.(get|post|put|delete|patch|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    while ((match = methodsRegex.exec(line)) !== null) {
      results.push({ url: match[2], method: match[1].toUpperCase() });
    }

    return results;
  }
}
