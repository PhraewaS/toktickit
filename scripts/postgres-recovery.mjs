import path from 'node:path';

export function requireMatchingPostgresTool(version, serverMajor, name) {
  const major = Number(version.match(/PostgreSQL\) (\d+)/)?.[1]);
  if (!Number.isInteger(serverMajor) || serverMajor < 10 || major !== serverMajor) {
    throw new Error(`Use ${name} matching PostgreSQL server major ${serverMajor}`);
  }
}

export function sqlRecoveryPlan({ pgBin, platform = process.platform, sourceDatabase, recoveryName, dumpFile }) {
  if (sourceDatabase !== 'toktickit_lab4_e2e') throw new Error('Recovery source must be the dedicated Lab 4 E2E database');
  if (!/^toktickit_lab4_recovery_[0-9]+_[0-9]+$/.test(recoveryName) || recoveryName.length > 63) {
    throw new Error('Invalid temporary recovery database');
  }
  const executable = name => pgBin ? path.join(pgBin, name + (platform === 'win32' ? '.exe' : '')) : name;
  const psql = ['--no-psqlrc', '--no-password', '--set=ON_ERROR_STOP=1', '--quiet'];
  return {
    pgDump: executable('pg_dump'),
    psql: executable('psql'),
    backup: [ '--format=plain', '--no-owner', '--no-acl', '--no-password', '--file', dumpFile, '--dbname', sourceDatabase ],
    create: [...psql, '--dbname', 'postgres', '--command', `CREATE DATABASE "${recoveryName}" TEMPLATE template0`],
    restore: [...psql, '--single-transaction', '--dbname', recoveryName, '--file', dumpFile],
    cleanup: [...psql, '--dbname', 'postgres', '--command', `DROP DATABASE "${recoveryName}"`],
  };
}
