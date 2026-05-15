import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import type { DeadRoutesConfig } from '../types/index.js';

export class ConfigLoader {
  async loadConfig(projectPath: string): Promise<DeadRoutesConfig> {
    const configPath = resolve(projectPath, '.deadroutesrc.json');
    let config: DeadRoutesConfig = {
      ignore: [],
      confidence: 'medium',
    };

    if (existsSync(configPath)) {
      try {
        const fileContent = readFileSync(configPath, 'utf-8');
        const userConfig = JSON.parse(fileContent);
        config = { ...config, ...userConfig };
      } catch (error) {
        console.warn(`Failed to parse .deadroutesrc.json: ${error}`);
      }
    }

    // Load from environment variables if not set in config
    if (!config.confidence && process.env.DEAD_ROUTES_CONFIDENCE) {
      config.confidence = process.env.DEAD_ROUTES_CONFIDENCE as any;
    }

    if (!config.ignore && process.env.DEAD_ROUTES_IGNORE) {
      config.ignore = process.env.DEAD_ROUTES_IGNORE.split(',');
    }

    if (!config.frameworks && process.env.DEAD_ROUTES_FRAMEWORKS) {
      config.frameworks = process.env.DEAD_ROUTES_FRAMEWORKS.split(',') as any;
    }

    return config;
  }
}
