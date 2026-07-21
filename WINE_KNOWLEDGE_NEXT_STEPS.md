# Wine Knowledge Database — Next Steps Tracker

Live status tracker, kept current as work happens. `WINE_KNOWLEDGE_DATABASE_PLAN.md` is the historical record; this doc is where current status and next actions live.

---

## 1. Populate `region_authority` in Supabase — DONE 2026-07-21

Plan link: `WINE_KNOWLEDGE_DATABASE_PLAN.md` → Region-Hierarchy Source Evaluation → `region_authority` table note.
Result: 8,956 rows fetched from Wikidata, 8,956 inserted, 0 errors. Real run output, not a claim.

What actually happened, for anyone reading this later: the Vercel-route approach hit repeated transient failures against Wikidata (connection "terminated," then a real 502), so this was switched to a local script (`npm run populate-region-authority`) run directly from a machine with reliable internet — no more deploy/wait/retry cycle. Along the way, found the `region_authority` migration had never actually been applied to production (the table didn't exist despite the plan doc saying it did) — applied via `prisma migrate deploy`, confirmed, then the population script ran clean.
Follow-up: the now-unused Vercel route (`app/api/admin/populate-region-authority/route.ts`) should be deleted, same as the earlier debug route.

---

## 2. Validate dedup thresholds (0.92 / 0.75) — DONE 2026-07-21, validated safe

Plan link: `WINE_KNOWLEDGE_DATABASE_PLAN.md` → Phase 2, Checklist #3.
Built `lib/wines/dedup-match.ts` (cleanup/accent-fold/abbreviation-expansion, then Levenshtein-based similarity score). Ran 7 real test cases, output below — not a claim, actual executed results:

1. **Domaine Leroy vs. Domaine Leflaive** (the named risky case) — REVIEW, score 0.750. Correctly does NOT auto-match.
2. Accent variant (Chateauneuf-du-Pape with/without accent) — AUTO_MATCH, 1.000. Correct.
3. Abbreviation expansion (Dom. vs. Domaine) — AUTO_MATCH, 1.000. Correct.
4. NV vs. specific vintage, same name — forced to REVIEW regardless of score, per the hard rule. Correct.
5. Chateau Margaux vs. Chateau Latour (both "Grand Vin") — REVIEW, score 0.800, not DIFFERENT as expected. Real caveat, not a failure: shared generic terms ("Chateau," "Grand Vin") inflate the score for genuinely different producers. Not unsafe (nothing auto-merges below 0.92), but means more pairs land in manual review than a person might expect. Worth revisiting later by weighting producer name more heavily than wine name — not a blocker now.
6. Exact match — AUTO_MATCH, 1.000. Correct.
7. Real Quimera case from the plan doc (5-grape blend vs. 100% Malbec, same name) — DIFFERENT, score 0.694. Correctly stays below the review floor, matching the decision already made in the plan doc.

**Verdict: thresholds hold for the critical direction — nothing that should stay separate gets silently auto-merged, across every case tested including the one specifically named as risky.** Signed off as safe to use. The review-queue-volume caveat (case 5) is a future refinement, not a blocker.

---

## 3. Import X-Wines catalog into `wine_knowledge` — IN PROGRESS, no DB writes yet

Plan link: `WINE_KNOWLEDGE_DATABASE_PLAN.md` → Phase 2, Checklist #2.
Why: this is the actual point of Phase 2 — real, searchable data instead of an empty table.

Substeps:
1. [x] #2 sign-off — done, thresholds validated safe
2. [x] Build import script (`scripts/import-xwines.ts`, `npm run import-xwines -- --dry-run`) — parses the real CSV, applies the confirmed Quimera exclusion (WineID 167488), splits `Vintages` into `known_vintages`/`has_non_vintage`
3. [x] Dry-run against the real 100,646-row catalog — 100,645 transformed, 1 correctly skipped, zero crashes, sample output checked by hand
4. [ ] **Region validation against `region_authority` — NOT wired in yet.** Real finding while testing: Albinea Canali's region problem is bigger than the plan doc describes — 5 of its 6 rows in the catalog say `RegionName: Piemonte` (wrong; it's an Emilia-Romagna producer), not just the one duplicate pair originally documented. This needs fixing before any live write, not after.
5. [ ] Live write to `wine_knowledge` (script currently stops after dry-run validation, no write path built yet)
6. [ ] Trace one real record through the full pipeline per the debugging protocol before calling it done

---

## 4. Wire appellation-level field into the checker — MEDIUM PRIORITY, NO BLOCKERS

Plan link: `WINE_KNOWLEDGE_DATABASE_PLAN.md` → Region-Hierarchy Source Evaluation → "Appellation-level field."
Why: data already exists, this is pure wiring.

Substeps:
1. [ ] Add appellation as its own labeled output field, separate from region/subregion
2. [ ] Update any code/tests that consume checker output

---

## 5. Remaining 12-country subregion research + 18 Italian regions — LOW PRIORITY, DEFERRED ON PURPOSE

Plan link: `WINE_KNOWLEDGE_DATABASE_PLAN.md` → Region-Hierarchy Source Evaluation → "Subregion layer." Full detail: `PRD_UPDATES_v1.5.md`.
Why: explicitly scheduled for before commercial release, not before MVP. Nothing current depends on it.

Substeps: none right now — revisit when commercial launch is being scoped.
