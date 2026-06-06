#!/usr/bin/env node
/**
 * npm wrapper — unsets Cursor/sandbox-injected npm_config_devdir (removed in npm 11+)
 * so installs and scripts run without "Unknown env config devdir" warnings.
 */
import { spawnSync } from 'node:child_process';

delete process.env.npm_config_devdir;
delete process.env.NPM_CONFIG_DEVDIR;

const args = process.argv.slice(2);
const result = spawnSync('npm', args, {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
