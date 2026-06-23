# Expeditions — Combat & Exploration (Chapter 2+ endgame layer)

> **Status (2026-06-24): IMPLEMENTED & shipped.** This is the original design doc
> (locked decisions + open questions, written before any code). The system has
> since been built across Phases A–C and refined heavily. For how the code
> *actually* behaves now — 3-tab panel, 128px art, production-time pricing,
> single-instance gear/weapons, gear gating, Echo findings, first-run guide — see
> `GAME_CONTEXT.md` (the living source of truth). Kept here for design rationale,
> the locked forks, and intent behind the mechanics.

A combat/exploration system gated behind a fully-running factory. Design-only so far;
NO code written yet. This doc captures locked decisions + open questions.

## Premise
Once all factory machines are built and running, the Extractor "breaks through" and a
new LOCATIONS facility appears: **The Undercroft** (working name). From there the player
dispatches expeditions into the deeper, impossible office to find the "way out" Chapter 2
promised. Expeditions tie every resource together and bring back things the factory can't
make: materials, map fragments, and "pieces of the way out."

## LOCKED FORKS
- **Fork 1 — Who goes: HYBRID (mind + shell).**
  - **Mind** (precious): printed from **paper + PP + lucidity**. Levels up, carries XP,
    is the part you protect.
  - **Shell** (expendable body): crafted from **substrate + a material core**. Commonly
    wrecked, cheaply rebuilt — keeps materials flowing.
  - **Gear**: Instruments (intelligence-cored, exploration/dark), Wards/Weapons
    (rare-material + lucidity, combat), Provisions (energy/sanity/clarity consumables).
  - Fuse mind + shell + gear into an expeditioner.
- **Fork 2 — Loss model: PERMANENT.** Catastrophic failure ends the **mind** for good.
  Shell is rebuildable. Risk must be telegraphed pre-launch so a death feels earned.
- **Fork 3 — Combat depth: A+C.** Idle resolution log + intervention prompts at deadly
  moments + a pre-launch risk readout.

## LOCKED MAP STRUCTURE — pixel-art chart
The map IS a pixel-art artifact the player paints by exploring (reuses the procedural
sprite pipeline: seeded gen, RLE, palette, 4-frame animation, compositeToCanvas).

- **Multi-page tiered chart.** Each page is a **128x128** pixel "page" = one depth tier.
  Each **Gateway** opens a fresh **blank** page (deliberately echoes Chapter 2's opening
  blank screen). Required core rarity steps up per page → ratchets Transmuter pressure.
- **Per-page anatomy:**
  - Seeded deterministic layout, hidden under **fog**.
  - **Entry point** on one edge (where the previous Gateway dropped you). Distance from
    entry = depth = danger + required core rarity. Palette shifts muted-charcoal (home)
    -> corrupted void-violet (frontier).
  - Nodes: **Cache** (loot box), **Haunt** (combat; jagged eye -> X if cleared),
    **Echo** (lore rune), **Anomaly** (high-risk/high-reward), and exactly one hidden
    **Gateway** (arch) leading deeper.
  - Page is "beaten" when you **find + breach the Gateway** (needs a rarer core than the
    page's other nodes).
- **Discovery model — HYBRID, two expedition verbs:**
  - **Survey**: cheap, heading-based ("push into the dark" + distance), Instrument-heavy,
    low combat. Paints faint scouting threads, reveals fog swaths, uncovers nodes
    (incl. the Gateway).
  - **Delve**: target a **known** node to exploit it (loot Cache / clear Haunt / breach
    Gateway). Expensive, Ward/Weapon-heavy. Draws a bold route + stamps an outcome glyph.
- **Outcome glyphs stamped on the chart:** charted route (ink line), Cache box, Haunt
  eye->X, Echo rune, Gateway arch, Anomaly flicker, and on catastrophe a **death-marker**
  with a frayed/bleeding unfinished route (permanent loss is *visible* on the map).
- **Storage/regeneration:** store a compact list of expedition records
  (seed, origin, heading/target, outcome, node type) + node list; **deterministically
  re-rasterize** each page (tiny save, fully reproducible, same approach as factory
  sprites). Composite = base charted pixels + animated overlays (active route draws
  itself in; Gateway/Exit glow; frontier shimmer).

## RESOURCE ROLES (every resource gets a job)
- **paper + PP** -> printing minds + charting/Survey costs (revived from early game).
- **substrate + materials** -> shells and gear cores.
- **void fragments + rarer materials (Transmuter)** -> gear cores + Gateway breach cores;
  deeper tiers demand rarer cores -> Transmuter's reason to exist.
- **intelligence** -> research gear/regions, decode Echo/loot, power Instruments/Survey.
- **lucidity** -> gates depth, animates minds, fuels Wards.
- **energy / sanity / clarity** -> Provisions (consumables, intervention saves).

## LOCKED GEAR + RECIPE MATRIX
Two-layer economy:
- **Research a blueprint** (one-time): costs **intelligence** (the unlock/knowledge gate).
- **Craft from a blueprint** (repeatable): costs **PP (universal build-labour) + specific
  resources/cores**. PP revived as the per-craft effort currency.

Capability stats vs threat axes (every node tests these):
- **Combat** -> countered by **Might** (Weapons)
- **Dark** (navigation) -> **Sight** + reveal/decode (Instruments)
- **Dread** (psychological) -> **Resolve** (mind level + Provisions)
- **Corruption** (void) -> **Wardstrength** = governs PERMANENT-LOSS odds (Wards)
- plus **Endurance** (depth/duration before forced return) and **Salvage** (loot quality).

Gear families + recipes (cores tier up by rarity):
- Instruments (Survey-side, intelligence-cored):
  - **Lantern** -> Sight/reveal radius. substrate + static_crystal
  - **Compass** -> map accuracy, fewer "lost" outcomes. paper + glitch_shard
  - **Decoder Lens** -> read Echoes (lore->intelligence + way-out pieces), identify a node
    pre-Delve. intelligence-heavy + reality_dust
- Weapons & Wards (Delve-side, rare-material + lucidity):
  - **Weapon** (office-junk themed) -> Might. substrate + glitch/reality core
  - **Ward** -> Wardstrength (anti-catastrophe, keeps minds alive). lucidity-heavy +
    temporal_core/essence
  - **Shell Plating** -> shell durability (saves rebuild materials; separate from mind
    survival). substrate-heavy + materials
- Provisions (one-shot, consumed per expedition):
  - **Rations** -> +Endurance. energy + paper
  - **Lucid Draught** -> +Resolve (mind sanity buffer mid-run; does NOT spend real sanity).
    lucidity + energy
  - **Clarity Charge** -> the **intervention save** (abort catastrophe at a deadly prompt).
    Sourced from meditation **clarity** -> meditation literally saves explorers.

## LOCKED WEAPON / BLUEPRINT ROLL SYSTEM (supersedes the deterministic "Weapon" entry above)
Weapons split OFF the deterministic research+craft path into a **gacha roll-to-discover** path.
- **Blueprint library is PERMANENT** (a different axis from mind permanence): roll a blueprint ->
  own it forever. Designs survive, people don't. Minds still reset on death; blueprints don't.
- A blueprint = a **(weapon type x rarity) pair**, owned forever. Craft physical weapons FROM it
  (cost: cores/materials). The crafted weapon is still lost on catastrophe with the mind ->
  rebuild from the owned blueprint (re-spend cores). Stakes intact.
- **Roll currency = intelligence** ("decode salvaged schematics") + optional **rare-material
  catalyst** to bias rarity odds upward (another Transmuter use).
- **Rarity = pure strength multiplier** on the type's base Might. Tiers (color-coded, escalating
  visual flair): Common -> Uncommon -> Rare -> Epic -> Legendary (-> maybe Mythic). Higher rarity
  = stronger + more elaborate pixel art.
- **Duplicate protection + soft pity:** rolling an owned (type,rarity) refunds some intelligence;
  pity guarantees a Rare+ every N rolls.
- **Scope: weapons-only.** Instruments/Wards/Plating/Provisions stay deterministic research+craft
  (reliable tools + the anti-death Ward); damage comes from the roll. (Could extend to Wards if
  more stakes wanted later.)

### Foe archetypes (populate Haunt nodes; shown pre-Delve via Decoder)
- **Swarm** ("Paper Wasps") — many weak; punishes single-target; cleave/line weapons shine.
- **Bulwark** ("Filing Golem") — slow/armored; needs burst/armor-pierce; light/fast bounce.
- **Flicker** ("Static Hound") — fast/evasive; needs fast/accurate or binding; heavy misses.
- **Phantom** ("Echo-thing") — incorporeal; resists physical; needs lucidity/ward-infused.
- **Corruptor** ("Void Maw") — void-aligned; attacks the MIND (Corruption); anchor/Corruption-
  bleed weapons help.

### Weapon roster (office-junk; lore + quirk; rarity multiplies Might)
- **Stapler-Pike** — balanced, slight armor-pierce -> vs Bulwark. (first bolted-together weapon)
- **Guillotine Cutter** (paper-cutter blade) — cleave -> vs Swarm; weak single Bulwark.
- **Letter-Opener Fan** — fast multi-hit -> vs Flicker; weak vs Bulwark.
- **Cubicle Maul** (partition chunk) — huge Might but COSTS Endurance -> burst vs Bulwark; bad vs
  Swarm/Flicker.
- **Toner Flail** — messy hits + **blind** -> cuts Flicker evasion.
- **Cable Lash** (server cables) — line/reach + **bind** -> vs Swarm; pins Flicker.
- **Lucid Lance** (lucidity-infused) — anti-**Phantom** + bleeds Corruption -> answer to Phantom/
  Corruptor (needs rarer cores).
- **Thermal Censer** (coffee-pot) — **damage-over-time** -> grinds Bulwark; clears Swarm.
Gacha depth: want a SPREAD of types to cover every archetype PLUS high rarities for raw power
(a Common Lucid Lance stays valuable vs Phantoms when a Legendary Maul can't touch them).

## LOCKED PIXEL-ART-EVERYWHERE PRINCIPLE (chapter-wide)
Almost every aspect of this chapter includes pixel art (procedural frame pipeline):
- The chart (pages, routes, node glyphs, animations) — already core.
- **Blueprint roll animation:** fabricator/printer sequence; dimensional static coalescing into a
  schematic; rarity telegraphed by color/intensity (Legendary = long glowing screen-filling reveal).
- **Blueprint Library modal (must look great):** gallery grid; each entry = weapon sprite +
  rarity glow border + type name + lore + stat line; filter/sort by type & rarity; Roll button
  triggers the animation.
- **Per-weapon-type sprites** with rarity visual flair (aura/material/embellishment).
- **Procedural pixel PORTRAITS per mind** (each veteran looks individual; death-marker has a face).
- Undercroft scene + breakthrough cinematic + gear/provision/node sprites.

Durability (LOCKED): Instruments/Weapons/Wards/Plating = **persistent equipment** (craft
once, equip on a kit). Provisions = consumed per expedition. Clean return salvages the kit;
**catastrophe loses the mind AND its equipped gear** -> loadout choices carry weight.

## LOCKED RISK / ODDS / INTERVENTION MODEL
- **Resolution = seeded sequence of encounters** across a duration (Endurance-scaled),
  resolving as factory ticks pass, appended to a live log. Survey = shallow/low-intensity
  (mostly Dark/navigation). Delve = target node's threat profile dominates. Each encounter
  tests ONE axis (Combat/Dark/Dread/Corruption) vs its counter (Might/Sight/Resolve/Wardstrength).
- **Damage accumulates, nothing one-shots:**
  - Shell integrity (HP): drained by Combat/strain; 0 -> shell wrecked, mind exposed (not death).
  - Mind Resolve (stamina): drained by Dread; 0 -> mind panics.
  - Corruption meter: built by void encounters, DIVIDED DOWN by Wardstrength.
  - **Catastrophe** (permanent mind loss) only at a brink: shell gone AND Resolve gone, or
    Corruption maxed.
- **Intervention timing (LOCKED): brink WAITS FOR YOU INDEFINITELY (AFK-safe).** At a deadly
  moment the expedition pauses + fires a prompt (notification + Undercroft marker); it does
  NOT auto-die. On return you either:
  - Spend a **Clarity Charge -> retreat** (mind survives; keep partial loot + map reveal;
    lose remaining provisions; shell likely wrecked), or
  - **Let it ride** -> catastrophe check resolves; fail = permanent loss -> death-marker on chart.
  - Clarity Charges are meditation-gated + scarce -> tension is WHICH minds are worth a charge,
    not AFK roulette. Can also **pre-load a Clarity Charge as a Provision** (auto-retreat at
    first brink). Permanence stays fair: a mind dies only if you pushed uninsured or declined.
- **Pre-launch risk readout (death always foreseeable):** survival band (Safe/Risky/Grave/
  Suicidal) + raw catastrophe %; per-axis breakdown (which threat is lethal -> craft the
  counter); expected loot/depth/map reveal + provisions burned; spelled-out worst case.
- **Math:** per axis `pressure = clamp01((Threat - Capability)/Threat)`; Wardstrength divides
  Corruption pressure; mind level adds flat Resolve buffer absorbing the first chunk;
  catastrophe chance combines worst-covered axes scaled by encounter count; survival = 1 - that.
  Run is seeded (log reproducible) but readout shows the TRUE distribution, never the pre-roll.

## LOCKED MIND STAT / LEVELING MODEL
- **Individuated roster (rich veterans).** Each printed mind = a distinct entity with a
  designation (serial-style, e.g. "Copy VII"), own level/XP, traits, history (expeditions
  survived, nodes cleared, scars). Permanent loss is personal -> death-marker on chart.
- **Three mind stats** (gear covers the body, mind covers the psyche):
  - **Resolve** — signature stat; standalone buffer vs Dread + half the catastrophe brink;
    grows most per level.
  - **Acuity** — amplifies Instrument Sight, speeds decode, boosts XP + map reveal.
  - **Will** — amplifies Ward Wardstrength, resists Corruption/panic.
- **Mind<->gear synergy** (veterans make the SAME gear better):
  Might = Weapon (gear only); Sight = Instrument x (1+Acuity); Wardstrength = Ward x (1+Will);
  Resolve = mind base + Lucid Draught; Shell HP = Shell + Plating.
- **XP & leveling:** XP from surviving encounters, clearing Haunts, breaching Gateways,
  decoding Echoes; scaled by depth/risk (Delve >> Survey). Levels raise stats (mostly Resolve).
  Milestone levels grant a **trait/specialization**: Cartographer, Hunter, Warded, Anchored,
  Scholar, Lucid -> minds become roles (scout / fighter / deep-diver). Optional **scars**
  (permanent mark/minor debuff from surviving a brink).
- **Print quality:** base print (paper+PP+lucidity) = level 1, blank. **Premium-printing
  tiers** = higher starting level / a starting trait, gated as **researchable blueprint
  OPTIONS** (intelligence unlocks the option; FULL lucidity/PP/intelligence cost paid EVERY
  print). A costly recovery valve, NOT a baseline.
- **LOCKED: NO death-proof meta-progression.** Every death resets that mind to scratch
  (harsher / higher stakes). No permanent starting-level/cap/XP-rate creep survives a death.
- **Emergent dynamic (design toward it):** disposable cheap "scout copies" chart dangerous
  frontier Surveys (may die); irreplaceable veterans run the now-known Delve with proper gear
  + a Clarity Charge. Pre-launch readout + Clarity-Charge insurance matter MORE under this rule.
- **Catastrophe scaling:** mind level -> flat Resolve buffer; Will/Acuity cut relevant
  pressures; but deeper pages scale threat faster than one mind can level -> still need better
  gear + rarer cores. (Roster cap via upgradeable "print beds" — parameter to tune.)

## LOCKED UNDERCROFT UI LAYOUT (Option B — chart-centric console)
New LOCATIONS facility -> full-screen panel (same routing pattern as FactoryPanel).
- **Center stage: The Chart.** Current tier's 128x128 page rendered large, crisp pixels,
  live animation (routes drawing in, Gateways glow, frontier shimmer, fog). **Page-tabs**
  along the top flip between discovered tiers. Click a revealed **node** -> select it
  ("Delve here"); click fog/edge -> "Survey -> push [direction]".
- **Left rail: Roster.** Compact mind list: designation, level, tiny trait icons, status dot
  (idle / surveying / delving / AT BRINK in alarm colour). Brink minds pulse + jump to top.
- **Bottom dock: context actions.** Node selected -> **Dispatch builder** slides up; nothing
  selected -> overview (active expeditions + resource readout).
- **Top-right buttons: Workbench + Log** overlays. Brink prompts surface as a modal from any view.
- **Dispatch builder:** Mind slot (stats/traits/Resolve) + Shell slot (built or craft inline ->
  Shell HP) + Equip Instrument/Weapon/Ward/Plating (capabilities update live) + Provisions
  loadout (Rations / Lucid Draught / Clarity Charge, with counts). **Risk readout** recomputes
  live (survival band + %, per-axis check/warn/fail, expected loot/depth, worst-case line).
  Launch (disabled-with-reason if no mind/shell).
- **Workbench overlay:** Print Mind (base + premium tiers), Craft Gear (tiered by core),
  Brew Provisions, Research (spend intelligence to unlock blueprints).
- **Phasing note:** Phase A may ship a simpler tabbed version; evolve to chart-centric once
  the chart renderer exists.

## LOCKED DISCOVERY TRIGGER + "WAY OUT" ENDGAME
- **Discovery trigger:** all **core machines built** (generator, capacitor, extractor, all 5
  converters, transmuter) **and simultaneously running** (none halted for power) **sustained
  ~45s** of tick time (proves balanced power, not a fluke). Overclocker/Regulator EXCLUDED
  (optional toys + would catch-22 their own gate). On trigger: one-off **breakthrough event**
  (Extractor punches through the floor) + short cinematic/notification; **The Undercroft**
  appears in LOCATIONS + journal entry + help popup.
- **"Way out" is assembled, not bought.** Each tier's Gateway/landmark yields a **fragment of
  the way out**. Fragments do three things (reward narratively + mechanically WITHOUT breaking
  no-meta-progression):
  1. **Keys** toward unlocking the final **Exit** node on the deepest tier.
  2. **Unlock lore** (Echo-style journal entries: the office, the loops, the dimensional theme).
  3. **Grant a non-mind WORLD capability** — e.g. *Anchor Point* (permanently lowers a tier's
     Corruption threat), *Cartographer's Truth* (auto-reveals a tier's Gateway), *Forbidden
     Schematic* (endgame blueprint). Never make a mind immortal -> harsh permanence intact.
  - Reaching the Exit needs: enough fragments + high-tier veteran in rarest-core gear +
    surviving the hardest page.
- **Ending (LOCKED): THE LOOP.** Breaching the Exit triggers an ending sequence mirroring the
  Chapter 2 intro (blank screen + centered text). The "way out" leads back in -> deeper office /
  Chapter 3 seed / NG+. Embraces the horror that there is no out. Infinite, sets up future content.

## DESIGN STATUS: COMPLETE — all forks locked. ALL THREE PHASES BUILT + PUSHED.
## PHASE A (8260e1f): Discovery, Undercroft, Workbench, gacha roll/library.
## PHASE B (d12b100): Pixel chart, Survey/Delve dispatch + risk readout, idle resolution.
## PHASE C (a97888c): Brink interventions + Clarity save/let-it-ride, permanent loss +
## death-markers, persistent chart routes, procedural mind portraits, way-out fragments ->
## Exit -> loop ending. GAME_CONTEXT.md updated. Feature complete.
## Possible future polish (not built): per-weapon-type sprites, fragment world-capabilities
## (Anchor Point / Cartographer's Truth / Forbidden Schematic as distinct unlocks), richer
## per-tier difficulty scaling on loops.

## OPEN DECISIONS (none remaining — all locked above)

## BUILD PHASING (detailed — all decisions locked)

### Phase A — Foundation (no live expeditions yet)
- **State** (INITIAL_GAME_STATE + save migration, version bump): `undercroftUnlocked`,
  `factoryFullRunSeconds` (sustained-operation counter), `minds[]` (roster: id, designation,
  level, xp, stats{resolve,acuity,will}, traits[], scars[], status), `shells[]`, `gear{}`
  inventory, `provisions{}`, `researchedBlueprints[]`, `wayOutFragments`, `expeditions[]`
  (empty for now), `chartPages[]` (empty), roster cap / print beds.
- **Discovery trigger** in page.js tick: detect all core machines built + simultaneously
  running (un-halted) -> increment `factoryFullRunSeconds`; at ~45s -> set `undercroftUnlocked`,
  fire breakthrough event + cinematic/notification, add Undercroft to LOCATIONS, journal+help.
- **Constants:** threat axes, capability formulas, BLUEPRINTS (gear/provisions/mind tiers),
  mind TRAITS, gear/provision defs + recipes + tiers-by-core.
- **UndercroftPanel.js** (basic, can start tabbed): Workbench (Research / Print Mind / Craft
  Gear / Brew Provisions) + **Blueprint Library + weapon ROLL** (roll w/ intelligence + optional
  catalyst, rarity odds, duplicate refund, soft pity) + Roster display. Wire actions in
  gameActions.js (watch nested-setState pitfall).
- Build + rubber-duck + commit/push.

### Phase B — Expeditions core (chart + dispatch + idle resolution)
- **Chart data model + deterministic pixel renderer** (reuse sprite pipeline): seeded page gen
  (fog + nodes + hidden Gateway), route rasterization (seeded wandering path), outcome glyphs,
  fog reveal swaths. Store compact expedition records -> re-rasterize.
- **Chart-centric UI (Option B):** center chart, roster rail, bottom dispatch dock, page-tabs.
- **Dispatch builder:** kit assembly (mind+shell+gear+provisions), live capability calc,
  **risk readout** (per-axis pressure, survival band+%, expected outcomes, worst case),
  Survey (heading) vs Delve (node).
- **Idle resolution** in tick: encounters scheduled over Endurance-scaled duration, resolved
  per tick -> live log; damage accumulation (shell / resolve / corruption); XP; loot; map
  reveal; node outcome stamped. Clean return salvages kit. **Combat applies foe archetypes
  (Swarm/Bulwark/Flicker/Phantom/Corruptor) vs weapon-type quirks + rarity-scaled Might.**
- Build + review + commit/push.

### Phase C — Stakes, depth, polish, ending
- **Interventions + permanent loss:** brink detection -> prompt that WAITS indefinitely;
  Clarity Charge retreat vs let-it-ride catastrophe -> death-marker + frayed route; pre-load
  Clarity Charge as a provision (auto-retreat).
- **Tiers:** Gateway breach -> fresh 128x128 page; rarer-core gating per tier.
- **Sprites + animation:** node/gear sprites (procedural); chart animation (route draws in,
  Gateway/Exit glow, frontier shimmer); **blueprint roll animation (rarity-telegraphed reveal);
  per-weapon-type sprites with rarity flair; procedural pixel mind portraits.**
- **Way out:** fragments (keys + lore + world capabilities: Anchor Point / Cartographer's Truth
  / Forbidden Schematic); Exit node on deepest tier; **loop ending** sequence (mirrors Chapter 2
  intro; leads back in / Chapter 3 seed / NG+).
- Achievements, tooltips, journal entries throughout. Build + review + commit/push.

### Cross-cutting
- New tooltips/HELP_POPUPS/HELP_TRIGGERS/MECHANICS_ENTRIES/JOURNAL_ENTRIES for: Undercroft,
  minds, shells, gear families, provisions, Survey/Delve, the chart, brinks/Clarity Charges,
  tiers/Gateways, way-out fragments. Achievements: first mind printed, first Survey, first
  Delve, first Haunt cleared, first Gateway breached, first mind lost, first fragment, the loop.
- All UI text standard-coloured; glow/outline for emphasis only.
- Auto-commit+push each phase; NEVER list AI as commit contributor.

### BUILD PHASING (superseded draft below kept for reference)
- Phase A: discovery trigger + The Undercroft location + Workbench crafting + mind printing
  + shell crafting + the chart data model + chart pixel renderer (static).
- Phase B: dispatch (Survey + Delve) + idle resolution + outcome glyphs + map reveal +
  loot; chart animation (route draws itself in).
- Phase C: interventions + pre-launch risk readout + permanent loss/death-markers + Gateway
  breach -> new page; sprites for nodes/gear; endgame "way out" hooks.

## CONVENTIONS / GOTCHAS (carry over)
- Auto-commit+push after changes (CLAUDE.md/GEMINI.md). NEVER list AI as commit contributor.
- Nested-setState pitfall: don't call addMessage() inside a setGameState updater that flips
  a view-routing flag; fold recentMessages + notifications into the returned state.
- Standard-coloured UI text; glow/outline for emphasis only.
- npm run build (Turbopack) won't catch undefined-global runtime errors -> rubber-duck
  review each phase.
- Pixel art is procedural: scripts/generateFactorySprites.mjs pattern (128x128, primitives,
  4 frames, palette idx 0 = transparent, RLE -> data file; FactorySprite accentColor recolor).
