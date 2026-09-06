# Chart Breaker — visual audit, and the asset inventory that comes out of it

The audit was **read out of the shipped file**, not out of memory: `scratchpad/.../placeholders.js`
and `inv.js` open `index.html` in headless mobile Chromium and report which icon each surface
actually renders and how many entries each content table holds. The numbers below are that
output.

---

## 0. The rule this pass is built around

> **No generic placeholder icon may represent two mechanically different important things.**

Everything below is measured against that one sentence.

---

## 1. What the game draws today

`ICON` holds **28 glyphs on a 24px grid**. They were authored in Concert Neon stage 1 to
replace emoji in the chrome — a tab bar, a settings row, a toast. They were never meant to
carry content, and they are now carrying all of it.

### The generic-placeholder audit

| # | surface | what it draws today | how many distinct things share it | verdict |
|---|---|---|---|---|
| 1 | ~~**Skills**~~ | **FIXED** — one icon per skill, and a learned row draws the skill rather than a tick | ~~24 skills → 2 glyphs~~ | was the worst offender. *Chord Shapes*, *Stage Presence*, *Signature Tone*, *Feedback*, *Songwriter* and *Solo* are six different mechanics with one music note between them |
| 2 | **Gear cards** (`htmlGear`, both slots) | `ICON.mic` for vocals, `ICON.music` for every other instrument, `ICON.gear` for every rig | **28 archetypes → 3 glyphs** | Pawnshop SG, Flying V, Baritone and Semi-Hollow are the same picture. The card does not show the item |
| 3 | **Crate open** (`showCrate`) | same three glyphs again, tinted by rarity | gear reward → 3 glyphs | the reveal does not show what you won |
| 4 | ~~**Crates** (`htmlShop`)~~ | ~~`ICON.crate` ×3, recoloured~~ | ~~**3 crates → 1 glyph**~~ | **SETTLED** — `CRATE_ART`, two states, one entry per crate |
| 5 | **Currencies** | Money `ICON.money`; Picks `ICON.pick`; **Parts, Studio Hours, Gig Tickets and Streak Freeze have no mark at all** — they are bare numbers with a word | **8 currencies → 2 marks** | a player cannot tell Parts from Hours at a glance anywhere |
| 6 | **Gig tickets** (`renderTix`) | `ICON.pass` — the same glyph the **Season** rail chip uses | a ticket and a season pass share a mark | two mechanically different things, one glyph |
| 7 | **Quests** (`htmlQuests`) | `ICON.flag` unclaimed / `ICON.check` claimed, for all 11 types | **11 quest types → 2 glyphs** | and the *reward* on the row is text, not the reward's own mark |
| 8 | **Season track** (`htmlPass`) | a flat list of `.prow` rows; rewards are text | 40 rewards → 0 artwork | reads as a table, not a road |
| 9 | **Member cards / Star Rank** | the star bar is a progress bar; the portrait is on the character sheet only | no card object exists | there is nothing to collect *the look of* |
| 10 | **Studios** | `ROOM` draws the room you own; **the one you are buying is a name and a price** | 8 studios → 0 previews | you cannot see what you are saving for |
| 11 | **Venues** | `VENUES[].c`, a two-stop gradient on the card | 8 rooms → 8 gradients | no silhouette, no scene, no scale |
| 12 | **Reward pop-ups** | `#anIcon`, `#coIcon` and the toast all use a category glyph | every reward → a category | §14's own rule ("no generic gift icon if real artwork exists") is not met |
| 13 | **Locked content** | `.locked` = dashed border + a price. Locked genres are **not listed at all** | — | nothing here creates wanting |
| 14 | ~~**Rail chips**~~ | ~~INBOX `crate`~~ | ~~shares `crate` with the crate system~~ | **SETTLED** — `ICON.inbox` is a tray |
| 15 | **`ICON.crown`** | premium, a career objective, the **Star Rank card**, the daily streak | **7 read sites → 5 jobs** | **FIXED** — star and flame added; the crown is premium only |

**Fourteen surfaces. Five glyphs — `music`, `mic`, `gear`, `crate`, `pass` — are doing the
work of 100+ distinct things.**

### What is *not* broken, and should not be touched

- **The characters.** Four members, real instruments, jointed limbs, `--beat`-driven motion,
  five outfit treatments by star rank. This is already the best art in the game.
- **The rooms.** All eight studios draw their own wall (§8c). The *owned* room is fine; the
  *unowned* one is the gap.
- **The palette.** Concert Neon is coherent and every token is in `:root`. The pass adds no
  colours; it spends the ones that exist.
- **The chrome icons.** `band`, `cog`, `sound`, `save`, `home` are correct at 18×18 and stay.

---

## 2. Asset inventory — everything that needs its own identity

**123 marks**, in six weights. Nothing here is a new content table; every line already exists
in the game as an entry with a name and a mechanic, and is missing only its picture.

| # | family | count | weight | notes |
|---|---|---|---|---|
| A | **Instrument thumbnails** | 20 | 48×48 silhouette | 5 kits · 5 basses · 5 guitars · 5 mics. Must read as *that* instrument: a Flying V is a V, a Thunderbird is a Thunderbird |
| B | **Rig part thumbnails** | 8 | 48×48 silhouette | Practice Amp · 4×12 Stack · Pedalboard · Tape Echo · Compressor Rack · Wedge Monitor · DI Box · Tube Preamp |
| C | ~~**Skill icons**~~ | 24 | 24px grid | **BUILT** — `SKILL_ART` in `index.html`, keyed by skill id |
| D | ~~**Currency marks**~~ | 8 | 24px grid | **BUILT** — `CURRENCY` in `index.html`, §12b. Money · Streams · Fans · Picks · Parts · Studio Hours · Gig Tickets · Streak Freeze |
| E | ~~**Crates**~~ | ~~3~~ | 24px grid, closed + open | **DRAWN** — `CRATE_ART`, solid fills, own shade per crate |
| F | **Studio previews** | 8 | wide mini-scene | reuse `ROOM`'s own builders at small scale — the preview is literally the room you are buying |
| G | **Venue mini-scenes** | 8 | wide mini-scene | stage + crowd silhouette + the room's own scale |
| H | **Quest type icons** | 11 | 24px grid | write · quality · pocket · perfect · level · hit · gig · sold · career · crate · skill |
| I | **Reward category marks** | 6 | reuse D + E | picks · parts · hours · crate · card · ticket — the reward pop-up shows *this*, never a gift box |
| J | **Member card frame** | 5 rarities | card object | portrait + role + ★ + rarity frame + duplicate progress + next cosmetic |
| K | **Rank badges** | 6 | already exist as `house/pin/map/flag/globe/crown` | keep; they are distinct silhouettes already |
| L | **Genre badges** | 16 | already colour-only | keep colour-only; 16 hues that must differ at a glance is what that table is for |

### 3. The 24 skill icons, named

| role | tier | skill | the picture |
|---|---|---|---|
| drums | 1 | Steady Hand | a stick and a metronome tick |
| drums | 1 | Deep Breath | lungs / an expanding ring |
| drums | 2 | Click Track | a click grid with one lit division |
| drums | 2 | Second Wind | a stamina arc refilling |
| drums | 3 | Pocket Player | a beat grid with the pocket shaded |
| drums | 3 | Machine | a piston / geared kick pedal |
| bass | 1 | Root Notes | a fretboard root marked at the nut |
| bass | 1 | Groove | a looping sine over a bar line |
| bass | 2 | Lock In | two waveforms interlocking |
| bass | 2 | Sustain | a decay envelope with a long tail |
| bass | 3 | Foundation | a plinth under a note |
| bass | 3 | Walking Line | ascending steps of notes |
| guitar | 1 | Chord Shapes | a fretboard with chord dots |
| guitar | 1 | Stage Presence | a figure between two spotlights |
| guitar | 2 | Signature Tone | an amp with a distinct signal shape |
| guitar | 2 | Feedback | a guitar and an energy wave |
| guitar | 3 | Songwriter | a notebook, a pencil and a stave |
| guitar | 3 | Solo | a guitar neck in a spotlight cone |
| vocals | 1 | Breath Control | a breath arc into a mic |
| vocals | 1 | Projection | a mouth and expanding arcs |
| vocals | 2 | Phrasing | a phrase mark over notes |
| vocals | 2 | Crowd Work | a hand reaching to a crowd line |
| vocals | 3 | Front Person | a figure at a mic, crowd behind |
| vocals | 3 | Range | a stave with a high and a low note |

---

## 4. What the research says, and what of it applies here

Focused reading on idle / tycoon / collection / progression / music mobile games. **No name,
character, artwork, layout or asset is copied.** What transfers is principle:

1. **Rarity is a frame, not a colour swap.** The convention is a progressive treatment —
   plain border → coloured border → gradient + glow → multi-layer + badge → ornate. Chart
   Breaker already has this *on the characters* (§3's outfit ladder). The pass extends the
   same ladder to item cards, so rarity reads without the word.
2. **Show the item, then the numbers.** A collectible card leads with artwork and puts stats
   underneath. Today every gear card leads with a number.
3. **A reward track is a road, not a table.** Vertical, big nodes, current position marked,
   locked future rewards visible, milestone nodes physically larger.
4. **Preview the locked thing.** Future content shown in the play space is a documented
   retention mechanism; a `?` is not. Silhouette + name + condition + progress + why.
5. **Transparency is the ethical line in a storefront.** Disclose odds; show exact contents;
   show what you own; no fake scarcity, no fake timers, no confusing conversion. Chart
   Breaker already publishes crate odds and pity **before** the purchase (§8d) — the pass
   makes that *visual* rather than a line of small print, and adds owned counts.
6. **The dark patterns to keep refusing:** urgency indicators, concealed advertising, limited
   offers with countdowns, transactional fluidity (obscuring real price behind currency
   layers). §14 and the plan's rule 8 already forbid all four; this pass does not soften any
   of them.

Sources consulted: Pixune's 2026 mobile-game-UI review; Adjust and Playgama on gacha
mechanics and rarity ladders; Justinmind on game UI hierarchy; Unity's Battle Passes docs,
UX Collective on premium pass systems and Blizzard's Overwatch 2 pass revamp; *Architecting
virtual storefronts* (Consumption Markets & Culture, 2024) on shop dark patterns; Udonis on
progression systems and locked-content previews.

---

## 5. Constraints this pass does not get to break

- **Inline SVG only.** No PNG, no JPG, no emoji, no network, no dependencies, one
  `index.html`.
- **Reusable builders, `currentColor`.** Art goes in content tables the same way `INSTR`,
  `RIG` and `ROOM` already do — one entry per thing, never a branch.
- **Every icon legible at 18×18.**
- **60fps.** Frame time stays median ≈16.7ms / p95 ≤17.6ms.
- **No economy, formula, save-state or progression change.** `songSPS`, `craftCap`,
  `newState()` and every balance number are untouched, and the suites assert it.
- **The anchor contract holds.** `.ch-bob`'s bbox is identical for all five archetypes of
  each role; `anchor.js` re-measures it. Thumbnails are a *separate* box from the on-stage
  instrument and may not feed the character rig.
- **Mythic effects switch off** under `prefers-reduced-motion` and battery saver.
- **Every ₪ price stays a non-pressable rail until a provider exists** (§14).

---

## 5b. What shipping family D taught the rest of the pass

Three rules came out of drawing the eight, and they apply to the rest:

1. **A mark is a solid silhouette with the dark lines inside it.** The chunky-outline style
   assumes a light ground. On `#0B0D12` a `#12131C` outline is 1.1:1 — it does nothing, so
   anything built from thin strokes over one is gone by 18px.
2. **Measure the ink against the box, not by eye.** The first parts gear ran 0→24 with a
   1.8 stroke and was clipped on all four edges; nobody spots that at 24px, and the suite
   spots it every time.
3. **The silhouette carries the identity; the token carries the colour.** Where a supplied
   colour and §2 disagree, §2 wins — it is checked in, and a currency wearing the primary
   action colour is a real bug rather than a taste question.
4. **Navigation is the exception to "give everything its own colour."** A tab bar's job is
   to say *which tab is selected*; it does that with brightness, and per-tab colour spends
   the only channel it has. Content gets identity, chrome gets legibility.

## 6. Order of work

1. **Prototype one of each** — gear card, skill card, member card, crate, studio preview,
   venue, season milestone, shop offer, reward pop-up — and settle the language on those nine
   before drawing the rest against a guess.
2. **Draw the art** into content tables.
3. **Rebuild the screens** on it: the season road, the storefront, locked previews, Home.
4. **Game feel**, with the reduced-motion and battery-saver switches.

Each step is verified the way every other stage was: the full suite, `anchor.js`, frame time,
and a pre-pass save loading clean.
