import { getTripRepository } from "../src/lib/db/index.ts";

async function main() {
  const repo = getTripRepository();
  console.log(`[tamroi:seed] Seeding sample data using backend: ${repo.backendName}...`);
  await repo.resetToSeedData();
  const published = await repo.listPublishedTrips();
  const all = await repo.listAllTripsForAdmin();
  console.log(
    `[tamroi:seed] Seed complete! Total trips: ${all.length} (${published.length} published, ${
      all.length - published.length
    } draft).`
  );
}

main().catch((err) => {
  console.error("[tamroi:seed] Failed to seed data:", err);
  process.exit(1);
});

