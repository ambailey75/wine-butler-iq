-- Add region_authority table (2026-07-20).
--
-- Reference table for the region-validation checker
-- (lib/wines/region-hierarchy-checker.ts). Holds appellation -> parent
-- administrative entity -> country facts, sourced and cross-checked per
-- WINE_KNOWLEDGE_DATABASE_PLAN.md "Region-Hierarchy Source Evaluation
-- (2026-07-20)":
--   - WIKIDATA: primary. Items typed `instance of: wine` (Q282), via P131
--     (located in administrative territorial entity) / P17 (country).
--     Verified against the real Albinea Canali "Piemonte" error found in
--     the X-Wines duplicate audit (correct answer: Colli di Scandiano e
--     di Canossa DOC -> Province of Reggio Emilia -> Italy).
--   - WINERYMAP: secondary cross-check (github.com/oOo0oOo/winerymap,
--     MIT). Confirmed to contain the same test case as a literal region
--     key ("Colli di Scandiano e di Canossa, Italy").
--
-- Deliberately a new table, not an addition to wine_knowledge or to
-- lib/wines/wine-knowledge.ts (see schema.prisma comment above this
-- table for why).
--
-- Not yet populated: fetchFullRegionAuthorityTable() in
-- region-hierarchy-checker.ts can build the WIKIDATA rows, but has only
-- been proven reachable from a browser context so far, not from this
-- project's own Node/Vercel runtime (query.wikidata.org is blocked at
-- the research sandbox's network proxy). Populating this table is
-- blocked on that one unresolved verification, not on schema design.
--
-- Hand-written directly (not via `prisma migrate dev`), same as every
-- other wine_knowledge-adjacent migration in this project —
-- `migrate dev`'s shadow-database diff has a confirmed, still-open bug
-- with Supabase-managed extensions (prisma/prisma#19100). Applying via
-- `prisma migrate deploy` avoids that entirely.

CREATE TYPE "RegionAuthoritySource" AS ENUM ('WIKIDATA', 'WINERYMAP');

CREATE TABLE "region_authority" (
    "id" TEXT NOT NULL,
    "appellation" TEXT NOT NULL,
    "locatedIn" TEXT,
    "country" TEXT,
    "source" "RegionAuthoritySource" NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "region_authority_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "region_authority_appellation_idx" ON "region_authority"("appellation");
CREATE INDEX "region_authority_country_idx" ON "region_authority"("country");
