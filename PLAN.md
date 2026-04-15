<!-- /autoplan restore point: /Users/yaroslavpikiner/.gstack/projects/CodeAcee-lumisalon/main-autoplan-restore-20260415-031236.md -->
LumiSalon — Office Hours Assessment                                                                  
                                                                                                       
  The honest state of the product: right now this is a record-keeping app. You log what happened after 
  it happened. Real salon owners need to manage what's about to happen. That's the gap.                
                                                                                                       
  What's working well                                                                                  
                                                                                                       
  The foundation is solid. Auth, CRUD for clients/masters/procedures, location filtering, photo        
  uploads, i18n (EN + UK), multi-theme dark mode. That's probably 6 weeks of work and it's clean. The  
  Supabase integration is structured well, data model makes sense.                                     
                                                                                                       
  The UI is polished for where it is. The home screen with stats, the filter sheet, the skeleton       
  loaders — these show product taste.
                                                                                                       
  The critical missing piece: forward-looking scheduling                                               
   
  Every salon owner's day starts with "who's coming in today." Your app can tell them what happened    
  last week. It can't tell them what's happening in 2 hours.                                         
                                                                                                       
  The Appointment type in src/types/index.ts exists but there's no screen for it. There's no calendar. 
  There's no "book a slot" flow. This is the core workflow for a paying customer.
                                                                                                       
  Without a calendar, your app is optional. With a calendar, your app is the first thing they open     
  every morning.
                                                                                                       
  The second gap: money                                     

  MasterResponse has a revenue field in the DTO but it's never populated, never shown. ServiceResponse 
  has no price field. You can't track income at all right now.
                                                                                                       
  A small salon owner's top question is: "How much did I make this month? How much did each master     
  bring in?" If you can answer that, you have a product worth paying for. Right now you can't.
                                                                                                       
  Fix: add price: number to ServiceResponse and CreateServiceRequest in src/types/dto.ts, add it to the
   Supabase schema, and surface a simple revenue total on the home stats row next to today's count.
                                                                                                       
  The third gap: multi-user access                          

  All data is user_id scoped to one account. A salon owner with 3 masters can't give each master access
   to their own schedule. They can't have a receptionist logging procedures.
                                                                                                       
  This is a harder architectural lift — probably later. But it's worth knowing it's a constraint.      
   
  What to build first (priority order)                                                                 
                                                            
  1. Service prices + revenue on home screen — 2-3 days. Add price field to the service model, update  
  the form, show "Revenue today" on StatsRow. Immediate visible value, no architectural changes needed.
                                                                                                       
  2. Calendar / day view — 1-2 weeks. A simple day-picker showing procedures for that day, with the    
  ability to book a new one from that view. This is the feature that makes you sticky.
                                                                                                       
  3. Simple analytics screen — 1 week after calendar. Revenue by week, by master, by service. A 5th tab
   or a section in Settings. This is what converts a trial user to a paying user.
                                                                                                       
  Monetization path                                         

  For a small salon owner target:                                                                      
   
  - Free tier: 1 location, up to 50 procedures/month, 2 masters. Enough to try it for real.            
  - Pro: ~$15/month or ~$150/year: Unlimited everything, revenue reports, photo uploads over 1GB.
  - Team (later): ~$35/month: Multi-user access for masters + receptionist.                            
                                                                                                       
  The market is underserved in Ukraine/Eastern Europe specifically. Most competitors (Fresha, Booksy)  
  are expensive and complex. You have a quality UI advantage.

---

## AUTOPLAN CEO REVIEW — Phase 1

### Step 0A: Premise Challenge

| Premise | Status | Evidence |
|---------|--------|----------|
| "This is a record-keeping app" | VALID | Code confirmed: `Appointment` type in `src/types/index.ts` has ZERO implementation (no screen, no service, no store actions, no tab) |
| "ServiceResponse has no price field" | VALID | Confirmed in `src/types/dto.ts`: no price field |
| "MasterResponse.revenue is never populated" | VALID | DTO has `revenue: number` but no DB column, never calculated |
| "Services are a catalog you can price" | INVALID — CRITICAL MISS | `procedures.services` is just `text[]` of free-text strings. NO services table in Supabase schema. No `services.service.ts`. No service management UI. "Add price to ServiceResponse" requires building the entire services catalog from scratch first. |
| "Calendar / day view — 1-2 weeks" | LIKELY WRONG | Production calendar with conflict detection is 4-8 weeks. The 1-2 week estimate assumes a trivial date picker. |
| "Ukraine/Eastern Europe is underserved" | STATED, NOT EVIDENCED | No competitive audit cited. |
| "Owner is the primary user" | UNVALIDATED | Multi-user need could be a day-1 blocker in salons with 2+ masters. Zero interviews cited. |

### Step 0B: What Already Exists (Code Leverage Map)

| Sub-problem | Existing code | Gap |
|-------------|--------------|-----|
| Revenue on StatsRow | `StatsRow` component, 2 cards ready | Need price data to sum; need a 3rd card |
| Price field in types | `ServiceResponse`, `CreateServiceRequest` in dto.ts | Missing `price` field (1-line add to type; but table doesn't exist) |
| Services catalog | `services: ServiceResponse[]` in store (empty, never loaded from DB) | No DB table, no Supabase service file, no UI, no store actions that load from Supabase |
| Appointment/calendar | `Appointment` type in `src/types/index.ts` | No screen, no service, no store methods, no tab — 0% implemented |
| Supabase schema | 5 tables: profiles, locations, masters, clients, procedures | Missing: services table (no schema, no RLS) |
| Analytics screen | None | Needs new tab or settings section, new DB queries |

### Step 0C: Dream State

```
CURRENT (record-keeping only):
  Owner logs procedures after the fact
  No revenue visibility, no schedule

THIS PLAN (if all 3 features ship):
  Revenue tracking + day view scheduling + analytics
  "What's happening now + how much am I making?"

12-MONTH IDEAL:
  Salon owner opens app every morning for today's schedule
  Checks weekly revenue by master before payroll
  Pays Pro tier because it saves 1 hour/day vs paper/WhatsApp
```

Delta from this plan to 12-month ideal: multi-user access + client-facing booking. Both deferred. This plan gets to "useful daily tool" but not "the system the whole salon runs on."

### Step 0C-bis: Implementation Alternatives

| Approach | Effort (human) | Effort (CC+gstack) | Risk |
|----------|---------------|---------------------|------|
| A) Full services catalog + native calendar | 6-10 weeks | 2-3 weeks | Medium — right foundation but timeline risk |
| B) Adapt procedure flow (allow future dates as "appointments") | 1-2 weeks | 3 days | Low — 80% of calendar value, no new architecture |
| C) Google Calendar integration + own revenue/analytics UI | 2-3 weeks | 1 week | Low — calendar UX users trust + own revenue dashboard |

TASTE DECISION #1: Calendar approach — B vs C are both viable. A is risky on timeline.

### CEO Dual Voices

**CLAUDE SUBAGENT — 7 findings:**

1. [CRITICAL] Platform framing: "Quality UI" is not a durable moat. Ukrainian localization (UAH billing, LiqPay/Monobank rails, Diia integration, UA-language-first) is the defensible moat — dedicate one section of the plan to this explicitly.

2. [CRITICAL] Owner-as-primary-user is unvalidated. Multi-user may be day-1 blocker for salons with 2+ masters. Do 5 interviews before building the calendar.

3. [HIGH] Monetization pricing has no market validation. $15/month = 600 UAH. Run a landing page pricing test in UA beauty Facebook groups (2 weeks, ~$0) before committing.

4. [HIGH] Calendar timeline is wrong. 4-8 weeks for production quality. Consider option B (adapt procedures, 3 days) or C (GCal integration, 1 week) first.

5. [HIGH] Revenue tracking is the conversion driver. Gate analytics behind Pro paywall immediately on launch — measure whether users hit it and convert.

6. [MEDIUM] No scenario planning / pre-mortem. Write failure scenarios before Q3 work begins.

7. [MEDIUM] "Eastern Europe underserved" is asserted without evidence. Do 4-hour competitive audit in UA App Store + beauty forums.

**CODEX:** Not available (not installed). [subagent-only]

### CEO CONSENSUS TABLE

```
CEO DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude   Subagent  Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Premises valid?                   PARTIAL  PARTIAL  PARTIAL (services catalog miss is critical)
  2. Right problem to solve?           YES      YES      CONFIRMED (scheduling + revenue = right)
  3. Scope calibration correct?        NO       NO       CONFIRMED DISAGREE (both say underestimated)
  4. Alternatives sufficiently explored? NO     NO       CONFIRMED DISAGREE (GCal/adapt-procedure missing)
  5. Competitive/market risks covered? NO       NO       CONFIRMED DISAGREE (UA moat underdeveloped)
  6. 6-month trajectory sound?         PARTIAL  PARTIAL  PARTIAL (deferred multi-user may bite early)
═══════════════════════════════════════════════════════════════
```

### Error & Rescue Registry

| Risk | Likelihood | Impact | Rescue |
|------|-----------|--------|--------|
| Services catalog scope balloons | HIGH | Delays Feature 1 by 2x | Scope: services list with price only, skip categories/duration initially |
| Calendar takes 4-8 weeks | HIGH | Q3 miss | Use approach B or C first; native calendar is v2 |
| Multi-user is a day-1 need | MEDIUM | High churn before conversion | Interview 5 owners before calendar sprint |
| $15/month too high for UA | MEDIUM | No conversions | Landing page pricing test before paywall launch |
| Existing procedures have $0 revenue | CERTAIN | Analytics misleading at launch | Show revenue only from a cutoff date ("since you added prices") |

### Failure Modes Registry

| Failure | Signal | Trigger |
|---------|--------|---------|
| App stays optional (no daily habit) | DAU < 20% of registered users | No calendar shipped by month 2 |
| Zero Pro conversions | 0 paywall hits in first 30 days | Analytics never gated or pricing wrong |
| Multi-user churn | >60% trial churn in week 1 | Salon owners can't share with masters |

### NOT in Scope (deferred)

- Multi-user / team accounts (architectural lift, validate first via interviews)
- Client-facing booking (online self-booking by clients)
- Telegram/WhatsApp bot integration
- Cross-location revenue rollup
- UA payment rails (LiqPay, Monobank) integration

### CEO Completion Summary

| Category | Finding | Severity | Decision |
|----------|---------|----------|----------|
| Services catalog missing | "Add price" = build whole catalog first | CRITICAL | Auto: expand scope definition |
| Calendar timeline wrong | 1-2 weeks is not realistic | HIGH | TASTE DECISION #1 (surfaced at gate) |
| Revenue = conversion driver | Gate analytics behind paywall immediately | HIGH | Auto-approved |
| UA market needs audit | 4-hr competitive check needed | MEDIUM | Deferred to TODOS |
| Monetization unvalidated | Landing page test before paywall | MEDIUM | Deferred to TODOS |
| Multi-user may be blocker | 5 interviews before calendar sprint | CRITICAL | USER CHALLENGE #1 (surfaced at gate) |

---

## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|-----------|-----------|----------|---------|
| 1 | CEO | Expand "services" scope to include full catalog build | Mechanical | P1, P5 | No catalog = no pricing = feature is impossible | Skip catalog, just add DTO field |
| 2 | CEO | Gate analytics behind Pro paywall immediately on ship | Mechanical | P1, P3 | This is the conversion signal; delay = lost learning | Wait until after calendar |
| 3 | CEO | Defer UA competitive audit to TODOS | Mechanical | P6 | 4hr research, important but not a sprint blocker | Block sprint |
| 4 | CEO | Defer UA pricing validation to TODOS | Mechanical | P3, P6 | Post-ship landing page test | Block paywall launch |
| 5 | CEO | Calendar approach: B (adapt existing flow) | Resolved by user | P5 | User chose adapt-procedure-flow (3 days) over native calendar | A (native), C (GCal) |
| 6 | CEO | Multi-user: do 5 interviews before calendar sprint | Resolved by user | P1 | User confirmed: validate before building | Defer without validation |

---

## AUTOPLAN DESIGN REVIEW — Phase 2

### Step 0: Design Scope Assessment

Initial design completeness: 3/10 — plan names surfaces but doesn't specify states, layouts, or interaction models.

DESIGN.md exists and is thorough. Key constraints: 4-tab nav (no 5th tab), StatsRow with 2 cards, FAB at bottom-right, existing FilterSheet for date range, `SkeletonCard` for loading states, `ListCard` for settings rows.

### Design Dual Voice

**CLAUDE SUBAGENT — 12 findings:**

**[CRITICAL] StatsRow layout breaks at 3 cards.** Two `flex: 1` cards fit 375px. Three = ~113px each — too narrow for `€1,240.00` in `FontSize.title`. Fix: Replace "Today's count" with "Revenue today" (keep 2 cards). Revenue is more useful than raw count.

**[CRITICAL] Revenue computation scope undefined.** Which locationId? What about historical procedures with $0 prices? Fix: `sum(service.price) for procedures where date=today AND locationId=activeLocationId`. Show `"(no prices set)"` in `textTertiary` when zero. Show `"partial — X procedures without prices"` in `warning` color when some exist.

**[CRITICAL] Services entry point unspecified.** 5th tab crowds the nav. Settings > Services is the right call — matches existing settings row pattern, uses `ListCard`, FAB to add new service.

**[HIGH] Price field interaction.** `keyboardType="decimal-pad"`, currency symbol prefix in `textSecondary`, `fontVariant: ['tabular-nums']` everywhere, required (not optional). Currency: pull from locale or hardcode for MVP — commit to one.

**[HIGH] Procedure migration: free-text → catalog.** Legacy procedures stay as plain text strings (unlinked). New procedures use multi-select service picker sheet (BottomSheet, same pattern as MasterSelectSheet). If catalog is empty: show "Add services in Settings" inline prompt, don't block form. Position field retired — service selection sets position implicitly.

**[HIGH] "Book ahead" button conflicts with FAB.** Finding: FAB already navigates to procedure creation. Just remove the `maximumDate` constraint in the date picker — no new button needed. This is literally a 1-line change.

**[HIGH] Day picker interaction model undefined.** 5-day horizontal chip strip above procedure list (in `ListHeaderComponent`, between StatsRow and list). Each chip: day abbreviation + date number. Selected: `bgChipActive`. Selecting sets `activeDayFilter: string | null` (NEW separate store field — NOT dateFrom/dateTo to avoid FilterSheet collision). "All" chip at position 0 clears it.

**[HIGH] Analytics paywall has no design spec.** Semi-transparent overlay (`bgPrimary` at 85% opacity) over skeleton chart placeholders. Centered card: `warning`-colored "Pro feature" label + CTA button in `accent` color. Don't ship a gated feature without defining the gate.

**[HIGH] Chart library unspecified.** Options: `victory-native` (Reanimated-compatible) or plain `View`-based horizontal fill bars. TASTE DECISION #2.

**[HIGH] Missing states — all 3 features.** Services: empty state (0 services) + skeleton loading + error. Day view: "no procedures today" empty state (different from "no procedures ever"). Analytics: loading skeleton + $0 revenue empty state + fetch error. Pattern: use existing `SkeletonCard` + Sparkles-style empty state (already exists in home screen).

**[MEDIUM] Procedure total price before submission.** Show `sum(selectedServices.price)` as a read-only "Total" row above `BottomActionBar`. `fontVariant: ['tabular-nums']`, `FontSize.title`. Hide row if no services have prices (don't show "Total: €0.00").

**[MEDIUM] Day picker vs FilterSheet state collision.** `activeDayFilter` is separate from `procedureFilters.dateFrom/dateTo`. Applied with AND logic on top of existing filters. FilterSheet stays for power-user date ranges.

**CODEX:** Not available. [subagent-only]

### DESIGN LITMUS SCORECARD (Consensus Table)

```
DESIGN DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude   Subagent  Score
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Information hierarchy            4/10     4/10    4/10 — StatsRow 3-card layout breaks
  2. Missing states                   2/10     2/10    2/10 — Zero states defined in plan
  3. User journey                     6/10     6/10    6/10 — Flow clear but gaps at transitions
  4. Specificity                      3/10     3/10    3/10 — Names surfaces, no interaction detail
  5. Implementer ambiguity            3/10     3/10    3/10 — 12 unspecified decisions
  6. Design system alignment          7/10     7/10    7/10 — DESIGN.md exists, patterns exist
  7. Responsive/accessibility         5/10     5/10    5/10 — Not addressed for new surfaces
═══════════════════════════════════════════════════════════════
Overall design completeness before fixes: 4/10 → After applying all fixes: 8/10
```

### Auto-Decided Design Issues

| # | Issue | Decision | Principle |
|---|-------|----------|-----------|
| D1 | StatsRow 3-card layout | Replace "Today's count" with "Revenue today" (keep 2 cards) | P5 |
| D2 | Revenue scope | sum(service.price) for activeLocationId + today, with partial/empty states | P1 |
| D3 | Services nav entry | Settings > Services route, not 5th tab | P5 |
| D4 | Price field | required, decimal-pad, currency prefix, tabular-nums | P1 |
| D5 | "Book ahead" button | Not needed — remove future date constraint (1-line), reuse FAB | P5 |
| D6 | Day picker | 5-chip strip, activeDayFilter separate state | P5 |
| D7 | Missing states | Apply existing SkeletonCard + Sparkles empty state patterns | P1 |
| D8 | Paywall locked state | Semi-transparent overlay + CTA card in accent color | P1 |
| D9 | Procedure migration | Legacy = text, new = catalog multi-select, empty catalog shows "Add services" prompt | P5 |
| D10 | Procedure total | Read-only sum row above BottomActionBar, hidden if $0 | P1 |
| D11 | FilterSheet collision | activeDayFilter as new separate store field | P5 |

**TASTE DECISION #2: Chart library — victory-native vs plain View-based bars.** (Will surface at final gate)

### Phase 2 Completion Summary

Design issues found: 12. Auto-decided: 11. Taste decisions: 1. Updated design completeness: 8/10.

Biggest wins from this phase:
1. "Book ahead" button is not needed — the FAB + future-date unlock is a 1-line change
2. StatsRow must stay at 2 cards — swap Revenue for Today's count
3. Services lives in Settings, not a new tab
4. Day picker needs its own store field to avoid FilterSheet collision

---

**PHASE 2 COMPLETE.** Subagent: 12 issues. Consensus: 7/7 confirmed (single reviewer). Passing to Phase 3.

### Design Audit Trail additions

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|-----------|-----------|----------|---------|
| 7 | Design | Replace "Today's count" with "Revenue today" in StatsRow | Mechanical | P5 | 3 cards break layout math | Add 3rd card |
| 8 | Design | Services in Settings > Services (not 5th tab) | Mechanical | P5 | 4-tab constraint in DESIGN.md | New tab |
| 9 | Design | "Book ahead" = remove future date constraint only (not new button) | Mechanical | P5 | FAB already does the job; 1-line change | New button |
| 10 | Design | Day picker: activeDayFilter new store field, separate from dateFrom/dateTo | Mechanical | P5 | Avoids FilterSheet state collision | Override existing filters |
| 11 | Design | Paywall: semi-transparent overlay + accent CTA card | Mechanical | P1 | Can't ship gated feature without gate design | TBD later |
| 12 | Design | Chart library: victory-native vs plain View bars | TASTE DECISION | — | Both viable | — |

---

## AUTOPLAN ENG REVIEW — Phase 3

### Step 0: Scope Challenge

Code read: `src/store/app.ts`, `src/types/dto.ts`, `supabase/schema.sql`, `app/procedure/create.tsx`, `app/(tabs)/index.tsx`, `src/services/supabase/procedures.service.ts`, `package.json`.

3 critical blockers found that must be resolved before any feature code can run:

1. `ServiceResponse` has no `price` field (DTO + schema)
2. Revenue cannot be computed from paginated client-side list (needs server RPC)
3. No join between `procedures` and `services` (text[] only)

### Architecture ASCII Diagram

```
                          LumiSalon — Feature Architecture

  ┌─────────────────────────────────────────────────────────────────────┐
  │  SUPABASE DATABASE                                                   │
  │                                                                      │
  │  ┌──────────┐    ┌──────────┐    ┌──────────────────┐              │
  │  │ profiles │    │ services │NEW │ procedure_services│NEW           │
  │  │ is_pro   │NEW │ price    │    │ procedure_id FK  │              │
  │  └──────────┘    │ user_id  │    │ service_id FK    │              │
  │                  └────┬─────┘    └────────┬─────────┘              │
  │                       │                   │                         │
  │  ┌──────────┐    ┌────┴──────────────────┴────────────────────┐    │
  │  │ masters  │    │ procedures                                   │    │
  │  │          │◄───│ master_id, client_id, location_id, date     │    │
  │  └──────────┘    │ services text[] (legacy, read-only)         │    │
  │                  │ service_ids uuid[] (NEW — revenue source)   │    │
  │                  └───────────────────────────────────────────── ┘    │
  │                                                                      │
  │  RPC: get_revenue_today(user_id, location_id, date) → numeric NEW   │
  │  INDEXES: (user_id, date), (user_id, master_id) NEW                 │
  └─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┘
                    │
  ┌─────────────────▼──────────────────────────────────────────────────┐
  │  SUPABASE SERVICES (src/services/supabase/)                         │
  │                                                                      │
  │  services.service.ts NEW    procedures.service.ts (updated)          │
  │   getAll, create,            getPaged + service_ids join            │
  │   update, delete             get_revenue_today RPC call             │
  └────────────────────────────────────────────────────────────────────┘
                    │
  ┌─────────────────▼──────────────────────────────────────────────────┐
  │  ZUSTAND STORE (src/store/app.ts)                                   │
  │                                                                      │
  │  services: ServiceResponse[]   loadServices() NEW                   │
  │  activeDayFilter: string|null  setActiveDayFilter() NEW             │
  │  todayRevenue: number          loadTodayRevenue() NEW               │
  │  (loadAllData: includes loadServices call)                          │
  └────────────────────────────────────────────────────────────────────┘
                    │
  ┌─────────────────▼──────────────────────────────────────────────────┐
  │  SCREENS / COMPONENTS                                                │
  │                                                                      │
  │  Home (index.tsx)             Settings > Services (NEW)             │
  │  ├─ StatsRow: Revenue+Masters ├─ ServiceList (ListCard rows)        │
  │  ├─ DayChipStrip (NEW)        └─ FAB → /settings/services/create    │
  │  └─ ProcedureList (existing)                                        │
  │                                                                      │
  │  Procedure Create/Edit (updated)  Settings > Analytics (NEW)        │
  │  ├─ ServicePickerSheet (NEW)      ├─ Pro paywall overlay            │
  │  ├─ Zod: serviceIds field (NEW)   ├─ RevenueBarChart (SVG Rect)     │
  │  └─ "Total: €X.XX" row (NEW)     ├─ MasterRevenueList              │
  │                                   └─ ServiceRevenueList             │
  └────────────────────────────────────────────────────────────────────┘
```

### Eng Dual Voice

**CLAUDE SUBAGENT — 13 findings (3 critical, 6 high, 4 medium):**

**[CRITICAL] No price in ServiceResponse or schema.** `ServiceResponse { id, name, position, duration?, description? }` — no `price`. Add `price: number` to DTO + `services` table in schema.sql with `price numeric(10,2) not null`. Also add RLS: `all for user_id`.

**[CRITICAL] Revenue computed from paginated list — wrong.** `todayCount` uses `procedures[]` which is a 20-item page, not all day's procedures. A salon with 21+ procedures today will silently undercount. Fix: Supabase RPC `get_revenue_today(user_id, location_id, date) → numeric`. Separate store action `loadTodayRevenue`. Do not compute from client paginated list.

**[CRITICAL] No join table for procedure→services.** `procedures.services` is `text[]` (free-text). Revenue sum requires `SUM(services.price)` joined to procedures. Add `service_ids uuid[]` column to `procedures` (or `procedure_services` join table). For new procedures: write to `service_ids`. Legacy: keep `services text[]` read-only for display. Store `Procedure` type needs `serviceIds?: string[]`.

**[HIGH] activeDayFilter conflicts with dateFrom/dateTo.** When `activeDayFilter` is set, it must override (not AND with) `dateFrom`/`dateTo`. Remove `activeDayFilter` from `listHeader` useMemo dependency gaps — re-subscribe explicitly.

**[HIGH] victory-native not installed.** Conflicts with Reanimated 4.1.1. Use plain `react-native-svg` `<Rect>` elements for bar chart — sufficient for 4-bar weekly chart. No new dependency needed (SVG already installed).

**[HIGH] loadServices missing from store.** Services array is always empty at runtime. Create `services.service.ts` (copy pattern from `clients.service.ts`). Add `loadServices` to store. Add to `loadAllData` Promise.all. Guard ServicePickerSheet with "No services yet" empty state.

**[HIGH] Date comparison is timezone-buggy.** `procedures.date` stored as ISO timestamp. `dateTo = "2025-04-15"` cuts off procedures after midnight UTC. Fix: construct `dateTo` as `"2025-04-15T23:59:59"` for day-chip filter, document timezone policy in procedures.service.ts.

**[HIGH] Zod schema missing serviceIds.** Add `serviceIds: z.array(z.string().uuid()).min(1)` to `procedureSchema` in `src/lib/schemas.ts`. Manage via Controller/setValue in form. Do NOT use separate useState for picker state.

**[HIGH] Pro paywall is UI-only — data still transmitted.** Revenue data is sent to client even with overlay. Add `is_pro boolean default false` to `profiles`. Enforce via Supabase RLS on analytics function or Edge Function. UI paywall alone is not acceptable for financial data.

**[HIGH] 5-tab iOS limit.** `unstable-native-tabs` collapses 5+ tabs into "More" (non-customizable). Place Analytics at `settings/analytics` route (row in Settings tab), not a new tab. Matches design decision D3.

**[MEDIUM] services.service.ts patch pattern.** Copy the defensive patch pattern from `procedures.service.ts` (only include provided keys). Do NOT use `update.duration ?? null` pattern from `clients.service.ts`.

**[MEDIUM] No DB indexes for analytics queries.** Add: `create index procedures_user_date_idx on procedures(user_id, date)` and `procedures_user_master_idx on procedures(user_id, master_id)`.

**[MEDIUM] addProcedure doesn't sort.** Prepends to front even if past-dated procedure. Fix: `[created, ...s.procedures].sort((a, b) => b.date.localeCompare(a.date))`.

**[MEDIUM] services.service.ts CRUD needs delete.** Plan doesn't mention delete, but a service that's been used in procedures can't be safely deleted (breaks revenue history). Add soft-delete (`archived: boolean`) to services, not hard delete.

**CODEX:** Not available. [subagent-only]

### ENG CONSENSUS TABLE

```
ENG DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude   Subagent  Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Architecture sound?               NO       NO      CONFIRMED DISAGREE (3 critical schema gaps)
  2. Test coverage sufficient?         NO       NO      CONFIRMED DISAGREE (no tests exist yet)
  3. Performance risks addressed?      NO       NO      CONFIRMED DISAGREE (pagination + no indexes)
  4. Security threats covered?         NO       NO      CONFIRMED DISAGREE (paywall is UI-only)
  5. Error paths handled?              PARTIAL  PARTIAL PARTIAL (some exist, new surfaces missing)
  6. Deployment risk manageable?       YES      YES     CONFIRMED (additive schema changes, safe)
═══════════════════════════════════════════════════════════════
```

### Test Diagram

```
CODEPATH                              TEST TYPE        EXISTS?  COVERAGE
─────────────────────────────────────────────────────────────────────────
services.service.ts.getAll()          Unit/Integration  NO      GAP
services.service.ts.create()          Unit/Integration  NO      GAP
services.service.ts.update()          Unit/Integration  NO      GAP (patch pattern risk)
loadServices() store action           Unit              NO      GAP
loadTodayRevenue() store action       Unit              NO      GAP (critical correctness)
get_revenue_today RPC                 Integration       NO      GAP (server-side SQL)
addProcedure with serviceIds          Unit              NO      GAP
addProcedure sort order               Unit              NO      GAP
activeDayFilter overrides dateFrom    Unit              NO      GAP
procedureSchema serviceIds validation Unit              NO      GAP
is_pro enforcement in RLS             Integration       NO      GAP (security-critical)
StatsRow 3rd card renders revenue     Component         NO      GAP
ServicePickerSheet empty state        Component         NO      GAP
Analytics paywall overlay shows       Component         NO      GAP
DayChipStrip selection updates filter Component         NO      GAP
Existing: getUserId() throws if null  Unit              NO      RECOMMENDED (from CLAUDE.md)
Existing: getFilteredClients()        Unit              NO      RECOMMENDED (from CLAUDE.md)
Existing: loadProceduresPage guards   Unit              NO      RECOMMENDED (from CLAUDE.md)
```

### NOT in Scope (deferred)

- Client-facing booking (online self-booking)
- Telegram/WhatsApp integration
- Cross-location revenue rollup
- Multi-user access (pending 5-interview validation)
- Supabase Edge Functions for analytics (phase 2 security hardening)

### Failure Modes Registry (Eng additions)

| Failure | Signal | Fix |
|---------|--------|-----|
| Revenue shows wrong (pagination bug) | Revenue ≠ manual sum | Use server RPC, not client sum |
| ServicePicker shows blank | Procedures with no service_ids | Guard with empty state + load guard |
| Analytics data leaks through UI | User bypasses overlay | is_pro RLS enforcement |
| Day chip filter misses late-day procedures | Missing midnight-timezone edge | dateTo = "YYYY-MM-DDT23:59:59" |
| Service delete breaks revenue history | Historical $0 revenue | Soft delete (archived) only |

### What Already Exists (Eng)

| Need | What exists | Gap |
|------|-------------|-----|
| Future date in procedure form | `maximumDate: Date.now() + 365d` already in create.tsx:295 | NONE — just need to remove display constraint on home "today" filter |
| SVG for charts | react-native-svg 15.12.1 | No chart component built yet |
| Service CRUD in store | setServices, addService | No loadServices, no Supabase service file |
| Paywall profile field | profiles table exists | No is_pro column |

### Eng Completion Summary

| Category | Finding | Severity | Decision |
|----------|---------|----------|----------|
| Revenue RPC needed | Can't sum from paginated list | CRITICAL | Auto: add get_revenue_today RPC |
| service_ids column needed | No join = no revenue calc | CRITICAL | Auto: add service_ids uuid[] to procedures |
| price in ServiceResponse | Missing DTO + schema | CRITICAL | Auto: add price numeric(10,2) |
| Chart library | victory-native not installed | HIGH | Auto: plain SVG Rect (P5) |
| Paywall enforcement | UI-only is insecure | HIGH | Auto: add is_pro + RLS |
| loadServices action | Services always empty | HIGH | Auto: create services.service.ts + action |
| Date timezone bug | Day filter cuts off | HIGH | Auto: dateTo = "T23:59:59" |
| Zod schema | serviceIds missing | HIGH | Auto: add field |
| Analytics location | 5th tab breaks iOS | HIGH | Auto: Settings route (matches D3) |
| Service soft delete | Hard delete breaks history | MEDIUM | Auto: archived boolean |
| DB indexes | Analytics will be slow | MEDIUM | Auto: add 2 indexes |
| addProcedure sort | Past-date order wrong | MEDIUM | Auto: sort by date desc |

---

**PHASE 3 COMPLETE.** Subagent: 13 issues. Consensus: 1/6 confirmed, 4 DISAGREE, 1 PARTIAL. Passing to Phase 4 (Final Gate).

### Eng Audit Trail additions

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|-----------|-----------|----------|---------|
| 13 | Eng | Add get_revenue_today Supabase RPC | Mechanical | P1 | Client-side sum is wrong for paginated data | Client-side sum |
| 14 | Eng | Add service_ids uuid[] to procedures + join for revenue | Mechanical | P1 | text[] join is impossible for SQL sum | Keep text[] only |
| 15 | Eng | Add price numeric(10,2) to services table + DTO | Mechanical | P1 | Core feature requirement | Optional price |
| 16 | Eng | Chart: plain react-native-svg Rect elements | Mechanical | P5 | SVG already installed; no new deps needed | victory-native |
| 17 | Eng | is_pro on profiles + RLS enforcement | Mechanical | P1 | UI-only paywall exposes financial data | UI paywall only |
| 18 | Eng | Create services.service.ts + loadServices | Mechanical | P1 | Services always empty without it | Leave mock data |
| 19 | Eng | dateTo = "YYYY-MM-DDT23:59:59" for day filter | Mechanical | P5 | Timezone bug in day-boundary comparison | dateTo = date string |
| 20 | Eng | serviceIds: z.array(uuid).min(1) in procedureSchema | Mechanical | P5 | Zod manages form state correctly | Separate useState |
| 21 | Eng | Analytics at settings/analytics route | Mechanical | P5 | Avoids 5-tab iOS limit (matches D3) | 5th tab |
| 22 | Eng | Soft delete for services (archived boolean) | Mechanical | P3 | Hard delete breaks revenue history | Hard delete |
| 23 | Eng | Add (user_id, date) + (user_id, master_id) indexes | Mechanical | P1 | Analytics aggregations will timeout without | No indexes |
| 24 | Eng | Sort procedures after addProcedure by date desc | Mechanical | P5 | Past-dated procedures appear out of order | Leave unsorted |

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | issues_open | 7 (2 critical, 3 high, 2 medium) |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | issues_open | 12 (3 critical, 6 high, 3 medium) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open | 13 (3 critical, 6 high, 4 medium) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | skipped | No DX scope detected |
| Codex Review | `codex` | Independent 2nd opinion | 0 | unavailable | Codex not installed |

**VERDICT:** APPROVED with 30 auto-decisions. Start with Feature 1 (services catalog + revenue). Run `/ship` when Feature 1 is ready.

**Critical fixes required before any feature code:**
1. Add `services` table to `supabase/schema.sql` (price, user_id, RLS)
2. Add `service_ids uuid[]` to `procedures` table
3. Add `get_revenue_today` Supabase RPC
4. Add `price: number` to `ServiceResponse` and `CreateServiceRequest` in `src/types/dto.ts`
5. Create `src/services/supabase/services.service.ts`
