import { getPrisma } from "../src/prisma.js";
import { hashPassword, validatePassword } from "../src/auth.js";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const categories = ["Account and Access", "Hardware", "Software", "Network"];
const relatedSystems = ["Corporate Laptop", "Email", "Employee Portal", "Network Access", "Printer", "VPN"];
const requesters = [
  { name: "Jennifer Anderson", email: "jennifer@example.test", isActive: true },
  { name: "Kanya Srisawat", email: "kanya@example.test", isActive: true },
  { name: "Narin Chai", email: "narin@example.test", isActive: true },
  { name: "Preecha Wong", email: "preecha@example.test", isActive: true },
  { name: "Archived Requester", email: "archived@example.test", isActive: false },
];
const staff = [
  { name: "Mali Support", email: "mali.staff@example.test", isActive: true },
  { name: "Somchai Technician", email: "somchai.staff@example.test", isActive: true },
  { name: "Arisa Service Desk", email: "arisa.staff@example.test", isActive: true },
  { name: "Inactive Technician", email: "inactive.staff@example.test", isActive: false },
];
const administrator = { name: "Nok Administrator", email: "admin@example.test", isActive: true };

export async function runSeed() {
  const seedPassword = process.env.LAB3_SEED_PASSWORD;
  if (!seedPassword) throw new Error("LAB3_SEED_PASSWORD is required for local seeding.");
  const passwordError = validatePassword(seedPassword);
  if (passwordError) throw new Error(`LAB3_SEED_PASSWORD is required and invalid: ${passwordError}`);
  const prisma = getPrisma();
  const resetFixturePasswords = process.env.LAB3_E2E_RESET_PASSWORDS === "true";
  for (const name of categories) await prisma.category.upsert({ where: { name }, update: { isActive: true }, create: { name, isActive: true } });
  for (const name of relatedSystems) await prisma.relatedSystem.upsert({ where: { name }, update: { isActive: true }, create: { name, isActive: true } });
  const allUsers = [...requesters.map((user) => ({ ...user, role: "REQUESTER" as const })), ...staff.map((user) => ({ ...user, role: "IT_STAFF" as const })), { ...administrator, role: "ADMINISTRATOR" as const }];
  for (const item of allUsers) {
    const saved = await prisma.requesterUser.upsert({ where: { email: item.email }, update: { name: item.name, isActive: item.isActive, role: item.role }, create: { name: item.name, email: item.email, isActive: item.isActive, role: item.role, passwordHash: hashPassword(seedPassword, `seed-${item.email}`), mustChangePassword: true } });
    if (resetFixturePasswords || saved.mustChangePassword) await prisma.requesterUser.update({ where: { id: saved.id }, data: { passwordHash: hashPassword(seedPassword, `seed-${item.email}`), mustChangePassword: true } });
  }
  const requesterRows = await prisma.requesterUser.findMany({ where: { role: "REQUESTER" }, orderBy: { id: "asc" } });
  const staffRows = await prisma.requesterUser.findMany({ where: { role: "IT_STAFF", isActive: true }, orderBy: { id: "asc" } });
  const categoryRows = await prisma.category.findMany({ orderBy: { id: "asc" } });
  const systemRows = await prisma.relatedSystem.findMany({ orderBy: { id: "asc" } });
  const examples = [["OPEN", "HIGH", "Laptop cannot connect to VPN"], ["IN_PROGRESS", "MEDIUM", "Employee portal shows a blank page"], ["WAITING_FOR_REQUESTER", "LOW", "Printer queue needs clarification"], ["RESOLVED", "HIGH", "Email access was restored"], ["NEW", "MEDIUM", "Request for approved software"], ["REOPENED", "HIGH", "Network access dropped again"]] as const;
  for (let i = 0; i < examples.length; i += 1) {
    const requester = requesterRows[i % requesterRows.length]; const [status, priority, summary] = examples[i]; const submissionKey = `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
    const ownerId = i % 2 === 0 ? staffRows[i % staffRows.length]?.id ?? null : null;
    const ticket = await prisma.ticket.upsert({ where: { requesterId_submissionKey: { requesterId: requester.id, submissionKey } }, update: { summary, currentStatus: status, requestedPriority: priority, itPriority: priority, ownerId }, create: { ticketNumber: `TKT-20260908-${String(10000000 + i).slice(-8)}`, requesterId: requester.id, categoryId: categoryRows[i % categoryRows.length].id, relatedSystemId: systemRows[i % systemRows.length].id, summary, description: `Seeded local development ticket for ${summary.toLowerCase()}.`, requestedPriority: priority, itPriority: priority, currentStatus: status, ownerId, submissionKey } });
    if (!await prisma.publicComment.findFirst({ where: { ticketId: ticket.id, content: { startsWith: "Seeded public update" } } })) await prisma.publicComment.create({ data: { ticketId: ticket.id, authorId: requester.id, content: "Seeded public update for local development." } });
    if (staffRows[0] && !await prisma.internalNote.findFirst({ where: { ticketId: ticket.id, content: { startsWith: "Seeded internal note" } } })) await prisma.internalNote.create({ data: { ticketId: ticket.id, authorId: staffRows[0].id, content: "Seeded internal note for local development." } });
  }
  console.log(`Seeded ${categories.length} categories, ${systemRows.length} related systems, ${requesterRows.length} requesters, ${staffRows.length} active IT Staff, and one Administrator.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runSeed()
    .catch((error) => { console.error(error); process.exitCode = 1; })
    .finally(async () => { await getPrisma().$disconnect(); });
}
