import { getPrisma } from "../src/prisma.js";

const categories = [
  "Account and Access",
  "Hardware",
  "Software",
  "Network",
];

const relatedSystems = [
  "Corporate Laptop",
  "Email",
  "Employee Portal",
  "Network Access",
  "Printer",
  "VPN",
];

const developmentRequesters = [
  { name: "Jennifer Anderson", email: "jennifer@example.test", isActive: true },
  { name: "Kanya Srisawat", email: "kanya@example.test", isActive: true },
  { name: "Narin Chai", email: "narin@example.test", isActive: true },
  { name: "Preecha Wong", email: "preecha@example.test", isActive: true },
  { name: "Archived Requester", email: "archived@example.test", isActive: false },
];

async function main() {
  const prisma = getPrisma();

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }

  for (const name of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }

  for (const requester of developmentRequesters) {
    await prisma.requesterUser.upsert({
      where: { email: requester.email },
      update: {
        name: requester.name,
        isActive: requester.isActive,
      },
      create: requester,
    });
  }

  console.log(
    `Seeded ${categories.length} categories, ${relatedSystems.length} related systems, and ${developmentRequesters.length} development requesters.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
