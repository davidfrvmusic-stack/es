# CLAUDE.md — Chart Breaker

Working spec for this repo. Read this before making changes.

---

## PROJECT

**Chart Breaker** — a mobile-first idle game about running a band, writing songs,
releasing them, and climbing the charts.

**Hard constraints (do not violate without being asked):**
- Single-page web app: **one `index.html`** with inline CSS/JS. **No build step, no
  dependencies, no external network requests, no image files.**
- Touch-optimized, **portrait**, 60fps, mobile-first. Dark purple UI, flat and bold.
- Works offline (PWA: inline manifest + home-screen install; a `sw.js` may be added
  later for true cache-first offline).
- State persists to `localStorage` (versioned key, forward-migratable).

---

## THE ONE THING THAT MAKES THIS GAME

**Songwriting is decisions, not tapping.** Anyone can build a tap-to-progress idle
game. Here the player makes four judgement calls under a 20-second clock, and the
band tells them — through body language, not numbers — whether each call is good.
Tapping still exists, but only as a garnish worth a few Quality points. If a change
would make tapping the main source of progress again, it is wrong.

---

## BUILD ORDER

> The original prompt referenced a BUILD ORDER list but was truncated before it, and
> again mid-sentence under ADDICTION LOOPS. This order is derived from the brief.

1. **Core loop** — SVG characters, 20s writing session with card decisions and
   nod/wince hints, Quality, Quality-driven release reveal, per-song decaying
   streams, weekly genre trends, solo demos, studios, member levels, offline
   earnings, save/load, tab shell. **← current step**
2. **Gear** — guitars, pedals, amps, mics. Visible on the characters, and each piece
   unlocks better writing cards. Crates become real drops.
3. **Crates + rarity** — member drops, Merge 3-same-rarity → +1 rarity, rarity
   passives. Rarity already changes the character's outfit style.
4. **Retention** — Daily Gig, streaks + streak save, notification triggers.
5. **Prestige** — "Break Up The Band", Legacy = `sqrt(lifetimeStreams / 1e6)`,
   +2% everything per point, audio strips to solo acoustic and rebuilds.
6. **Events + League** — Weekend Event genres, 50-player League by Legacy tier.
7. **Shop for real** — Picks packs, crates, Battle Pass, VIP, rewarded ads.
8. **LLM content** — replace/augment the seeded generator, cached, never blocking.

---

## 1. FANTASY
You run a band. Your members write songs, you release them, they climb charts, and
streams are your money. Grow from a garage to stadiums, then break up the band for
permanent Legacy bonuses.

## 2. CHARACTERS
4 band members drawn as animated **inline SVG** (no images), and each one actually
**plays**: the drummer's jointed arms swing sticks down onto the kit in alternation,
bassist and guitarist fret with one hand and strum across the body with the other,
the vocalist holds a mic to their mouth and their jaw moves. Limbs are round-capped
stroked paths (shoulder → elbow → hand) inside groups with
`transform-box: view-box`, so each pivots on its own shoulder in viewBox coordinates
and the hands land on the instrument. Every motion's duration derives from the
`--beat` variable, so the whole band plays to the song's BPM. Random look on unlock (skin tone,
hair style, hair colour, accessory). Rarity changes the outfit style (jacket panels →
shoulder studs → trim + glow → aura). Equipped gear will be drawn on the character.
Locked members are a dark silhouette with a lock. Flat, bold, slightly cartoonish.

## 3. SONGWRITING SESSION (the core loop)
- WRITE A SONG → pick a genre from 4 offered (the hottest genre is always one of
  them, each showing its trend status and multiplier), then a **20-second session**: one decision per *unlocked* track, in order
  drums → bass → guitar → vocals.
- Each decision deals **3 cards** ("Trap Hi-Hats" / "Punk Beat" / "Slow Groove").
  Every card carries a hidden `[energy, grit, polish]` vector. Card score =
  45% fit with the genre's vector + 35% coherence with the cards already chosen +
  20% the card's own base strength. Good combos raise **Quality (0–100)**.
- The member whose track it is **steps forward** (centred, others dim) and reads the
  three cards in turn — NODS / SHRUGS / WINCES, plus a speech bubble. That is the
  whole hint system. Hint accuracy is `50% + 3.5%/level`, capped at 97%, so a
  low-level member is an unreliable narrator.
- One card in every deal is guaranteed to be the best *genre* fit available. It is
  not always the best *overall* pick, because coherence with earlier choices can
  outrank it — that is what keeps the decision a decision.
- Higher member levels unlock better cards (`lvl` on each card) and clearer hints.
- Tapping during a session adds `+0.22` Quality to the current track, capped at
  `+4`. That is its entire role.
- Timer runs out → the band picks for you, using whatever the member liked.
- Quality is normalised over however many tracks are unlocked, so an early one-track
  song can still score well.
- Members also **auto-write solo demos** in the background and while you are away,
  at random Quality 20–50 — one per member per 15 minutes, capped at 12 while
  offline. A trickle that rewards returning, never the main income. Player sessions
  played well reach 90+.

## 4. RELEASE
Slot-machine chart reveal: title → procedural cover → chart-position reel → tier.
Flop / Solid / Hit / Viral / #1, **weighted by Quality** (`ODDS` table, interpolated:
at Q90 exactly 40% land Hit or better). 25% of Flops and Solids show the reel land
one tier higher before settling. Skippable after the first reveal.

## 5. TWO RATES: STREAMS/sec AND MONEY/sec
The top bar shows both, each with its total and its rate. They are separate numbers
with separate jobs: **streams are reach, money is what you spend.**

    streams/sec = Σ songSPS(catalogue)            starts at 0
    money/sec   = gigMoney + streams/sec × payoutRate    starts at 1.0

**Streams come only from released songs.** A band with nothing out streams nothing,
and the counter sits at 0 until the first release — streams are what a *record* does,
not what a person does.

**Money has its own floor.** `gigMoney = 1.0 × (1 + 0.5 × (members − 1))` — the band
plays live for cash. This is why money can start at 1.0/sec while streams start at 0;
without it the two requirements contradict each other. It also gives hiring an
immediate payoff before you have any catalogue.

- **Members multiply the catalogue** — `bandMult = 1 + Σ (sps × level × rarity)` —
  rather than emitting streams themselves. A level-up therefore lifts *every song you
  have ever released*, retroactively, and shows in the top bar at once.
- A song's `base` is fixed at release from Quality and chart tier; band multiplier,
  studio, trend and decay are all applied **live**.
- **payoutRate** rises `+0.02` per Royalty Rate upgrade (cost `60 × 1.7^n`). It is
  the multiplier on *everything*, so it stays worth buying forever.
- **No passive money from tapping.** Every released song earns its own streams/sec:

    base  = 1.5 × qFactor(Quality) × tierMultiplier          (fixed at release)
    live  = base × bandMult × studioMultiplier × genreTrend(now) × decay(now)

- `qFactor` = `0.25 + 1.75 × (Q/100)^1.6`.
- **Decay:** songs below Hit halve every 3 days down to a 15% floor. Hit / Viral /
  #1 never decay — that is the reward for a big release.
- **Genre trends are a living cycle**, not a weekly shuffle. Every genre carries
  `heat` (0–100) and a velocity that drifts each simulated minute; heat above 82 is
  pushed down and below 12 is pushed up, so genres peak and fade on their own.
  Status is heat **plus direction**: `COLD` (<38, x0.60), `RISING` (≥38 and climbing,
  x1.35), `FADING` (≥38 and falling, x0.90), `HOT` (≥70, x2.20). The same heat reads
  RISING on the way up and FADING on the way down.
- **Your hits move the market.** Releasing pushes the genre's heat by
  `(2 + 6×Q/100) × TIER_HEAT[tier]` and adds upward momentum, so a strong song in a
  RISING genre can tip it HOT — verified: a Q92 Viral took a genre from RISING 55 to
  HOT 85. Shown on the genre picker (with "a hit could tip it hot" on RISING ones)
  and on the Catalog tab. Trends apply live to the whole back catalogue.
- Release payout = 90 seconds of that song's streams, up front.

## 6. YOUR CHARACTER, AND HIRING THE REST
On first run a **setup screen** asks for a band name, your name, the instrument you
play, and shuffles your character's look. That slot is yours and **free**, owned at
level 1. Both names are editable later from the Band tab, and every hire prompts for
a name (with a dice button) — the band is the player's to name.

The other three slots start **empty**: a locked silhouette with a price, bought with
**money**. Prices attach to **purchase order, not to role** — `[15, 120, 900]` —
so whichever instrument you take free, the remaining three cost the same ladder and
no starting role is a dominant pick. Role `sps` values are deliberately close
together (0.9 → 1.2) for the same reason: choosing your instrument should be about
which writing cards you start with, not which is strongest.

## 7. UPGRADES (all bought with money)
- **Member levels** — cost `lvlCost × 1.15^n`. Raises that member's streams/sec,
  scales every song, unlocks better cards, sharpens hints, speeds up solo demos.
- **Royalty rate** — the payout multiplier, see §5.
- **Rarity** — Common→Rare→Epic→Legendary→Mythic, from crates; merge 3 → one up.
- **Gear** — 2 slots per member; visible on the character; unlocks writing cards.
- **Studios** — Garage → Bedroom → Rehearsal → Pro Studio → Label HQ → Tour Bus →
  Stadium → Space. Each x5 all song streams and repaints the stage.

## 8. SOUND (the differentiator — do not skip)
Web Audio synth only, no samples. Every tap plays a pentatonic note in the song's
key. **Each decided track fades its instrument layer into the loop** — so the song
assembles as you make decisions, and a finished demo is a 4-layer loop. The chosen
card's energy shapes its layer (filter cutoff, hat density). BPM comes from the
genre's energy and drives both the loop and the characters' bob. Studio upgrades add
reverb. Release plays a chord. Mute toggle. Haptics on tap and on Hit/Viral.

## 9. CURRENCIES
- **Streams** — reach. Accumulates from the rate above; drives Legacy at prestige.
- **Money** — the spend currency. Members, levels, royalties, studios.
- **Picks** (premium) — crates, skips, streak saves.
- **Legacy** (prestige) — permanent multipliers.
Formatting: 1.2K, 3.4M, 8.9B, 1.1T… Counters animate up.

## 10. UI (portrait, one-thumb)
Top: two animated counters side by side — MONEY (total + /s) and STREAMS
(total + /s) — then band name, Picks and studio chips.
Middle: the stage — 4 SVG characters, the active one stepped forward.
The **Band tab is a full-page screen** (`#sheet.full`), not a bottom panel: band
identity, royalty rate, studio, every member with level and upgrade, and empty slots
with prices. The other tabs remain bottom sheets.
Bottom dock, one of four states: **idle** (solo-demo progress + WRITE A SONG),
**genre** pick, **writing** (timer, song-sheet strip, 3 cards), **quality** (score +
RELEASE IT). Tabs: Band | Gear | Catalog | Shop | League open as bottom sheets over
the stage. Targets ≥44px, `env(safe-area-inset-*)` respected.

## 11. SHOP (stub)
Picks 100/₪12, 550/₪45, 1200/₪90, 3500/₪219. Crates: Bronze 50 (C60 R30 E8 L1.8
M0.2), Gold 150 (Epic+), Mythic 500 (Legendary). Battle Pass ₪35/mo. VIP ₪19/mo
(x2 income, 24h offline, no ads, daily Gold Crate). Daily Deal, rewarded ads.

---

## CURRENT STATE

- `index.html` — BUILD ORDER step 1 complete and verified in headless mobile
  Chromium: full session → Quality → release → catalogue, solo demos, decay, weekly
  trends, save/reload, no console errors.
- Measured Quality spread at level 1 with a full band: worst-card play median 43,
  random 55, best-card play 69–81; at level 12 best play reaches 88 (+4 from jamming
  → 90+). Levelling visibly matters.

- Economy verified: a fresh band sits at **0 streams/sec and 1.0 money/sec**; hiring
  raises gig money (1.0→1.5) with no songs out; the first release starts streams
  (0→2.8/sec); five member levels multiplied the catalogue 3.5→9.0/sec; hire ladder
  15/120/900.

**Known gaps (deliberate, deferred):** gear, crates as real drops, rarity/merge,
daily gig, streaks, prestige, league, weekend events, real shop, LLM content,
`sw.js` offline.

**Removed along the way:** the tap-to-fill-tracks loop, Hook Moments, the Hype stat
(Quality shifts chart odds instead), and weekly-seeded genre trends (replaced by the
live heat cycle). Time-gated member unlocks are gone too —
members are hired with money now. v1 and v2 saves are migrated (streams→money at the
base payout rate, levels, ownership, songs, time away) rather than discarded.

## CONVENTIONS

- Everything lives in `index.html`. Keep the section-comment banners
  (`/* ===== AUDIO ===== */` etc.) and add new systems as new banners.
- Tunables live in the tables near the top of the script — `BAL`, `MEMBERS`,
  `RARITY`, `STUDIOS`, `TIERS`, `ODDS`, `GENRES`, `CARDS`. Never inline a balance
  number in logic. Studio costs are on the *money* scale, which accrues roughly 10x
  slower than streams — rescale them if `payoutBase` ever changes.
- Card vectors are the game's difficulty knob. `DSCALE` (2.2) is the distance at
  which a card scores zero; it is tuned to how far apart the real card vectors sit,
  not to the theoretical maximum. Raising it flattens Quality; lowering it punishes.
- `save()` writes a versioned object; `load()` must tolerate older versions by
  filling defaults rather than throwing.
- No blocking work in the render loop. Audio buffers are built off the first tap.
- Test by opening the file directly on a phone — there is no dev server.
