const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawn } = require('node:child_process');

function parseEnvFile(filePath) {
  const contents = readFileSync(filePath, 'utf8');
  const parsed = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

const [, , envFile, command, ...args] = process.argv;

if (!envFile || !command) {
  console.error(
    'Usage: node scripts/run-with-env.cjs <env-file> <command> [...args]',
  );
  process.exit(1);
}

const envFilePath = resolve(process.cwd(), envFile);

if (!existsSync(envFilePath)) {
  console.error(`Env file not found: ${envFilePath}`);
  process.exit(1);
}

const env = {
  ...process.env,
  ...parseEnvFile(envFilePath),
};

const child = spawn(command, args, {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
