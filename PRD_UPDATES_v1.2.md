# Wine Butler AI - PRD Updates v1.2

Changes to reflect all schema additions implemented before Phase 4.

---

## Section 4.2 - Wine Inventory Management (Updated Field Table)

New fields added to Wine entity:

| Field | Type | Description |
|---|---|---|
| state | String (optional) | US state, Australian state, Canadian province. Sits between Country and Region in geographic hierarchy. |
| vineyard | String (optional) | Specific vineyard designation (e.g. To Kalon Vineyard, Beckstoffer Georges III). Common in Napa/Sonoma. |
| totalCostOverride | Decimal (optional) | Import-provided total cost. If set, displayed instead of calculated purchasePrice x quantity. |
| totalValueOverride | Decimal (optional) | Import-provided total value. If set, displayed instead of calculated currentEstValue x quantity. |
| consumedQuantity | Int (default 0) | Bottles consumed from this entry. Supports partial consumption. |
| isFullyConsumed | Boolean (default false) | True when consumedQuantity >= quantity. Used for cellar view filtering. |

Geographic hierarchy (updated):
Country -> State/Province -> Region -> Sub-Region -> Vineyard

---

## Section 6 - Core Data Model (New Entity)

### ConsumptionLog

Tracks individual consumption events. Supports multiple events per wine entry (e.g. drank 1 of 3 bottles on different dates).

| Field | Type | Description |
|---|---|---|
| id | String (CUID) | Primary key |
| wineId | String (FK) | References Wine |
| userId | String (FK) | References User |
| quantity | Int (default 1) | Bottles consumed in this event |
| consumedDate | DateTime | When the wine was consumed |
| occasion | String (optional) | e.g. "Anniversary dinner", "Friday night" |
| notes | String (optional) | Tasting impressions, who shared it |
| rating | Decimal(4,1) (optional) | Personal rating at time of drinking (0-100) |
| createdAt | DateTime | Record creation timestamp |

Relations: Wine.consumptionLogs[], User.consumptionLogs[]

---

## Style Inference Logic (New Subsection under 4.2)

When a wine's style is not explicitly provided (during import or extraction), the system infers it deterministically using this priority:

1. Varietal-based: Known red varietals (Cabernet Sauvignon, Merlot, Pinot Noir, etc.) -> "Red". Known white varietals (Chardonnay, Sauvignon Blanc, Riesling, etc.) -> "White". Rose indicators -> "Rose". Champagne/sparkling indicators -> "Sparkling".
2. Classification/region-based: Sauternes -> "Dessert", Champagne region -> "Sparkling", Port/Sherry/Madeira -> "Fortified".
3. Wine name text: Style keywords in wine name or notes as last resort.

Implementation: deterministic rule-based function (lib/wines/inferStyle.ts), not an API call. Runs synchronously during import row processing.

---

## Total Cost / Total Value Override Behavior (Business Rule)

Display logic for cost and value totals:
- Total Cost: show totalCostOverride if set from import; otherwise calculate purchasePrice x quantity
- Total Est. Value: show totalValueOverride if set from import; otherwise calculate currentEstValue x quantity

These override fields are populated only when the import source explicitly provides total values. They are not user-editable in the manual wine form (computed at display time for manually entered wines).

---

## New Features

### Total Inventory Value Summary (Dashboard)

Dashboard KPI cards now include:
- Total Bottles: count of all bottles
- Total Cost Basis: sum of totalCostOverride (or calculated purchasePrice x quantity) across all wines
- Total Current Value: sum of totalValueOverride (or calculated currentEstValue x quantity) across all wines
- Net Gain/Loss: Total Current Value minus Total Cost Basis, shown as dollar amount and percentage with green/red color coding
- Bottles at Peak: wines currently in their peak drinking window (populates after Phase 5 enrichment)

### CSV Export

Full-fidelity inventory export for insurance appraisal or auction submission.
- Button: "Export CSV" on cellar list page
- API route: GET /api/wines/export (auth-required, userId-scoped)
- Exports all wine fields including: producer, wineName, vintage, country, state, region, subRegion, vineyard, classification, varietal, style, format, quantity, purchasePrice, currentEstValue, totalCost, totalEstValue, purchaseDate, vendor, storageLocation, drinkWindowStart, drinkWindowEnd, rating, tastingNotes, pairingNotes, notes, wineId, consumedQuantity, isFullyConsumed
- Filename: wine-butler-export-YYYY-MM-DD.csv

### Consumed Wine Tracking

Users mark wines as consumed rather than deleting, retaining a drinking history.

UI - Wine Detail Page:
- "Mark as Consumed" button opens dialog: quantity (default 1, max = remaining), date, occasion, notes, personal rating
- Creates ConsumptionLog entry, increments consumedQuantity, sets isFullyConsumed if fully depleted
- Consumption history section shows past events with date, occasion, notes, rating

UI - Cellar List:
- Default view: "In Cellar" (isFullyConsumed = false)
- Toggle: "In Cellar" / "All" / "Consumed"
- Partial consumption badge: "2 of 3 remaining"

Dashboard:
- "Recently Enjoyed" section showing last 5 consumption log entries

---

## Section 11 - MVP Scope & Phasing (Updated)

Pre-Phase 4 additions (implemented as part of Phase 3 follow-up):
- Vineyard field and vineyard extraction in import pipeline
- State/Province field with country inference
- Combined region/sub-region splitting on import
- Style inference (deterministic, varietal-based)
- Total Cost / Total Value override fields for imports
- Total Inventory Value summary on dashboard (cost basis, current value, gain/loss)
- CSV export (full-fidelity, insurance/auction use case)
- Consumed wine tracking (consumption log, partial consumption, drinking history)

Phase 4 (AI Assistant) scope unchanged. These additions give the assistant richer wine data to work with.
