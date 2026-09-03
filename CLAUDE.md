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
4 band members drawn as animated **inline SVG** (no images): drummer behind a kit,
bassist and guitarist holding instruments, vocalist with a mic stand. Idle bob tied
to the song's BPM via the `--beat` CSS variable. Random look on unlock (skin tone,
hair style, hair colour, accessory). Rarity changes the outfit style (jacket panels →
shoulder studs → trim + glow → aura). Equipped gear will be drawn on the character.
Locked members are a dark silhouette with a lock. Flat, bold, slightly cartoonish.

## 3. SONGWRITING SESSION (the core loop)
- WRITE A SONG → pick a genre from 4 offered (the week's HOT genre is always one of
  them), then a **20-second session**: one decision per *unlocked* track, in order
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
  at random Quality 20–50. Player sessions played well reach 90+.

## 4. RELEASE
Slot-machine chart reveal: title → procedural cover → chart-position reel → tier.
Flop / Solid / Hit / Viral / #1, **weighted by Quality** (`ODDS` table, interpolated:
at Q90 exactly 40% land Hit or better). 25% of Flops and Solids show the reel land
one tier higher before settling. Skippable after the first reveal.

## 5. STREAMS = MONEY
**No passive money from tapping.** Every released song earns its own streams/sec:

    raw   = 0.55 × bandPower(at release) × qFactor(Quality) × tierMultiplier
    live  = raw × studioMultiplier × genreTrend(now) × decay(now)

- `qFactor` = `0.25 + 1.75 × (Q/100)^1.6`.
- **Decay:** songs below Hit halve every 3 days down to a 15% floor. Hit / Viral /
  #1 never decay — that is the reward for a big release.
- **Genre trends rotate weekly**, seeded off the week index so they are stable for
  everyone all week: 1 HOT (x2.2), 2 RISING (x1.5), 2 COLD (x0.55). Shown on the
  Catalog tab. Trends apply *live* to the whole back catalogue, so an old disco
  record booms when disco comes back around.
- Release payout = 90 seconds of that song's streams, up front.

## 6. UPGRADES
- **Member levels** — cost x1.15 per level. Raises band power (every song's streams),
  unlocks better cards, sharpens hints, speeds up solo demos.
- **Rarity** — Common→Rare→Epic→Legendary→Mythic, from crates; merge 3 → one up.
- **Gear** — 2 slots per member; visible on the character; unlocks writing cards.
- **Studios** — Garage → Bedroom → Rehearsal → Pro Studio → Label HQ → Tour Bus →
  Stadium → Space. Each x5 all song streams and repaints the stage.
- Unlocks: Bassist 0:45, Guitarist 3:00, Vocalist 7:00, first crate 12:00. These are
  deliberately fast — a 4-decision session is the whole game and players should not
  wait 20 minutes to see one.

## 7. SOUND (the differentiator — do not skip)
Web Audio synth only, no samples. Every tap plays a pentatonic note in the song's
key. **Each decided track fades its instrument layer into the loop** — so the song
assembles as you make decisions, and a finished demo is a 4-layer loop. The chosen
card's energy shapes its layer (filter cutoff, hat density). BPM comes from the
genre's energy and drives both the loop and the characters' bob. Studio upgrades add
reverb. Release plays a chord. Mute toggle. Haptics on tap and on Hit/Viral.

## 8. CURRENCIES
- **Streams** (soft) — from the catalogue per second + release payouts.
- **Picks** (premium) — crates, skips, streak saves.
- **Legacy** (prestige) — permanent multipliers.
Formatting: 1.2K, 3.4M, 8.9B, 1.1T… Counters animate up.

## 9. UI (portrait, one-thumb)
Top: Streams (huge, animated) + streams/sec + Picks + studio.
Middle: the stage — 4 SVG characters, the active one stepped forward.
Bottom dock, one of four states: **idle** (solo-demo progress + WRITE A SONG),
**genre** pick, **writing** (timer, song-sheet strip, 3 cards), **quality** (score +
RELEASE IT). Tabs: Band | Gear | Catalog | Shop | League open as bottom sheets over
the stage. Targets ≥44px, `env(safe-area-inset-*)` respected.

## 10. SHOP (stub)
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

**Known gaps (deliberate, deferred):** gear, crates as real drops, rarity/merge,
daily gig, streaks, prestige, league, weekend events, real shop, LLM content,
`sw.js` offline.

**Removed in the redesign:** the tap-to-fill-tracks loop, Hook Moments, and the Hype
stat. Quality replaced Hype as the thing that shifts chart odds. A v1 save is
migrated (streams, levels, studio, songs) rather than discarded.

## CONVENTIONS

- Everything lives in `index.html`. Keep the section-comment banners
  (`/* ===== AUDIO ===== */` etc.) and add new systems as new banners.
- Tunables live in the tables near the top of the script — `BAL`, `MEMBERS`,
  `RARITY`, `STUDIOS`, `TIERS`, `ODDS`, `GENRES`, `CARDS`. Never inline a balance
  number in logic.
- Card vectors are the game's difficulty knob. `DSCALE` (2.2) is the distance at
  which a card scores zero; it is tuned to how far apart the real card vectors sit,
  not to the theoretical maximum. Raising it flattens Quality; lowering it punishes.
- `save()` writes a versioned object; `load()` must tolerate older versions by
  filling defaults rather than throwing.
- No blocking work in the render loop. Audio buffers are built off the first tap.
- Test by opening the file directly on a phone — there is no dev server.
