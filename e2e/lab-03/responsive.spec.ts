import { expect, test } from "@playwright/test";

test("RESP-01 Lab 3 login remains within the viewport", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
