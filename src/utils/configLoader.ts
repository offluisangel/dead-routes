import { existsSync, readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import type { DeadRoutesConfig, PathAlias } from '../types/index.js';

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

  loadPathAliases(projectPath: string): PathAlias[] {
    const aliases: PathAlias[] = [];
    const tsconfigPaths = ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'tsconfig.build.json'];

    for (const tsconfigFile of tsconfigPaths) {
      const tsconfigPath = resolve(projectPath, tsconfigFile);
      if (existsSync(tsconfigPath)) {
        try {
          const content = readFileSync(tsconfigPath, 'utf-8');
          const tsconfig = JSON.parse(content);

          if (tsconfig.compilerOptions?.paths) {
            for (const [alias, paths] of Object.entries(tsconfig.compilerOptions.paths)) {
              const pathArray = Array.isArray(paths) ? paths : [paths];
              for (const targetPath of pathArray) {
                aliases.push({
                  alias: alias.replace(/\*$/, ''),
                  target: targetPath.replace(/\*$/, ''),
                });
              }
            }
          }

          if (tsconfig.compilerOptions?.baseUrl) {
            for (const alias of aliases) {
              if (!alias.target.startsWith('/') && !alias.target.match(/^[a-zA-Z]:/)) {
                alias.target = resolve(projectPath, tsconfig.compilerOptions.baseUrl, alias.target);
              }
            }
          }

          break;
        } catch (error) {
          // Continue to next tsconfig
        }
      }
    }

    return aliases;
  }
}
