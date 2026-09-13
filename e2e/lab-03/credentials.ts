export function getLab3SeedPassword() {
  const password = process.env.LAB3_SEED_PASSWORD;
  if (!password) throw new Error("LAB3_SEED_PASSWORD is required for Lab 3 E2E tests and must not be committed.");
  return password;
}
