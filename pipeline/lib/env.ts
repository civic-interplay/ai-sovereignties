// Loads secrets without ever putting them in the repo or in git history.
//
// Order of precedence:
//   1. ~/.config/contestation/*.env  (local secrets, chmod 600, outside any repo)
//   2. process.env                   (how GitHub Actions / Cloudflare inject secrets)
//
// The config file wins so a stray NOTION_TOKEN exported in the shell profile
// (e.g. the map app's own integration) can't shadow the pipeline's token. In
// CI the file does not exist, so process.env / GitHub secrets are used.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function readEnvFile(path: string): Record<string, string> {
  try {
    const out: Record<string, string> = {};
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return out;
  } catch {
    return {};
  }
}

const configDir = join(homedir(), '.config', 'contestation');

function fromFiles(key: string): string | undefined {
  return (
    readEnvFile(join(configDir, '.env'))[key] ??
    readEnvFile(join(configDir, 'anthropic.env'))[key]
  );
}

export function requireEnv(key: string): string {
  const v = fromFiles(key) ?? process.env[key];
  if (!v) {
    throw new Error(
      `Missing ${key}. Set it in the environment or in ~/.config/contestation/*.env`,
    );
  }
  return v;
}

export function optionalEnv(key: string): string | undefined {
  return fromFiles(key) ?? process.env[key];
}
