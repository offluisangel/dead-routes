import type { HttpCall } from '../types/index.js';

export class HttpCallParser {
  parseHttpCalls(content: string, filePath: string): HttpCall[] {
    const calls: HttpCall[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
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

      const httpMatches = this.parseHttpModuleCalls(line);
      for (const match of httpMatches) {
        calls.push({
          url: match.url,
          method: match.method,
          file: filePath,
          line: index + 1,
          client: 'http',
        });
      }
    });

    return calls;
  }

  private parseFetchCalls(line: string): Array<{ url: string; method?: string }> {
    const results: Array<{ url: string; method?: string }> = [];

    const fetchWithMethodRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*\{\s*method\s*:\s*['"](\w+)['"]/g;
    let match;
    while ((match = fetchWithMethodRegex.exec(line)) !== null) {
      results.push({ url: match[1], method: match[2].toUpperCase() });
    }

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

    const methodsRegex = /(get|post|put|delete|patch|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    while ((match = methodsRegex.exec(line)) !== null) {
      if (line.includes('axios')) {
        results.push({ url: match[2], method: match[1].toUpperCase() });
      }
    }

    const configRegex = /axios\s*\(\s*\{\s*(?:method\s*:\s*['"](\w+)['"].*?)?url\s*:\s*['"`]([^'"`]+)['"`]/gi;
    while ((match = configRegex.exec(line)) !== null) {
      results.push({ url: match[2], method: match[1]?.toUpperCase() || 'GET' });
    }

    return results;
  }

  private parseKyCalls(line: string): Array<{ url: string; method?: string }> {
    const results: Array<{ url: string; method?: string }> = [];

    const methodsRegex = /ky\.(get|post|put|delete|patch|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    while ((match = methodsRegex.exec(line)) !== null) {
      results.push({ url: match[2], method: match[1].toUpperCase() });
    }

    return results;
  }

  private parseGotCalls(line: string): Array<{ url: string; method?: string }> {
    const results: Array<{ url: string; method?: string }> = [];

    const methodsRegex = /got\.(get|post|put|delete|patch|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let match;
    while ((match = methodsRegex.exec(line)) !== null) {
      results.push({ url: match[2], method: match[1].toUpperCase() });
    }

    return results;
  }

  private parseHttpModuleCalls(line: string): Array<{ url: string; method?: string }> {
    const results: Array<{ url: string; method?: string }> = [];

    if (line.includes('http.') || line.includes('https.')) {
      const methodMatches = line.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*\(\s*['"]([^'"]+)['"]/gi);
      if (methodMatches) {
        for (const m of methodMatches) {
          const methodMatch = m.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/i);
          const urlMatch = m.match(/\(['"]([^'"]+)['"]/);
          if (methodMatch && urlMatch) {
            results.push({ url: urlMatch[1], method: methodMatch[1].toUpperCase() });
          }
        }
      }
    }

    return results;
  }
}