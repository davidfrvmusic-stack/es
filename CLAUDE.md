# CLAUDE.md — Chart Breaker

Working spec for this repo. Read this before making changes.

---

## PROJECT

**Chart Breaker** — a mobile-first idle game about running a band, writing songs,
releasing them, and climbing the charts.

**Hard constraints (do not violate without being asked):**
- Single-page web app: **one `index.html`** with inline CSS/JS. **No build step, no
  dependencies, no external network requests, no image files.**
- Touch-optimized, **portrait**, 60fps, mobile-first. **Warm cream palette**, flat and
  bold — see PALETTE below. No web fonts: the no-network rule rules out Google Fonts,
  so the design's Bricolage/Archivo pairing is approximated with the system rounded
  stack at matching weights and letter-spacing.
- Works offline (PWA: inline manifest + home-screen install; a `sw.js` may be added
  later for true cache-first offline).
- State persists to `localStorage` (versioned key, forward-migratable).

---

## THE ONE THING THAT MAKES THIS GAME

**Songwriting is decisions, then performance — never tapping.** Anyone can build a
tap-to-progress idle game. Here the player makes four judgement calls under a
20-second clock, and the band tells them — through body language, not numbers —
whether each call is good. Then they have to *play* each call: a 10-second recording
take where notes fall to the song's BPM in a pattern the chosen card decides.

Two things earn Quality, and neither is tapping fast. The **decision** is worth up to
~80 of the 100 and is still the ceiling on a song. The **take** is worth up to
`BAL.takeMax` (20) — real timing against a real beat, and the reason a good decision
badly played still disappoints. Idle jam-tapping survives only as a garnish
(`+0.22`, capped at `+4` per track). If a change would make undifferentiated tapping
the main source of progress, it is wrong; skill at a rhythm you had to choose first
is not that.

---

## BUILD ORDER

> The original prompt referenced a BUILD ORDER list but was truncated before it, and
> again mid-sentence under ADDICTION LOOPS. This order is derived from the brief.

1. **Core loop** — SVG characters, 20s writing session with card decisions and
   nod/wince hints, a 10s three-lane recording take per decision, Quality,
   Quality-driven release reveal, per-song decaying streams, live genre trends,
   16 genres with signature cards, fans and ranks, solo demos, studios, member levels,
   offline earnings, save/load, tab shell. **← current step**
2. **Gear** — guitars, pedals, amps, mics. Visible on the characters, and each piece
   unlocks better writing cards. Crates become real drops.
3. **Crates + rarity** — member drops, Merge 3-same-rarity → +1 rarity, rarity
   passives. Rarity already changes the character's outfit style.
4. **Retention** — the *Daily* Gig (a guaranteed special show, distinct from the
   regular gig ladder in §4d, which is built), streaks + streak save, notification
   triggers.
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

## 2. PALETTE AND TYPE

Warm, energetic, high-contrast on cream. Tokens live in `:root` — change them there,
never in a rule:

| token | value | use |
|---|---|---|
| `--cream` / `--cream2` / `--cream3` | `#FFF3E2` `#FFE7C4` `#FFDCAE` | page, stage, stage floor |
| `--panel` | `#FFFAF0` | cards, sheets, chips |
| `--line` / `--line2` | `#EBD9BE` `#D9BE99` | 2px borders (this UI outlines, it does not shadow) |
| `--ink` / `--dim` / `--dim2` | `#2C1D16` `#8A6F5E` `#A9856B` | text |
| `--accent` / `--accent-dk` / `--accent-sh` | `#FF5A45` `#D93A26` `#C0331F` | coral: primary action, money |
| `--gold` / `--gold-dk` | `#FFC22E` `#E39A00` | yellow: timers, rising, picks |
| `--accent2` / `--accent2-dk` | `#12A79C` `#0B7A72` | teal: confirm, streams, NODS |

Buttons carry a solid `0 5px 0` shadow in their own dark tone and press *down* into
it — no gradients, no blur. Borders are 2px. Icons in persistent chrome are inline
SVG on a 24px grid (`ICON` + `ico()`); emoji survive only as expressive punctuation
inside toast text.

Design sources for the overhaul are in `design/` as `.dc.html` artboards — the
canvas the screens were drawn on. They are reference, not build input.

## 3. CHARACTERS
4 band members drawn as animated **inline SVG** (no images) holding **real
instruments** — a bass drum with hoop, lugs and a visible head, rack toms and snare
with rims, hi-hat and ride, 4- and 6-string necks with frets, dot inlays, pickups and
tuners, and a mic with a cross-hatched grille. Each one actually **plays**: the drummer's jointed arms swing sticks down onto the kit in alternation,
bassist and guitarist fret with one hand and strum across the body with the other,
the vocalist holds a mic to their mouth and their jaw moves. Limbs are round-capped
stroked paths (shoulder → elbow → hand) inside groups with
`transform-box: view-box`, so each pivots on its own shoulder in viewBox coordinates
and the hands land on the instrument. Every motion's duration derives from the
`--beat` variable, so the whole band plays to the song's BPM. Random look on unlock (skin tone,
hair style, hair colour, accessory). Rarity changes the outfit style (jacket panels →
shoulder studs → trim + glow → aura). Equipped gear will be drawn on the character.
Locked members are a dark silhouette with a lock. Flat, bold, slightly cartoonish.

## 4. SONGWRITING SESSION (the core loop)
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
- Timer runs out → the band picks for you, using whatever the member liked (and every
  remaining take is auto-taken — there is no take UI when the band is finishing for
  you).

**THE RECORDING TAKE.** Choosing a card does not advance the session; it starts a
**10-second take** for that track — a three-lane rhythm game in the bottom ~46% of
the screen, played with one thumb. The band stays visible above it.
- **Three lanes: left / centre / right**, each a full-height touch target with a
  coloured pad at the bottom (coral / teal / gold) and the part it plays written on
  it — `LANE_NAMES` per instrument, so the drummer's read SNARE / KICK / HAT and the
  guitarist's CHUG / CHORD / LEAD. You tap the lane the note lands in.
- The **pattern comes from the card** — every card carries `p`, a key into `PATTERNS`
  (16 steps). "Trap Hi-Hats" is `doubles`, "Slow Groove" is `sparse`, "Wall Of Fuzz"
  is `drive`. The choice and the skill are the same choice.
- **Which lane a note lands in comes from where it sits in the bar**, not from a
  random roll: downbeat → centre (kick), backbeat → left (snare), everything between
  → right, with every third in-between note and every fourth downbeat crossing back
  left so the part moves. A running counter does that crossing, not the step index —
  a pattern like `back` never lands on a strong beat at all, and the position rule
  alone dumped all of its notes in one lane.
- `perfectMs` 62 / `goodMs` 135 either side of the beat; a tap in empty air is
  ignored rather than punished, but tapping the **wrong lane** while a note was there
  breaks the streak and costs half a miss. Perfect scores 2, Good 1, and the track's
  take is graded on the ratio of the possible total: ≥0.80 → `takePerfect` (+5
  Quality), ≥0.45 → `takeGood` (+2), else 0. Across a whole song, `takeMax` (20) is
  the cap.
- **Note streak multiplier** at `BAL.multSteps` (6 / 14 / 24 in a row → x2 / x3 / x4),
  shown as a chip in the take's header that changes colour at each step (gold →
  coral → filled coral) and bumps, taps and buzzes when it climbs. It is not a score multiplier — the grade is accuracy —
  but finishing a take on x4 is worth `multBonus` (+1 Quality).
- **The take meter** starts at `meterStart` (65), rises `meterHit` (3) per hit and
  falls `meterMiss` (6) per miss. At 0 the take **falls apart**: it ends there, scores
  nothing, and the member winces. Eleven misses in a row, so it is a real fail state
  and not a casual one — and it costs that track's take, never the song.
- **AUTO-TAKE** skips it for a flat `takeAuto` (5) split across the tracks — always
  available, always worse than playing.
- **The 20-second decision clock stops while a take is running.** The take has its
  own countdown; the two clocks never run together.
- **The notes fly.** `approach = 1.15s + 0.02/level`, capped at 1.55s — the whole
  fall, top of the lane to the pad. Better members buy reading time, never fewer
  notes. The deal before it snaps in at `readBeat` 0.22s a card.
- **The pads answer the thumb before anything is judged.** `pointerdown` presses the
  pad into its `0 5px 0` shadow and fills it (`lanePress`, plus `.lane:active` so the
  browser paints it without waiting on JS); a hit fires a ring burst (`laneFire`), a
  miss or a wrong lane shakes the lane (`laneBad`). Every lane carries a wash and a
  strike line across its bottom 78px, so the target zone reads at a glance.
- 8 perfect hits in a row is **IN THE POCKET** — screen flash, the member cheers, all
  three lanes take a gold border and inner ring (the wash stays, or the lanes lose the
  colours you are aiming at), and the genre's heat moves by `BAL.pocketHeat`. (The brief asked
  for a Hype bonus; Hype was retired, and genre heat is the live system that replaced
  it — so the reward is real, it just lands on the market instead.) Only dense
  patterns deal 8 notes to hit, which is another reason the card matters.
- Your own instrument plays real pentatonic notes on a hit; the other three get a
  muted click, so you can hear which part is yours.
- Quality is normalised over however many tracks are unlocked, so an early one-track
  song can still score well.
- Members also **auto-write solo demos** in the background and while you are away,
  at random Quality 20–50, auto-released. The **band** finishes one per
  `BAL.soloBandSecs` (600s), split across whoever is in it, so hiring shares the
  output rather than multiplying it; member level still speeds it up. Offline output
  is bounded by the time cap alone, which is a lot of songs — see SAVES below.
  Player sessions played well reach 90+.

## 4b. GENRES — 16 OF THEM, AND THE CARDS CHANGE WITH THEM

Sixteen genres: indie rock, hyperpop, trap, synthwave, garage punk, dream pop, drill,
disco, shoegaze, afrobeats, metal, lo-fi, house, reggaeton, folk, k-pop. **The first
ten keep their original index** so an existing save's `heat` array still lines up; the
six new ones are appended and `load()` pads the array rather than resetting it.

Each genre carries its `[energy, grit, polish]` vector, a badge colour `c`, a take/loop
flavour (`w` oscillator, `cut` filter), and `r` — the rank that opens it.

- **You start with three** (INDIE ROCK, TRAP, DREAM POP) and each rank-up opens two or
  three more, 3 → 5 → 8 → 11 → 14 → 16. The genre picker only ever offers what is open,
  and offers `min(4, open)` so the first pick is a real choice from three.
- **Signature cards.** `GCARDS` adds **two cards per instrument per genre — 128 in all**
  — merged into the per-track `CARDS` array with a `g` field. A card with `g` is dealt
  only when you are writing in that genre, so METAL deals Palm-Muted Gallop and Throat
  Scream while LO-FI deals Tape-Warped Rhodes and Half-Whispered Verse. They are merged
  into one array rather than kept separate so `ci` stays a single index and saves,
  `s.picks` and the hint code need no special case.
  > The brief asked for **six unique cards per track per genre** (384). This is two per
  > track per genre on top of the shared pool instead: it gives every genre a visibly
  > different deal without 384 hand-written entries, most of which would be filler.
  > Going to the full six is a content pass, not a mechanics change — the plumbing
  > (`g` gating in `dealStep` and `genreFit`) already supports any number.
- **Home genre, x1.5.** Your first release sets `S.home`; the Band tab can move it. Home
  applies live to every song in that genre via `homeMult`, like the trend multiplier.
- **Trends** are the live heat cycle in §6 — COLD → RISING → HOT → FADING, with a hit in
  a RISING genre able to tip it HOT. That is already stronger than the brief's weekly
  rotation, so it stays as is.

## 4c. FANS AND RANKS — the number that never goes down

**FANS** is the third counter in the header, next to money and streams. It is the only
value in the game that cannot fall, which is why it carries the long goal.

- Earned from **every release**, banked with the rest of the payout on COLLECT:
  `fansFor(q, tier)` = `BAL.fanTier[tier] × (1 + Quality/100)`, `fanTier` = 4 / 25 / 200
  / 1200 / 6000 for flop → #1. Solo demos earn it too, immediately, awake or offline.
- Earned from **playing live**: `fanRate() = BAL.fanGig × gigMoney()`, so bigger rooms
  bring more people as well as more money. (The brief's "every gig win" is this until
  the Daily Gig event lands in BUILD ORDER step 4 — there is no gig *event* yet.)

**RANKS** are pure fan thresholds: Garage Band 0 → Local Act 1K → Regional 10K →
National 100K → Global 1M → Legend 10M. Each one buys four things, all live:

| rank | genres open | gigs | royalty ceiling | crowd |
|---|---|---|---|---|
| Garage Band | 3 | x1 | 9% | small |
| Local Act | 5 | x1.6 | 14% | — |
| Regional | 8 | x2.4 | 20% | — |
| National | 11 | x3.5 | 30% | — |
| Global | 14 | x5 | 45% | — |
| Legend | 16 | x8 | 100% | packed |

- **Bigger rooms** is both halves of the same idea: `gigMoney()` is multiplied by the
  rank, and the crowd drawn behind the band grows (`--crowd` drives the `.crowd`
  height and opacity).
- **The royalty ceiling** is a real cap — `payoutRate()` is `min(rank.payCap, base +
  step × level)`, the Band tab says so when it bites, and BETTER DEAL refuses to sell
  you a rate you cannot use. It is the one place where fans gate money.
- **Better crate odds** are stored on the rank (`crate`) and honestly labelled in the
  rank-up card as banked until crates land with Gear. Nothing reads it yet.
- **The rank-up is a moment**: a full-screen card with the new badge, the fan count, the
  list of what just opened, confetti, a chord, a buzz and the whole band nodding. It
  queues behind the release reveal and the offline panel rather than stacking on them.
- **The header carries the goal**: badge, rank name, "N to <next rank>" and a progress
  bar, on screen every second. Tapping it opens the Band tab.

## 4d. GIGS — playing the songs you already made

A gig is the same three-lane game played for a room instead of for a Quality score.
It is a **sink for the catalogue, never a replacement for it**: the reward is a slice
of the money the band already earns, so a show can never outgrow the songs that pay
for it.

**Tickets.** `BAL.gigFree` (2) a **local calendar day**, refilled — not accumulated —
when `dayNum()` moves forward. `gig.day` only ever increases, so winding the device
clock back buys nothing. Out of tickets → **WATCH AD — GET 1 TICKET**, a labelled
simulation in the same spirit as the other ad stubs: a five-second countdown, no
network, and the ticket lands **only when it finishes**, capped at `BAL.gigAdMax` (3)
a day with the remaining count on the button. A `gigClock` in the tick re-rolls every
10s, so midnight while the game is open refills without a reload.

**The ladder.** `VENUES`: Open Mic → Tiny Bar → Local Club → Packed Club → Small
Theater → Festival Stage → Arena → Stadium. Each carries a difficulty (1–8 stars), a
recommended band power `pw`, the genre the room wants `g`, a reward multiplier `pay`,
a fan payout, and its own backdrop `bg` (a CSS gradient plus a silhouette crowd, no
images). `gig.cleared` is the highest open index — clearing a room opens the next one,
permanently. Replaying pays the normal reward; **the first-clear bonus
(`BAL.gigFirstMult`, x3) is flagged per venue in `gig.first` and never repeats.**

**Setlist.** Up to three of your *released* songs, no duplicates, one is enough to
play. Each row shows title, Quality, tier, genre, live streams/sec, and whether it
matches the room (`venueFit` compares genre vectors, so a near-miss still scores).
AUTO PICK takes the three strongest by `songSPS × (0.5 + fit)`. With nothing released,
the panel says so and PLAY GIG is hidden.

**The show.** One section per song at `BAL.gigSecs` (45s / 30s / 25s for a 1 / 2 / 3
song setlist — 45–75s in total), each using that song's genre for BPM, key, wave,
filter and note pattern. It reuses the take engine wholesale: `take.mode = 'gig'`
switches the meter to **CROWD HYPE**, routes hits and misses into `hype()` instead of
the take meter, and never fails you out. Hype rises with hits, perfect streaks, song
strength and genre fit, and bleeds `BAL.hypeDrift` a second, so a show has to be
played rather than survived. The crowd behind the band grows and bobs through four
states, and milestones fire at 40 / 70 / 90. Finish above `BAL.gigEncoreAt` (88) and
you get an **encore** section on the opening song.

**The result** is the brief's weighting exactly — `BAL.gigWeights`: 40% performance
(itself 60% hit accuracy + 40% peak hype, so the meter is worth watching), 25% song
Quality and tier, 15% crowd fit, 15% band power against the room's `pw`, 5% setlist
variety. ROUGH SHOW below 45, GOOD SHOW to 79, SOLD OUT at 80. Good or better clears
the room; a rough show still pays `BAL.gigRough` (25%) so the ticket is never wasted,
and sold out adds `BAL.gigSoldBonus` (35%). The panel breaks the five parts out as
bars and names what carried the night and what to fix.

**Nothing is banked until COLLECT**, the same protected pattern as a release:
`gig.payout` holds `{m, f, out, score, first, cleared, parts}` in the save, and `boot()`
re-shows the panel (silently — no sound before a tap) if the tab closed first.
`gig.active` is set the moment the first note falls and the ticket is spent there;
if the tab closes mid-show `boot()` clears it, says so, and pays nothing. Reopening
never costs a ticket, and collecting twice does nothing.

## 5. RELEASE
Slot-machine chart reveal: title → procedural cover → chart-position reel → tier.
Flop / Solid / Hit / Viral / #1, **weighted by Quality** (`ODDS` table, interpolated:
at Q90 exactly 40% land Hit or better). 25% of Flops and Solids show the reel land
one tier higher before settling. Skippable after the first reveal.

**Nothing is banked until the player presses COLLECT.** The reveal ends on a payout
card — streams on one line, money on the other, and the song's `/s FOREVER` under
them — and the numbers sit there until the button is pressed. `S.payout` holds the
pending `{s, m}` in the save, so closing the tab mid-reveal does not lose it: `boot()`
banks anything left over. The counters in the top bar ease up to the new totals on
the press, and a toast says how much money landed.

## 6. TWO RATES: STREAMS/sec AND MONEY/sec
The top bar shows both, each with its total and its rate. They are separate numbers
with separate jobs: **streams are reach, money is what you spend.**

    streams/sec = Σ songSPS(catalogue)            starts at 0
    money/sec   = gigMoney + streams/sec × payoutRate    starts at 1.0

**Streams come only from released songs.** A band with nothing out streams nothing,
and the counter sits at 0 until the first release — streams are what a *record* does,
not what a person does.

**Money has its own floor.** `gigMoney = 1.0 × (1 + 0.5 × (members − 1)) × rank.gig`
— the band plays live for cash, in rooms that grow with the rank. This is why money can start at 1.0/sec while streams start at 0;
without it the two requirements contradict each other. It also gives hiring an
immediate payoff before you have any catalogue.

- **Members multiply the catalogue** — `bandMult = 1 + Σ (sps × level^0.55 × rarity)` —
  rather than emitting streams themselves. A level-up therefore lifts *every song you
  have ever released*, retroactively, and shows in the top bar at once.
- The `level^0.55` is load-bearing, not decoration. See PACING below.
- A song's `base` is fixed at release from Quality and chart tier; band multiplier,
  studio, trend and decay are all applied **live**.
- **payoutRate** starts at 0.04 and rises `+0.008` per Royalty Rate upgrade
  (cost `250 × 2.1^n`), **capped by the rank's `payCap`** (§4c). It multiplies
  *everything*, so it stays worth buying up to the ceiling your fans have earned.
- **No passive money from tapping.** Every released song earns its own streams/sec:

    base  = 1.0 × qFactor(Quality) × tierMultiplier          (fixed at release)
    live  = base × bandMult × studioMultiplier × genreTrend(now) × decay(now) × homeMult

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
- **Release payout**, banked on COLLECT: `payoutSecs` (40) seconds of that song's
  streams, plus a money advance of `streams × payoutRate × advanceMult` (8). The
  advance is deliberately small in absolute terms and proportional in shape — a Q56
  Solid at a fresh full band pays around 140, a Q63 Viral around 1.3K — so pressing
  the button means something early and is noise once the catalogue carries you.
  Simulated at 168h it moves the milestones by a few percent (casual full band 1.7h →
  69m) and still lands a week of steady play at Label HQ.

## 7. YOUR CHARACTER, AND HIRING THE REST
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

## 8. UPGRADES (all bought with money)
- **Member levels** — cost `lvlCost × 1.15^n`. Raises that member's streams/sec,
  scales every song, unlocks better cards, sharpens hints, speeds up solo demos.
- **Royalty rate** — the payout multiplier, see §6.
- **Rarity** — Common→Rare→Epic→Legendary→Mythic, from crates; merge 3 → one up.
- **Gear** — 2 slots per member; visible on the character; unlocks writing cards.
- **Studios** — Garage → Bedroom → Rehearsal → Pro Studio → Label HQ → Tour Bus →
  Stadium → Space. Each x4 all song streams and repaints the stage.

## 9. PACING — why the curve is shaped the way it is

The first cut of this economy finished itself in **under an hour**: 1M money at 12
minutes, 1B at 45, every member at level 145, the whole studio ladder spent. The
cause was structural, not pricing. A member's level multiplied the *entire
catalogue*, and the catalogue itself grows with every release — so income compounded
on two axes at once while level costs grew at only 1.15. Cheap linear levels
outran an exponential price curve, and no amount of re-pricing fixes that shape.

Three changes fixed it, and they must be kept together:
1. `level^0.55` instead of `level` in `memberSPS` — diminishing returns per level, so
   a multiplier that touches every song cannot outrun its own cost curve.
2. `costGrow` 1.15 → **1.25**.
3. Studios x5 → **x4**, with costs rescaled to `8e3 … 2.5e14`.

Plus supporting cuts: `songScale` 1.5→1.0, `payoutBase` 0.10→0.04, `payoutSecs`
90→40, member prices `[30, 300, 2200]`, level costs `[14, 22, 34, 50]`.

**Measured** (greedy buyer, headless, real game code, 168 simulated hours):

| milestone | steady (a song every 2 min) | casual (every 10 min) |
|---|---|---|
| 2nd member | 2m | 2m |
| Local Act | 6m | 1.5h |
| full band | 22m | 88m |
| Bedroom Studio | 35m | 2.4h |
| Regional | 38m | 2.8h |
| Rehearsal Space | 82m | 5.2h |
| Pro Studio | 3.9h | 12.5h |
| National | 6.7h | 32.3h |
| Label HQ | 12.9h | 34.1h |
| Global | 3.5d | not in a week |
| Tour Bus | 6.3d | not in a week |
| Stadium / Space | not in a week | not in a week |

A week of steady play now ends at **Tour Bus, rank Global, 2.16M fans**; a casual week
ends at **Label HQ, rank National**. Stadium and Space stay past a week, which is where
prestige is meant to sit.

**This is about twice as fast to Label HQ as the pre-fans build (12.9h against 23.6h),
and the cause is worth knowing before anyone retunes.** It is not the home-genre x1.5
(that touches maybe an eighth of the catalogue) and not the gig multiplier (gig money
is rounding error once songs are streaming). It is the **royalty ceiling**: when the
rate is capped, the money that would have bought the next Royalty Rate upgrade goes
into **member levels** instead, and levels multiply the entire catalogue. A cap meant
to slow the player down redirects them to a *better* purchase. A real player faces the
same choice, so this is genuine rather than a simulation artefact.

The pacing was left as measured rather than re-tuned, because the shape §9 protects is
intact — nothing runs away, and the top of the ladder is still out of reach in a week.
If it should be pulled back to the old curve, the one knob is `costGrow` 1.25 → **1.26**
(about 2.2x on a level-100 cost, about 8% at level 10, so it bites late and not early).
Re-run the simulation after changing it.

**If you retune, re-run the simulation** (`scratchpad/.../verify.js` pattern: drive a
greedy buyer through the real `moneyRate`/`upCost`/`addSong` functions for 168
simulated hours). Reading the tables is not enough — the runaway was invisible until
it was simulated. One trap: the game's top-level `const` helpers (`memberSPS`,
`studioMult`, …) are **not** `window` properties, so `window.memberSPS = …` in an
injected override silently does nothing and the run measures unchanged formulas.

## 10. SAVES, OFFLINE AND SETTINGS

**Saves.** Autosave every 5s in the tick, plus on every purchase, release, rename and
settings change, and on `visibilitychange`/`pagehide`. Every write flashes a **SAVED**
pill in the top bar for ~1s (`flashSaved()`), and Settings carries a Save section with
"Last saved N ago", the save's size in KB, and a manual SAVE NOW — autosave is
invisible otherwise, and a player has no way to trust it. `save()` writes a versioned
object under `chartbreaker.v3`; `load()` migrates v1 and v2 rather than throwing, and
fills defaults for anything a newer field added.

**Offline.** `save()` stamps `lastSeen`. On return, elapsed time is capped —
**8h, or 24h when `S.vip`** — and *nothing accrues past the cap*: solo demos and
streams both use the capped span, not the raw one. Reaching the cap sets `S.capHit`.

The return is a full-screen `#gone` panel, not a modal: time away, songs released,
streams and money, counted up with an eased `requestAnimationFrame` ramp. **WATCH AD
FOR x2** is a stub — it doubles the pending reward once, with no ad and no network.
COLLECT banks it and clears the capped state.

**Measured offline output** (full band at level 5): 3h → 20 songs, the 8h cap → 56,
the 24h VIP cap → 176. That is deliberate per the brief's "1 song per 10 min", but it
is roughly 4x the earlier trickle and a returning player's catalogue will be mostly
solo demos. `BAL.soloBandSecs` is the one knob — raise it to thin them out.

Because of that volume, `addSong` trims the catalogue at 200 by dropping the oldest
**solo demos first**. A plain tail-trim would delete the player's own early releases,
which are the Hit-or-better ones that never decay.

**Storage full.** Without a service worker nothing can run while the tab is gone, so
the badge is best-effort: on hide a timer is armed for the cap, and if the page is
still resident when it fires it sets `navigator.setAppBadge` and — only if permission
was already granted — a local notification. On return, a capped save sets the app
badge and the document title to "Storage full · Chart Breaker" until COLLECT. Real
background delivery needs `sw.js`, which is still deferred.

**Settings** (cog in the top bar, opens as a sheet): sound, storage-full reminder
permission, cloud save, reset.

**Cloud save is a stub and must look like one.** SIGN IN stores
`player@chartbreaker.demo` locally and stamps `S.cloud.at` on every save so the
"Synced N ago" line moves; nothing leaves the device. It deliberately does *not*
present a sign-in form or any Google branding — a fake credential form would be more
misleading than a plainly-labelled demo. The panel says so in copy. When a real
backend arrives, replace `settingsAct('signin')` and keep the shape.

**Reset** is behind a two-button confirm naming the band, and clears every save key
including the old ones before reloading.

## 11. SOUND (the differentiator — do not skip)
Web Audio synth only, no samples. Every tap plays a pentatonic note in the song's
key. **Each decided track fades its instrument layer into the loop** — so the song
assembles as you make decisions, and a finished demo is a 4-layer loop. The chosen
card's energy shapes its layer (filter cutoff, hat density). BPM comes from the
genre's energy and drives both the loop and the characters' bob. Studio upgrades add
reverb. Release plays a chord. Mute toggle. Haptics on tap and on Hit/Viral.
During a **take**, a hit on your own track plays a real pentatonic note whose timbre
follows the card's energy; the other three tracks get a muted click, so you can always
hear which part is yours. `AU.takeHit(yours, energy, good)`.

## 12. CURRENCIES
- **Streams** — reach. Accumulates from the rate above; drives Legacy at prestige.
- **Money** — the spend currency. Members, levels, royalties, studios.
- **Fans** — the rank currency, and the only number that never falls. See §4c.
- **Gig tickets** — 2 a local day, up to 3 more from the ad stub. Not a currency you
  can buy or bank; see §4d.
- **Picks** (premium) — crates, skips, streak saves.
- **Legacy** (prestige) — permanent multipliers.
- **VIP** — `S.vip` only raises the offline cap to 24h today. Nothing grants it yet;
  the Shop card is still a stub, so the 24h path is reachable only by setting the flag.
Formatting: 1.2K, 3.4M, 8.9B, 1.1T… Counters animate up.

## 13. UI (portrait, one-thumb)
Top: three animated counters side by side — MONEY, STREAMS and FANS (each total + /s)
— then the **rank bar** (badge, rank name, fans to the next rank, progress bar; tap it
for the Band tab), then band name, Picks and studio chips. The toast rail sits below
all of that.
Middle: the stage — 4 SVG characters, the active one stepped forward.
The **Band tab is a full-page screen** (`#sheet.full`), not a bottom panel: band
identity, royalty rate, studio, every member with level and upgrade, and empty slots
with prices. The other tabs remain bottom sheets.
The idle dock also carries **GIGS** (with the ticket count), which opens `#gigs`, a
full-screen panel: tickets and next refill, the venue ladder, then the venue brief and
setlist. The show itself reuses `#takefs` with `.gig` on it — same lanes, hype instead
of the take meter, no AUTO-TAKE. `#gigres` is the result card.
Bottom dock, one of four states: **idle** (solo-demo progress + WRITE A SONG),
**genre** pick, **writing** (timer, song-sheet strip, 3 cards), **quality** (score +
RELEASE IT). The **take is not a dock state** — it is `#takefs`, a fixed panel over
the bottom 46% (min 300px) holding its header, meter, three lanes and AUTO-TAKE,
with the stage and the song-sheet strip still visible above it. Each lane owns its
own `pointerdown`; `jam()` returns early while a take is running, so the only input
during a take is the lanes. Tabs: Band | Gear | Catalog | Shop | League open as bottom sheets over
the stage. Targets ≥44px, `env(safe-area-inset-*)` respected.

## 14. SHOP (stub)
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
- Recording takes verified in headless mobile Chromium: three 119x231 lanes at the
  bottom of the screen with the band still visible above, labels following the
  instrument, notes dealt into lanes from the card's pattern, a bot tapping the right
  lane inside the perfect window scoring PERFECT and running the streak up (IN THE
  POCKET fires at 8, lanes go gold, genre heat +2), a wrong-lane tap reading WRONG
  LANE and costing meter, a take with no taps bottoming the meter out and scoring 0,
  the 20-second decision clock frozen for the length of the take, AUTO-TAKE banking
  5/tracks and closing the panel, and the Quality note reporting "takes +N". A take
  played clean scores 5, or 6 when the streak reaches x4. Frame time with 42 notes
  falling: median 16.7ms, p95 17.0ms, worst 18.2ms.
- Fans, ranks and the 16 genres verified in headless mobile Chromium: 16 genres with
  3 open at Garage Band and 5 after the first rank-up; 128 signature cards merged into
  the per-track pool, dealt only in their own genre (checked: no foreign-genre card
  ever entered a deal, and `genreFit` ignores them too); the genre picker offering only
  what is open; fans landing on COLLECT with the streams and money (a Q-mid Solid paid
  41); the first release setting the home genre; a forced rank-up showing the full-page
  card with the right unlock list, then opening 2 genres and lifting gig money 2.5 → 4;
  the header rank bar tracking fans (Local Act, 35.6% to Regional) and the crowd
  growing with it. Suite t1/t2/t4/e1/f1/sv all pass, no console errors.
- Gigs verified in headless mobile Chromium, two suites: the happy path (8 venues with
  1 open, the no-songs message, auto-pick, no duplicate slots, a hard cap of 3, the
  ticket spent on start, a 3-song show reaching SOLD OUT 82 with the breakdown, COLLECT
  moving money and fans exactly once, the next venue opening, the first-clear tag not
  coming back) and the edges (the ad granting only when the countdown ends, the 3/day
  cap disabling the button, a new day refilling to 2, a clock wound backwards refilling
  nothing, a one-song setlist running as SONG 1/1, a ROUGH SHOW at 44 paying 227 and
  unlocking nothing, a reload mid-show clearing `gig.active` and paying nothing while
  re-offering an uncollected payout, a second COLLECT adding nothing, and reopening not
  costing a ticket). Frame time during a gig: median 16.7ms, p95 16.7ms.
- Fixed along the way: the take lane's `@keyframes fall` had silently overridden the
  confetti's own `fall`, so every confetti burst in the game had been freezing 240px
  down the screen. The lane's is now `notefall`.
- COLLECT verified: the reveal holds `S.payout` (a Q63 Viral = 3.97K streams / 1.27K
  money), the money counter does not move until the button is pressed, and it then
  jumps by exactly the held amount. Suite t1–t4/e1/f1/sv all pass, no console errors,
  frame time median 16.7ms / p95 17.5ms.

- Saves, offline and settings verified: settings sheet, cloud stub round trip, sound
  toggle persisting into the save, reset confirm + cancel; offline at 3h / 9h (capped
  to 8h, storage-full badge and title) / 30h VIP (capped to 24h); the x2 stub and
  COLLECT; and 3 player releases surviving a flood of 250 solo demos.
- Visual overhaul applied from `design/`: warm palette throughout, characters
  redrawn with real instruments (animation and pivots unchanged), UI emoji replaced
  with an inline SVG icon set, procedural cover hues constrained to the warm/teal
  family.
- Economy verified: a fresh band sits at **0 streams/sec and 1.0 money/sec**; hiring
  raises gig money (1.0→1.5) with no songs out; the first release starts streams;
  hire ladder 30/300/2200; first level 14; royalty 4% at 250. Pacing per §8.

**Known gaps (deliberate, deferred):** gear, crates as real drops (and with them the
rank's `crate` bonus, which is stored but unread), rarity/merge,
the *Daily* Gig and rival/multiplayer gigs (the regular ladder in §4d is built),
six-cards-per-track-per-genre (128 signature cards ship, 384 do not),
streaks, prestige, league, weekend events, real shop, LLM content,
`sw.js` offline (and with it, true background storage-full notifications), a real
cloud-save backend, any way to actually grant VIP.

**Removed along the way:** the tap-to-fill-tracks loop, Hook Moments, the Hype stat
(Quality shifts chart odds instead), and weekly-seeded genre trends (replaced by the
live heat cycle). Time-gated member unlocks are gone too —
members are hired with money now. v1 and v2 saves are migrated (streams→money at the
base payout rate, levels, ownership, songs, time away) rather than discarded.

## CONVENTIONS

- Palette tokens live in `:root`. Never write a raw hex in a rule — if a colour is
  missing, add a token. The JS colour tables (`MEMBERS.c1/c2`, `RARITY`, `TIERS`,
  `TRENDS`, `STUDIOS.bg`, `SKIN`, `HAIRC`, `RARITY_TRIM`, `GENRES.c`, `RANKS.c`) carry
  the same palette and must move with it. `GENRES.c` is the one table that needs more
  hues than the palette has — sixteen genres have to be told apart at a glance — so it
  extends into the same warm/teal/blue family rather than inventing a second style.
- A member's own colour is their shirt; **rarity is a treatment on top** (jacket
  panels → studs → trim + glow → aura), not a recolour. That keeps the four members
  distinguishable at every rarity.
- Everything lives in `index.html`. Keep the section-comment banners
  (`/* ===== AUDIO ===== */` etc.) and add new systems as new banners.
- Tunables live in the tables near the top of the script — `BAL`, `MEMBERS`,
  `RARITY`, `STUDIOS`, `TIERS`, `ODDS`, `GENRES`, `GCARDS`, `RANKS`, `CARDS`, `PATTERNS`. Never inline a balance
  number in logic. Studio costs are on the *money* scale, which accrues roughly 10x
  slower than streams — rescale them if `payoutBase` ever changes.
- Card vectors are the game's difficulty knob. `DSCALE` (2.2) is the distance at
  which a card scores zero; it is tuned to how far apart the real card vectors sit,
  not to the theoretical maximum. Raising it flattens Quality; lowering it punishes.
- `save()` writes a versioned object; `load()` must tolerate older versions by
  filling defaults rather than throwing.
- No blocking work in the render loop. Audio buffers are built off the first tap.
- Test by opening the file directly on a phone — there is no dev server.
