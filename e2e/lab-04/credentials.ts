export function getLab4SeedPassword() {
  const password = process.env.LAB4_SEED_PASSWORD;
  if (!password) throw new Error("LAB4_SEED_PASSWORD is required for Lab 4 E2E tests and must not be committed.");
  return password;
}
