import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export default function globalSetup() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const serverDirectory = path.join(repositoryRoot, "server");
  const seedPassword = process.env.LAB3_SEED_PASSWORD;
  if (!seedPassword) throw new Error("LAB3_SEED_PASSWORD is required for Lab 3 E2E setup and must not be committed.");
  if (process.env.LAB3_E2E_DATABASE !== "true") throw new Error("LAB3_E2E_DATABASE=true is required for Lab 3 E2E setup.");
  const e2eEnvironment = { ...process.env, LAB3_SEED_PASSWORD: seedPassword, LAB3_E2E_RESET_PASSWORDS: "true", LAB3_E2E_DATABASE: "true" };
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm.cmd run prisma:deploy"], { cwd: serverDirectory, stdio: "inherit", env: e2eEnvironment });
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm.cmd run prisma:seed"], { cwd: serverDirectory, stdio: "inherit", env: e2eEnvironment });
}
