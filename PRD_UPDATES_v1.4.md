# Wine Butler IQ - PRD Updates v1.4

Changes and decisions since July 12, 2026 (post v1.3 brand migration). No schema changes.

---

## Brand & Domain Migration (Operational Follow-Through)

Builds on the naming/domain change recorded in v1.3.

- **Domain:** winebutlerai.com -> winebutleriq.com
- **Product name:** Wine Butler AI -> Wine Butler IQ
- **Google Workspace email:** notifications@winebutleriq.com established for transactional/system email

---

## Engineering Process

### Debugging Protocol

Added to `CLAUDE.md` and propagated to all relevant agents. Standard process now required for every bug fix:

1. Pick one specific failing record from real data
2. Trace it through the pipeline step by step (rawData -> mappedData -> normalizeWineData() output -> database)
3. Identify the exact file and line where the value goes wrong
4. Write the smallest fix possible, touching only the file and lines identified
5. Run all agents before committing, not after
6. Delete test data and re-import real data after deploy
7. Verify visually before moving to next task

### Import Pipeline Fixes (Three Surgical Fixes)

1. Region cleaning
2. Appellation mapping to database
3. State field contamination fix

---

## Wine Knowledge Database Initiative

Three-phase plan approved:

- **Phase 1:** Unified `wine-knowledge.ts` hierarchy
- **Phase 2:** Supabase `wine_knowledge` table (5,000+ wines)
- **Phase 3:** Retire fragmented tables

---

## Business / Commercial

- **Pricing:** deferred to beta/commercial launch phase
- **GitHub repo:** to be switched to private before beta launch

---

## Legal (Open Items)

- Trademark filing: pending
- LLC structure decision: pending

---

## Out of Scope for This Update

- No changes to Sections 4.2, 6, or 11 of the PRD
- No schema, field, or feature changes
