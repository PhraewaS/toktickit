const allowedHosts = new Set(["localhost", "127.0.0.1"]);
export type EvidenceLab = "lab3" | "lab4";

export function getDedicatedE2EDatabaseUrl(lab: EvidenceLab = "lab3"): string {
  const databaseFlag = lab === "lab4" ? "LAB4_E2E_DATABASE" : "LAB3_E2E_DATABASE";
  if (process.env[databaseFlag] !== "true") {
    throw new Error(`${databaseFlag}=true is required for Lab ${lab.slice(-1)} E2E verification.`);
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
  const allowedDatabaseName = lab === "lab4" ? /^toktickit_lab4_e2e$/ : /^toktickit_(lab3_)?e2e$/;
  if (!allowedHosts.has(parsed.hostname) || !allowedDatabaseName.test(databaseName)) {
    const allowedNames = lab === "lab4" ? "toktickit_lab4_e2e" : "toktickit_lab3_e2e or toktickit_e2e";
    throw new Error(`Refusing Lab ${lab.slice(-1)} E2E verification: the database URL must point to localhost database ${allowedNames}.`);
  }

  return databaseUrl;
}

export function getE2EServerEnvironment(lab: EvidenceLab = "lab3") {
  const databaseUrl = getDedicatedE2EDatabaseUrl(lab);
  return {
    ...process.env,
    DATABASE_URL: databaseUrl,
    E2E_DATABASE_URL: databaseUrl,
    E2E_API_URL: "http://127.0.0.1:3000",
    LAB3_E2E_DATABASE: lab === "lab3" ? "true" : "false",
    LAB3_E2E_RESET_PASSWORDS: lab === "lab3" ? "true" : "false",
    LAB4_E2E_DATABASE: lab === "lab4" ? "true" : "false",
    LAB4_E2E_RESET_PASSWORDS: lab === "lab4" ? "true" : "false",
  };
}
