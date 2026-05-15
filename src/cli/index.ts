#!/usr/bin/env node

import { Command } from 'commander';
import { resolve } from 'path';
import { DeadRoutesEngine } from '../utils/engine.js';
import { TerminalReporter } from '../reporters/terminalReporter.js';
import { JsonReporter } from '../reporters/jsonReporter.js';
import { ConfigLoader } from '../utils/configLoader.js';
import type { DeadRoutesConfig } from '../types/index.js';

const program = new Command();

program
  .name('dead-routes')
  .description('Find dead routes, components, and exports in your codebase')
  .version('0.1.0')
  .argument('[path]', 'Project path to scan', '.')
  .option('--ignore <patterns...>', 'Ignore patterns (glob)')
  .option('--confidence <level>', 'Minimum confidence level: high, medium, low', 'medium')
  .option('--json', 'Output as JSON')
  .option('--fix', 'Show removal suggestions')
  .option('--watch', 'Watch mode (re-scan on file changes)')
  .action(async (projectPath: string, options) => {
    const resolvedPath = resolve(projectPath);
    const configLoader = new ConfigLoader();

    // Load configuration from file and env
    const fileConfig = await configLoader.loadConfig(resolvedPath);

    // CLI options override file config
    const config: DeadRoutesConfig = {
      ...fileConfig,
      ignore: options.ignore || fileConfig.ignore,
      confidence: options.confidence || fileConfig.confidence,
      json: options.json || fileConfig.json,
      fix: options.fix || fileConfig.fix,
      watch: options.watch || fileConfig.watch,
    };

    const engine = new DeadRoutesEngine();

    try {
      const result = await engine.analyze(resolvedPath, config);

      // Output report
      if (options.json) {
        const reporter = new JsonReporter();
        console.log(reporter.report(result));
      } else {
        const reporter = new TerminalReporter();
        console.log(reporter.report(result));
      }

      // Exit with non-zero if issues found
      process.exit(result.issues.length > 0 ? 1 : 0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
