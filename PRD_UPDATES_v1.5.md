# Wine Butler IQ - PRD Updates v1.5

Changes and decisions since July 20, 2026 (post v1.4). No schema changes.

---

## Region-Hierarchy Validation (New Capability)

Built to catch region-tagging errors in imported wine data before they reach a user's cellar (the case that started this: a real wine tagged "Piemonte" when the correct answer was "Emilia-Romagna").

### Region level (country -> region) — done for all 21 eAmbrosia countries

Real, tested coverage against actual eAmbrosia PDO records:

| Country | Coverage |
|---|---|
| Italy | 407/408 (99.8%) |
| France | 361/361 (100%) |
| Spain | 89/99 (89.9%) |
| Portugal | 30/30 (100%) |
| Germany | 18/19 (94.7%) |
| Austria | 24/24 (100%) |
| Greece | 33/33 (100%) |
| Croatia | 17/18 (94.4%) |
| United Kingdom | 2/3 (66.7%) |
| Bulgaria | 48/52 (92.3%) |
| Romania | 39/40 (97.5%) |
| Hungary | 33/33 (100%) |
| Slovenia | 13/14 (92.9%) |
| Czech Republic | 11/11 (100%) |
| Slovakia | 8/8 (100%) |
| Belgium | 7/7 (100%) |
| Cyprus | 7/7 (100%) |
| Netherlands | 6/6 (100%) |
| Malta | 2/2 (100%) |
| Denmark | 1/1 (100%) |
| Luxembourg | 1/1 (100%) |

**Total: 1157/1177 (98.3%)**

### Subregion level (region -> subregion) — done for 8 of 21 countries (Italy partially: 2 of its 20 regions)

| Country | Coverage | Source |
|---|---|---|
| France | 340/361 (94.2%) | INAO's own product database (dedicated source, AOC track only) |
| Spain | 89/99 (89.9%) | Free reuse of existing region data (autonomous community, one level up) |
| Portugal | 30/30 (100%) | Free reuse (same method) |
| Germany | 18/19 (94.7%) | Free reuse (same method) |
| Austria | 24/24 (100%) | Free reuse (same method) |
| Greece | 33/33 (100%) | Free reuse (same method) |
| Croatia | 17/18 (94.4%) | Free reuse (same method) |
| Italy (Piedmont + Tuscany only) | 109/110 (99.1%) | Federdoc (Italy's national confederation of wine protection consortia) — the only two Italian regions it splits into named zones (Piedmont: Langhe/Monferrato/Asti/North; Tuscany: Tuscany/Antique Heart) |
| United Kingdom | N/A | No broader official government layer exists above the English regions already in place. A real, separate wine-trade grouping does exist (WineGB's 7 regional associations) but hasn't been built in, since eAmbrosia's only 3 UK entries are nationwide PDOs that a subregion wouldn't add precision to |

**Correction from the first version of this doc:** Italy was initially marked as having no subregion source at all. That was checked against the wrong body — Italy's ministry (MASAF) only groups by region, but Federdoc, the national wine-consortium confederation, does publish real named subzones, just only for Piedmont and Tuscany (its two DOCG-heaviest regions). The other 18 Italian regions are still genuinely 2-level (region = subregion), confirmed the same way, not assumed.

**Remaining 12 countries plus the other 18 Italian regions — deferred to a later phase, before commercial release, not before MVP:** Bulgaria, Romania, Hungary, Slovenia, Czech Republic, Slovakia, Belgium, Cyprus, Netherlands, Malta, Denmark, Luxembourg, and (if pursued) a WineGB-based UK subregion. These are real, not-yet-started pieces of work — same research-per-country method already proven eight times over, just not yet done. Not a blocker for anything currently planned; revisit before commercial launch.

**Italy specifically — find subregion sources for the other 18 regions (not optional, a committed later-phase task):** Federdoc only splits Piedmont and Tuscany today, but that doesn't mean the other 18 regions have no equivalent — it means Federdoc's own "production areas" page doesn't split them further. Before commercial release, each of the other 18 regions needs the same real check Piedmont and Tuscany got: look for a consortium, regional government, or trade-body source that groups that region's DOCs/DOCGs into named zones, the same way this was found for France (INAO) and Piedmont/Tuscany (Federdoc). Regions most likely to have one, based on DOCG/DOC density and known internal zone naming (e.g. Veneto's Valpolicella/Soave/Prosecco areas, Sicily's Etna/Vittoria/Marsala areas): Veneto, Sicily, Campania, Puglia, Emilia-Romagna. Not yet started for any of the 18 — real work, not a formality.

### Appellation level

Already present in the data today — eAmbrosia's PDO name field is the appellation itself (e.g., "Gigondas," "Colli di Scandiano e di Canossa"). No new source needed; needs wiring into the checker as its own labeled field.

---

## Out of Scope for This Update

- No changes to Sections 4.2, 6, or 11 of the PRD
- No schema, field, or feature changes
