import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getE2EServerEnvironment } from "./lab-03/database-guard.js";

export default function globalSetup() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const serverDirectory = path.join(repositoryRoot, "server");
  const seedPassword = process.env.LAB3_SEED_PASSWORD;
  if (!seedPassword) throw new Error("LAB3_SEED_PASSWORD is required for Lab 3 E2E setup and must not be committed.");
  const e2eEnvironment = { ...getE2EServerEnvironment(), LAB3_SEED_PASSWORD: seedPassword };
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm.cmd run prisma:deploy"], { cwd: serverDirectory, stdio: "inherit", env: e2eEnvironment });
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm.cmd run prisma:seed"], { cwd: serverDirectory, stdio: "inherit", env: e2eEnvironment });
}
