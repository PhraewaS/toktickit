import { expect, test } from "@playwright/test";

test("RESP-01 Lab 3 login remains within the viewport", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in to TokTickIT" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("login.png"), fullPage: true });
});
