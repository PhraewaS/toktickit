import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.lab3.config.js";

const e2eDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(e2eDirectory, "..");

export default defineConfig({
  ...baseConfig,
  testDir: path.join(e2eDirectory, "lab-04"),
  outputDir: path.join(repositoryRoot, "artifacts/lab-04/test-results"),
  reporter: [["list"], ["html", { outputFolder: path.join(repositoryRoot, "artifacts/lab-04/evidence/playwright-report"), open: "never" }]],
});
