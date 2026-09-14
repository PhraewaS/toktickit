import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const execFileAsync = promisify(execFile);
const serverRoot = resolve(process.cwd());
const prismaCli = resolve(serverRoot, "node_modules/prisma/build/index.js");
const tsxCli = resolve(serverRoot, "node_modules/tsx/dist/cli.mjs");
const migrationNames = [
  "20260814075354_init",
  "20260825193000_lab2_requester_foundation",
  "20260908090000_lab3_auth_staff_admin",
];

function isolatedDatabaseUrl(source: string, databaseName: string) {
  const url = new URL(source);
  url.pathname = `/${databaseName}`;
  url.searchParams.delete("schema");
  return url.toString();
}

async function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv) {
  console.log(`$ ${command} ${args.join(" ")}`);
  const result = await execFileAsync(command, args, {
    cwd: serverRoot,
    env,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

async function prepareMigrationSet(root: string, includeLab3: boolean) {
  const migrationRoot = join(root, "prisma", "migrations");
  await mkdir(migrationRoot, { recursive: true });
  await copyFile(
    join(serverRoot, "prisma", "migrations", "migration_lock.toml"),
    join(migrationRoot, "migration_lock.toml"),
  );
  const names = includeLab3 ? migrationNames : migrationNames.slice(0, 2);
  for (const name of names) {
    const source = join(serverRoot, "prisma", "migrations", name, "migration.sql");
    const destination = join(migrationRoot, name, "migration.sql");
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
  const schemaSource = join(serverRoot, "prisma", "schema.prisma");
  const schemaDestination = join(root, "prisma", "schema.prisma");
  await copyFile(schemaSource, schemaDestination);
  return schemaDestination;
}

function assertEqual(label: string, before: number, after: number) {
  if (before !== after) throw new Error(`${label} changed from ${before} to ${after}.`);
}

async function loadLocalEnv() {
  const envPath = join(serverRoot, ".env");
  try {
    const content = await readFile(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
    }
  } catch {
    // The caller may provide all required values through the environment.
  }
}

async function main() {
  await loadLocalEnv();
  const sourceUrl = process.env.DATABASE_URL;
  const initialPassword = process.env.LAB3_MIGRATION_INITIAL_PASSWORD ?? process.env.LAB3_SEED_PASSWORD;
  if (!sourceUrl) throw new Error("DATABASE_URL is required for isolated migration verification.");
  if (!initialPassword) throw new Error("LAB3_MIGRATION_INITIAL_PASSWORD or LAB3_SEED_PASSWORD is required.");

  const databaseName = `toktickit_lab3_verify_${Date.now()}_${randomBytes(3).toString("hex")}`;
  const isolatedUrl = isolatedDatabaseUrl(sourceUrl, databaseName);
  const admin = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  let lab2Client: PrismaClient | undefined;
  let lab3Client: PrismaClient | undefined;
  let verificationClient: PrismaClient | undefined;
  const temporaryRoot = await mkdtemp(join(tmpdir(), "toktickit-lab3-migration-"));

  try {
    if (!/^toktickit_lab3_verify_[a-z0-9_]+$/.test(databaseName)) throw new Error("Unexpected temporary database name.");
    await admin.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);
    const migrationEnv = { ...process.env, DATABASE_URL: isolatedUrl, NODE_ENV: "test", LAB2_COMPATIBILITY_MODE: "false" };

    const lab2SchemaPath = await prepareMigrationSet(temporaryRoot, false);
    console.log("Migration phase 1: applying Lab 1 and Lab 2 migrations to isolated database");
    await runCommand(process.execPath, [prismaCli, "migrate", "deploy", "--schema", lab2SchemaPath], migrationEnv);

    lab2Client = new PrismaClient({ datasources: { db: { url: isolatedUrl } } });
    const [{ id: requesterId }, { id: ticketId }, { id: attachmentId }] = await Promise.all([
      lab2Client.$queryRaw<Array<{ id: number }>>`INSERT INTO requester_users ("name", "email", "isActive", "createdAt", "updatedAt") VALUES ('Legacy Requester', 'jennifer@example.test', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
      lab2Client.$queryRaw<Array<{ id: number }>>`INSERT INTO categories ("name", "isActive", "updatedAt") VALUES ('Migration Category', true, CURRENT_TIMESTAMP) RETURNING id`,
      lab2Client.$queryRaw<Array<{ id: number }>>`INSERT INTO related_systems ("name", "updatedAt") VALUES ('Migration System', CURRENT_TIMESTAMP) RETURNING id`,
    ]).then(async ([requester, category, system]) => {
      const [ticket] = await lab2Client!.$queryRaw<Array<{ id: number }>>`INSERT INTO tickets ("ticketNumber", "requesterId", "categoryId", "relatedSystemId", "summary", "requestedPriority", "description", "currentStatus", "submissionKey", "createdAt", "updatedAt") VALUES ('TKT-LEGACY-00000001', ${requester[0].id}, ${category[0].id}, ${system[0].id}, 'Legacy migration ticket', 'HIGH', 'Legacy Lab 2 data for migration verification.', 'NEW', '11111111-1111-4111-8111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`;
      const [attachment] = await lab2Client!.$queryRaw<Array<{ id: number }>>`INSERT INTO attachments ("ticketId", "originalFilename", "storedFilename", "mimeType", "sizeBytes") VALUES (${ticket.id}, 'legacy.pdf', '22222222-2222-4222-8222-222222222222', 'application/pdf', 10) RETURNING id`;
      return [requester[0], ticket, attachment] as const;
    });
    console.log(JSON.stringify({ beforeMigration: { requesterId, ticketId, attachmentId } }, null, 2));
    await lab2Client.$disconnect();
    lab2Client = undefined;

    const fullSchemaPath = await prepareMigrationSet(temporaryRoot, true);
    console.log("Migration phase 2: applying Lab 3 migration to the same isolated database");
    await runCommand(process.execPath, [prismaCli, "migrate", "deploy", "--schema", fullSchemaPath], migrationEnv);

    lab3Client = new PrismaClient({ datasources: { db: { url: isolatedUrl } } });
    const [requesterAfter, ticketAfter, attachmentAfter] = await Promise.all([
      lab3Client.$queryRaw<Array<{ id: number; role: string; mustChangePassword: boolean }>>`SELECT id, role::text, "mustChangePassword" FROM requester_users WHERE id = ${requesterId}`,
      lab3Client.$queryRaw<Array<{ id: number; requesterId: number }>>`SELECT id, "requesterId" FROM tickets WHERE id = ${ticketId}`,
      lab3Client.$queryRaw<Array<{ id: number; ticketId: number }>>`SELECT id, "ticketId" FROM attachments WHERE id = ${attachmentId}`,
    ]);
    assertEqual("Requester ID", requesterId, requesterAfter[0].id);
    assertEqual("Ticket ID", ticketId, ticketAfter[0].id);
    assertEqual("Attachment ID", attachmentId, attachmentAfter[0].id);
    assertEqual("Ticket requesterId", requesterId, ticketAfter[0].requesterId);
    assertEqual("Attachment ticketId", ticketId, attachmentAfter[0].ticketId);
    if (requesterAfter[0].role !== "REQUESTER" || requesterAfter[0].mustChangePassword !== true) {
      throw new Error("Migrated requester did not receive role REQUESTER and mustChangePassword=true.");
    }
    console.log("Migration preservation: PASS (requesterId, Ticket ID, Attachment ID unchanged)");
    console.log("Migrated user defaults: PASS (role=REQUESTER, mustChangePassword=true)");
    await lab3Client.$disconnect();
    lab3Client = undefined;

    console.log("Seed phase: applying deterministic seed to the isolated migrated database");
    await runCommand(process.execPath, [tsxCli, "prisma/seed.ts"], { ...migrationEnv, LAB3_SEED_PASSWORD: initialPassword });

    process.env.DATABASE_URL = isolatedUrl;
    process.env.NODE_ENV = "test";
    process.env.LAB2_COMPATIBILITY_MODE = "false";
    const [{ app }, { getPrisma }, { default: request }] = await Promise.all([
      import("../src/app.js"),
      import("../src/prisma.js"),
      import("supertest"),
    ]);
    verificationClient = getPrisma();
    const seededRequester = await verificationClient.requesterUser.findUnique({ where: { id: requesterId } });
    if (!seededRequester || seededRequester.role !== "REQUESTER" || !seededRequester.mustChangePassword) {
      throw new Error("Seed did not preserve the migrated requester identity or first-login flag.");
    }
    const login = await request(app).post("/api/auth/login").send({ email: "jennifer@example.test", password: initialPassword });
    if (login.status !== 200) throw new Error(`Initial-password login failed with HTTP ${login.status}.`);
    const cookie = login.headers["set-cookie"][0].split(";")[0];
    const blocked = await request(app).get("/api/tickets").set("Cookie", cookie);
    if (blocked.status !== 403 || blocked.body.error?.code !== "PASSWORD_CHANGE_REQUIRED") {
      throw new Error("Migrated user was not blocked by PASSWORD_CHANGE_REQUIRED.");
    }
    const changed = await request(app).post("/api/auth/change-password").set("Cookie", cookie).send({ newPassword: "Migration-New1!", confirmPassword: "Migration-New1!" });
    if (changed.status !== 200 || changed.body.data?.user?.mustChangePassword !== false) {
      throw new Error("Migrated user password change did not complete successfully.");
    }
    const allowed = await request(app).get("/api/tickets").set("Cookie", cookie);
    if (allowed.status !== 200) throw new Error(`Protected route remained blocked after password change with HTTP ${allowed.status}.`);
    console.log("Initial-password login: PASS");
    console.log("PASSWORD_CHANGE_REQUIRED protected-route gate: PASS");
    console.log("Password change and protected-route access: PASS");
  } finally {
    await verificationClient?.$disconnect();
    await lab3Client?.$disconnect();
    await lab2Client?.$disconnect();
    await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${databaseName}"`).catch(() => undefined);
    await admin.$disconnect();
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
