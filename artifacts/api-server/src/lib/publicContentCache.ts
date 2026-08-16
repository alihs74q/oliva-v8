import { cmsReleasesTable, db } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

type PublishedRelease = {
  version: number;
  publishedAt: Date;
  snapshot: unknown;
};

let cachedRelease: PublishedRelease | null = null;
let pendingLoad: Promise<PublishedRelease | null> | null = null;

export async function getPublishedRelease(): Promise<PublishedRelease | null> {
  if (cachedRelease) return cachedRelease;
  if (pendingLoad) return pendingLoad;

  pendingLoad = db
    .select({
      version: cmsReleasesTable.version,
      publishedAt: cmsReleasesTable.publishedAt,
      snapshot: cmsReleasesTable.snapshot,
    })
    .from(cmsReleasesTable)
    .where(eq(cmsReleasesTable.isCurrent, true))
    .orderBy(sql`${cmsReleasesTable.publishedAt} DESC`)
    .limit(1)
    .then(([release]) => {
      cachedRelease = release ?? null;
      return cachedRelease;
    })
    .finally(() => {
      pendingLoad = null;
    });

  return pendingLoad;
}

export function invalidatePublishedRelease(): void {
  cachedRelease = null;
}