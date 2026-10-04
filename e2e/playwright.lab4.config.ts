import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { getE2EServerEnvironment } from "./lab-03/database-guard.js";

const e2eDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(e2eDirectory, "..");
const e2eServerEnvironment = getE2EServerEnvironment("lab4");

export default defineConfig({
  testDir: path.join(e2eDirectory, "lab-04"),
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  outputDir: path.join(repositoryRoot, "artifacts/lab-04/test-results"),
  reporter: [["list"], ["html", { outputFolder: path.join(repositoryRoot, "artifacts/lab-04/evidence/playwright-report"), open: "never" }]],
  globalSetup: path.join(e2eDirectory, "global-setup.ts"),
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 834, height: 1112 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: [
    {
      command: "npm.cmd run dev",
      cwd: path.join(repositoryRoot, "server"),
      url: "http://127.0.0.1:3000/api/health",
      env: e2eServerEnvironment,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "npm.cmd run dev -- --host 127.0.0.1",
      cwd: path.join(repositoryRoot, "client"),
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
