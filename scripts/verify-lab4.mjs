import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { sanitizePlaywrightReport } from './playwright-report-hygiene.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2];
if (!['prepare', 'recovery', 'server', 'client', 'lab4', 'lab3'].includes(mode)) throw new Error('Usage: node scripts/verify-lab4.mjs prepare|recovery|server|client|lab4|lab3 [--env-file path] [--output-dir path] [--pg-bin path]');
const option = name => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; };
const environmentFile = path.resolve(repository, option('--env-file') || 'server/.env');
const configured = {};
for (const line of fs.readFileSync(environmentFile, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (match) configured[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
}
const sourceUrl = configured.E2E_DATABASE_URL || process.env.E2E_DATABASE_URL || configured.DATABASE_URL || process.env.DATABASE_URL;
if (!sourceUrl) throw new Error('Configured database URL is absent');
const target = new URL(sourceUrl);
if (!['localhost', '127.0.0.1'].includes(target.hostname) || target.port !== '5433') throw new Error('Expected the established local PostgreSQL instance on port 5433');
const lab = mode === 'lab3' ? 'lab3' : 'lab4';
target.pathname = '/' + (lab === 'lab3' ? 'toktickit_lab3_e2e' : 'toktickit_lab4_e2e');
const databaseUrl = target.toString();
const password = 'Tt54!' + crypto.randomBytes(24).toString('base64url') + 'aA9';
const environment = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  E2E_DATABASE_URL: databaseUrl,
  LAB3_SEED_PASSWORD: password,
  LAB4_SEED_PASSWORD: password,
  LAB3_E2E_DATABASE: lab === 'lab3' ? 'true' : 'false',
  LAB4_E2E_DATABASE: lab === 'lab4' ? 'true' : 'false',
  LAB3_E2E_RESET_PASSWORDS: lab === 'lab3' ? 'true' : 'false',
  LAB4_E2E_RESET_PASSWORDS: lab === 'lab4' ? 'true' : 'false',
};
const secrets = [sourceUrl, databaseUrl, password, decodeURIComponent(target.password)].filter(Boolean);
const sanitize = text => secrets.reduce((result, secret) => result.split(secret).join('[REDACTED]'), text);
const evidenceDirectory = path.resolve(repository, option('--output-dir') || 'artifacts/lab-04/evidence/staging-integration');
fs.mkdirSync(evidenceDirectory, { recursive: true });
const result = {
  mode,
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
  startedAt: new Date().toISOString(),
  database: lab === 'lab3' ? 'toktickit_lab3_e2e' : 'toktickit_lab4_e2e',
  databasePort: 5433,
  steps: [],
};
async function run(label, command, args, cwd, extraEnvironment = {}) {
  console.log('START ' + label);
  const started = Date.now();
  let output = '';
  const child = spawn(command, args, { cwd, env: { ...environment, ...extraEnvironment }, windowsHide: true });
  child.stdout.on('data', data => { output += data.toString(); });
  child.stderr.on('data', data => { output += data.toString(); });
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', resolve); });
  output = sanitize(output);
  fs.writeFileSync(path.join(evidenceDirectory, label + '.txt'), output);
  result.steps.push({ label, exitCode: code, elapsedMs: Date.now() - started });
  fs.writeFileSync(path.join(evidenceDirectory, mode + '-results.json'), JSON.stringify(result, null, 2));
  console.log(output);
  console.log('END ' + label + ' exit=' + code);
  if (code !== 0) throw new Error(label + ' failed');
}
const npm = (label, args, directory) => run(label, process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd ' + args.join(' ')], path.join(repository, directory));
try {
  if (mode === 'prepare') {
    await run('prisma-generate', process.execPath, [path.join(repository, 'server/node_modules/prisma/build/index.js'), 'generate'], path.join(repository, 'server'));
    await npm('migration-deploy', ['run', 'prisma:deploy'], 'server');
    await npm('seed', ['run', 'prisma:seed'], 'server');
    const require = createRequire(path.join(repository, 'server/package.json'));
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    try {
      const actual = await prisma.$queryRawUnsafe('SELECT current_database() AS database, inet_server_port() AS port');
      if (actual[0].database !== result.database || actual[0].port !== 5433) throw new Error('Connected database differs from guarded target');
      console.log('Verified database target: ' + JSON.stringify(actual));
    } finally { await prisma.$disconnect(); }
  } else if (mode === 'recovery') {
    const require = createRequire(path.join(repository, 'server/package.json'));
    const { PrismaClient, Prisma } = require('@prisma/client');
    const source = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    const recoveryName = 'toktickit_lab4_recovery_' + process.pid + '_' + Date.now();
    if (!/^toktickit_lab4_recovery_[0-9_]+$/.test(recoveryName) || recoveryName === result.database) throw new Error('Invalid temporary recovery database');
    const recoveredUrl = new URL(databaseUrl);
    recoveredUrl.pathname = '/' + recoveryName;
    const recovered = new PrismaClient({ datasources: { db: { url: recoveredUrl.toString() } } });
    const dumpFile = path.join(repository, 'tmp', recoveryName + '.dump');
    fs.mkdirSync(path.dirname(dumpFile), { recursive: true });
    const pgEnvironment = { PGHOST: target.hostname, PGPORT: '5433', PGUSER: decodeURIComponent(target.username), PGPASSWORD: decodeURIComponent(target.password) };
    let serverVersion;
    try { serverVersion = await source.$queryRawUnsafe("SELECT current_setting('server_version_num')::int AS version"); }
    finally { await source.$disconnect(); }
    const serverMajor = Math.floor(serverVersion[0].version / 10000);
    const installedBin = process.platform === 'win32' ? path.join(process.env.ProgramFiles || 'C:/Program Files', 'PostgreSQL', String(serverMajor), 'bin') : undefined;
    const pgBin = option('--pg-bin') || (installedBin && fs.existsSync(installedBin) ? installedBin : undefined);
    const pgCommand = name => pgBin ? path.join(pgBin, name + (process.platform === 'win32' ? '.exe' : '')) : name;
    const dumpVersion = execFileSync(pgCommand('pg_dump'), ['--version'], { encoding: 'utf8' });
    if (Number(dumpVersion.match(/PostgreSQL\) (\d+)/)?.[1]) !== serverMajor) throw new Error('Use pg_dump/pg_restore tools matching PostgreSQL server major ' + serverMajor);
    console.log('RECOVERY-ENVIRONMENT ' + JSON.stringify({ serverMajor, dumpVersion: dumpVersion.trim() }));
    const snapshot = async client => {
      const rows = [];
      for (const model of Prisma.dmmf.datamodel.models) {
        const table = model.dbName || model.name;
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)) throw new Error('Unexpected table identifier');
        const value = await client.$queryRawUnsafe(`SELECT count(*)::int AS count, md5(COALESCE(string_agg(row_to_json(t)::text, E'\\n' ORDER BY row_to_json(t)::text), '')) AS checksum FROM "${table}" t`);
        rows.push({ table, ...value[0] });
      }
      return rows;
    };
    let created = false;
    try {
      const before = await snapshot(source);
      await run('recovery-backup', pgCommand('pg_dump'), ['--format=custom', '--no-owner', '--no-acl', '--file', dumpFile, '--dbname', result.database], repository, pgEnvironment);
      await run('recovery-create', pgCommand('createdb'), [recoveryName], repository, pgEnvironment);
      created = true;
      await run('recovery-restore', pgCommand('pg_restore'), ['--exit-on-error', '--no-owner', '--no-privileges', '--dbname', recoveryName, dumpFile], repository, pgEnvironment);
      const after = await snapshot(recovered);
      if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Backup/restore data fingerprint mismatch');
      result.recovery = { matched: true, tables: before, recoveryDatabase: recoveryName };
      console.log('RECOVERY-COMPARISON ' + JSON.stringify(result.recovery));
    } finally {
      await source.$disconnect();
      await recovered.$disconnect();
      if (created) await run('recovery-cleanup', pgCommand('dropdb'), [recoveryName], repository, pgEnvironment);
      if (fs.existsSync(dumpFile)) fs.unlinkSync(dumpFile);
    }
  } else if (mode === 'server') {
    // Each invocation uses a new disposable password. Seed in this process before
    // login tests, and serialize files that reset credentials in the shared seed.
    await npm('server-seed', ['run', 'prisma:seed'], 'server');
    await npm('server-tests', ['test', '--', '--no-file-parallelism'], 'server');
    await npm('server-build', ['run', 'build'], 'server');
  } else if (mode === 'client') {
    // Avoid CPU contention causing unrelated jsdom/user-event timing failures.
    await npm('client-tests', ['test', '--', '--run', '--no-file-parallelism'], 'client');
    await npm('client-build', ['run', 'build'], 'client');
  } else {
    await npm(mode + '-e2e', ['run', 'test:' + mode], 'e2e');
    const reportSource = path.join(repository, 'artifacts', mode === 'lab4' ? 'lab-04' : 'lab-03', 'evidence/playwright-report');
    const reportDestination = mode === 'lab4' ? reportSource : path.join(evidenceDirectory, 'lab3-playwright-report');
    result.report = await sanitizePlaywrightReport(reportSource, reportDestination, secrets, mode === 'lab4');
    console.log('REPORT-CHECK ' + JSON.stringify(result.report));
  }
  result.completedAt = new Date().toISOString();
  fs.writeFileSync(path.join(evidenceDirectory, mode + '-results.json'), JSON.stringify(result, null, 2));
} catch (error) {
  console.error(sanitize(String(error.stack || error)));
  process.exitCode = 1;
}
