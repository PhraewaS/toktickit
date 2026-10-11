import test from 'node:test';
import assert from 'node:assert/strict';
import { requireMatchingPostgresTool, sqlRecoveryPlan } from './postgres-recovery.mjs';

const options = { sourceDatabase: 'toktickit_lab4_e2e', recoveryName: 'toktickit_lab4_recovery_123_456', dumpFile: 'temporary-backup.sql' };

test('uses supported plain SQL dump and psql, without blocked helper executables', () => {
  const plan = sqlRecoveryPlan(options);
  assert.equal(plan.pgDump, 'pg_dump');
  assert.equal(plan.psql, 'psql');
  assert.ok(plan.backup.includes('--format=plain'));
  assert.ok(plan.restore.includes('--file'));
  assert.ok(plan.backup.includes('--no-owner'));
  assert.ok(plan.backup.includes('--no-acl'));
  assert.doesNotMatch(JSON.stringify(plan), /pg_restore|createdb|dropdb/);
});

test('restores atomically and stops on SQL errors, ignoring user psql startup files', () => {
  const plan = sqlRecoveryPlan(options);
  for (const args of [plan.create, plan.restore, plan.cleanup]) {
    for (const flag of ['--no-psqlrc', '--no-password', '--set=ON_ERROR_STOP=1']) assert.ok(args.includes(flag));
  }
  assert.ok(plan.restore.includes('--single-transaction'));
});

test('only creates and drops the unique validated temporary database, using template0', () => {
  const plan = sqlRecoveryPlan(options);
  assert.equal(plan.create.at(-1), 'CREATE DATABASE "toktickit_lab4_recovery_123_456" TEMPLATE template0');
  assert.equal(plan.cleanup.at(-1), 'DROP DATABASE "toktickit_lab4_recovery_123_456"');
  assert.equal(plan.restore[plan.restore.indexOf('--dbname') + 1], options.recoveryName);
  assert.ok(!plan.cleanup.includes('--force'));
});

test('rejects application databases and unsafe recovery targets', () => {
  for (const sourceDatabase of ['toktickit', 'postgres', 'toktickit_lab3_e2e']) {
    assert.throws(() => sqlRecoveryPlan({ ...options, sourceDatabase }));
  }
  for (const recoveryName of ['toktickit_lab4_e2e', 'postgres', 'toktickit_lab4_recovery_1_2"; DROP DATABASE postgres;', 'toktickit_lab4_recovery_' + '1'.repeat(64) + '_2']) {
    assert.throws(() => sqlRecoveryPlan({ ...options, recoveryName }));
  }
});

test('uses the selected installed Windows tools with no shell string', () => {
  const plan = sqlRecoveryPlan({ ...options, pgBin: 'C:/Program Files/PostgreSQL/15/bin', platform: 'win32' });
  assert.match(plan.pgDump, /pg_dump\.exe$/);
  assert.match(plan.psql, /psql\.exe$/);
  assert.ok(Array.isArray(plan.restore));
  assert.ok(plan.restore.includes(options.dumpFile));
});

test('requires both SQL backup/restore tools to match the actual server major', () => {
  requireMatchingPostgresTool('pg_dump (PostgreSQL) 15.19', 15, 'pg_dump');
  requireMatchingPostgresTool('psql (PostgreSQL) 15.19', 15, 'psql');
  for (const version of ['psql (PostgreSQL) 17.11', 'invalid version']) {
    assert.throws(() => requireMatchingPostgresTool(version, 15, 'psql'));
  }
});
