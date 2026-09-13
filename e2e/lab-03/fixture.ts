import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLab3SeedPassword } from "./credentials.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function resetLocalSeed() {
  const password = getLab3SeedPassword();
  if (process.env.LAB3_E2E_DATABASE !== "true") throw new Error("Fixture reset requires LAB3_E2E_DATABASE=true.");
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm.cmd run prisma:seed"], {
    cwd: path.join(repositoryRoot, "server"),
    stdio: "inherit",
    env: { ...process.env, LAB3_SEED_PASSWORD: password, LAB3_E2E_RESET_PASSWORDS: "true", LAB3_E2E_DATABASE: "true" },
  });
}
