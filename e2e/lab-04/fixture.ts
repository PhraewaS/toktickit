import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getE2EServerEnvironment } from "../lab-03/database-guard.js";
import { getLab4SeedPassword } from "./credentials.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function resetLab4Seed() {
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm.cmd run prisma:seed"], {
    cwd: path.join(repositoryRoot, "server"),
    stdio: "inherit",
    env: { ...getE2EServerEnvironment("lab4"), LAB3_SEED_PASSWORD: getLab4SeedPassword() },
  });
}

export async function signInAndOpenDashboard(page: import("@playwright/test").Page, email: string, newPassword: string) {
  await page.goto("/");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(getLab4SeedPassword());
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirm new password", { exact: true }).fill(newPassword);
  await page.getByRole("button", { name: "Save password" }).click();
  await expectDashboard(page);
}

async function expectDashboard(page: import("@playwright/test").Page) {
  await page.getByRole("heading", { name: "Dashboard" }).waitFor();
}
