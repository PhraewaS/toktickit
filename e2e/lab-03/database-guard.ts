const allowedHosts = new Set(["localhost", "127.0.0.1"]);
const allowedDatabaseName = /^toktickit_(lab3_)?e2e$/;

export function getDedicatedE2EDatabaseUrl(): string {
  if (process.env.LAB3_E2E_DATABASE !== "true") {
    throw new Error("LAB3_E2E_DATABASE=true is required for Lab 3 E2E verification.");
  }

  const databaseUrl = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("E2E_DATABASE_URL or DATABASE_URL is required for Lab 3 E2E verification.");
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("The E2E database URL is invalid.");
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, "").split("?")[0]);
  if (!allowedHosts.has(parsed.hostname) || !allowedDatabaseName.test(databaseName)) {
    throw new Error("Refusing Lab 3 E2E verification: the database URL must point to localhost database toktickit_lab3_e2e or toktickit_e2e.");
  }

  return databaseUrl;
}

export function getE2EServerEnvironment() {
  const databaseUrl = getDedicatedE2EDatabaseUrl();
  return {
    ...process.env,
    DATABASE_URL: databaseUrl,
    E2E_DATABASE_URL: databaseUrl,
    E2E_API_URL: "http://127.0.0.1:3000",
    LAB3_E2E_DATABASE: "true",
    LAB3_E2E_RESET_PASSWORDS: "true",
  };
}
