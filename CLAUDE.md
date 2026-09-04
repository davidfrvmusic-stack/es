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

## 2. PALETTE AND TYPE — CONCERT NEON

Dark, energetic, a music game rather than a toy. Roughly **70% ground, 20% surface,
10% accent**. Tokens live in `:root` and JS reads them through `PAL` — change them
there, never in a rule.

| token | value | use |
|---|---|---|
| `--cream` / `--cream2` / `--cream3` | `#0B0D12` `#12161F` `#171B24` | app ground, stage, stage floor |
| `--panel` / `--elev` | `#171B24` `#242B38` | cards and sheets / raised: pads, chips, pressed |
| `--line` / `--line2` | `#2C3444` `#3A4356` | 2px borders (this UI outlines, it does not shadow) |
| `--ink` / `--dim` / `--dim2` | `#F7F4EE` `#AAB2C0` `#8A93A3` | text — 17.7:1, 9.1:1, 6.0:1 on the ground |
| `--onAccent` | `#0B0D12` | **the label on any bright fill** |
| `--accent` / `--accent-dk` / `--accent-sh` | `#FF5364` `#C93B49` `#A32E3A` | coral: the primary action, money, drums |
| `--accent2` / `--accent2-dk` | `#20D6C7` `#15998F` | teal: progress, streams, bass |
| `--gold` / `--gold-dk` | `#FFC247` `#C68E27` | gold: rewards, PERFECT, first clear, guitar |
| `--violet` / `--violet-dk` | `#8C6CFF` `#6247C4` | violet: premium, epic rarity, vocals |
| `--ok` / `--bad` | `#47D982` `#FF4D4D` | success / miss and destructive |
| `--face-ink` | `#241A14` | eyes, mouth, straps — drawn on skin, dark in any theme |

**Bright fills always take a near-black label.** Cream on coral is 2.9:1 and fails;
`--onAccent` on coral is 6.2:1. Violet is the tightest case — 3.4:1 with cream,
5.3:1 with near-black — so there is no exception.

**Reserved meanings, never mixed.** Coral is the primary action. Gold is only ever a
reward, a first clear or a PERFECT. Violet is only ever premium or high rarity. A
genre may tint the lighting but never repaints a navigation or action colour, and no
screen shows more than three accents at once.

**Never colour alone.** Every state carries a second channel — CLEARED is teal *and*
the word; a miss is red *and* a lane shake *and* MISS; rank is a colour *and* its own
badge silhouette.

Buttons carry a solid `0 5px 0` shadow in their own dark tone and press *down* into
it — no gradients, no blur, and on a dark ground no glow. Borders are 2px. Icons in
persistent chrome are inline SVG on a 24px grid (`ICON` + `ico()`); emoji survive only
as expressive punctuation inside toast text.

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
  strike line across its bottom 78px, so the target zone reads at a glance. **Notes are
  clipped to their own lane** (`.ncol` clips at the lane's radius), so a hit burst can
  never bleed into the lane next door.
- **A take says it is a take.** The panel's first line is a pulsing red **REC** dot, the
  track, `take 2 of 4`, the streak chip, the clock and AUTO-TAKE; the second is the
  chosen card and the member playing it, with `TAKE METER` labelling the bar under it.
  The studio panel sits on `--cream2` behind a neutral rule; the gig panel (§4d) sits on
  `--cream3` behind a coral one, so a recording never looks like a show.
- **One feedback slot** (`#feed`, `feed()`). PERFECT / GOOD / MISS / WRONG LANE, the
  streak crossing a multiplier step, IN THE POCKET, the crowd milestones and the encore
  all land in the same place, one at a time. The rule: a judgement is worthless a moment
  later, so a newer one replaces an older one immediately — but a **moment** holds the
  slot for its own 0.9s, because it is the thing the player will remember and a PERFECT
  80ms later would erase it. The running `N IN A ROW` line is gone; the multiplier chip
  is the persistent status, and only *crossing* a step is news.
- **The economy steps back while you play.** The three counters and the rank bar drop to
  55% for the whole decision-and-take (`#top.play`), and the band name and studio line on
  the stage fade out entirely, because the stepped-forward member fills that space.
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
- **Where genres live in the UI.** Two places, split by what the player is doing.
  **Band** ends with *Your genres*: a row of `.gchip` badges, one per open genre, the
  home one teal and tagged `· HOME`. That is identity — what this band plays — and it
  carries no buttons. **Music → TRENDS** (`htmlGenres()`) is the management pane: only
  the genres your rank has opened, home pinned first and the rest by heat, each showing
  its trend, heat, multiplier and what it would be worth as home. The home card is a
  teal `.card.home` with a `HOME · x1.5 STREAMS` tag and no MAKE HOME button, and the
  Music tab repeats it above the segment so the current home reads without switching
  panes. **Locked genres are never listed anywhere** — one line on each side says how
  many open next and at which rank ("3 more open at National — 58.0K fans away"), or
  that everything is open; the Band line (`#genreHint`) also points at Music. The count
  comes from `nextGenreDrop()`, which skips any rank that opens nothing.
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
the take meter, and never fails you out.

**A gig replaces the header instead of dimming it.** `#top.gig` hides the counters and
the rank bar and shows the room: a ticket glyph, the venue's name, and `SONG 2 OF 3`
(or `ENCORE`). Money and fans are not what you are doing on a stage. The panel drops the
REC dot and the AUTO-TAKE button, names the song in full on its own line, and labels the
meter `CROWD HYPE · <TIER> <n>`.

**The crowd is never a bare number.** `HYPE_TIERS` is one table carrying both the label
and the shout: WARMING UP (0), WITH YOU (40, "THE ROOM IS WITH YOU"), LOUD (70, "THEY'RE
SINGING IT BACK"), ON FIRE (90, "THIS PLACE IS GOING OFF"). Crossing a tier fires the
shout once, with confetti and a buzz; the label rides the meter continuously. The
thresholds are the milestones that were already there — they now have names.

> **`AUTO-PERFORM` was in the plan and is deliberately not built.** The redesign's gig
> wireframe drew an auto button under the lanes, mirroring AUTO-TAKE. A gig you can skip
> is a gig the catalogue plays for you, which is exactly what §4d says a gig must never
> be — and adding one would change what a show pays for, which the brief for this stage
> ruled out. The button stays hidden in gig mode. Hype rises with hits, perfect streaks, song
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
  Stadium → Space. Each multiplies all song streams by `BAL.studioStep` (4) and
  repaints the stage.

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

**HOME answers one question: what should I do next?** Three animated counters side by
side — MONEY, STREAMS and FANS (each total + /s) — with the settings cog and the sound
toggle; then the **rank bar** (badge, rank name, the exact fans to the next rank, a
progress bar; tap it for the Band tab). The toast rail sits below that. There is no
chip row any more: the band's name and the studio it plays in are printed on the stage
itself, above and below the band, and Picks moved to the Shop where it is spent.

Middle: the stage — 4 SVG characters, the active one stepped forward — with the SAVED
pill floating top-right and `#rail` under it. **The rail draws one icon per system that
has something waiting** (daily, event, inbox); none of those exist, so it renders
nothing at all. That is the rule working, not a gap — nothing inactive is drawn.

Bottom, on HOME: the **Next Goal** card, one **demo line**, the **adaptive CTA** and
**GIGS**.
- **Next Goal** (`GOALS`, nearest first) names one thing and how close it is: release
  your first song → hire the next member → play the room whose first clear is still
  unpaid → move into the studio you can afford → the fans to the next rank, and what it
  opens. A goal you can act on in the next minute outranks a rank three hours out.
- **The demo line** is one bar, not four. The band shares one solo-demo output
  (§4), so it shows whoever is closest to finishing, and hides entirely with no band.
- **The adaptive CTA** is one button reading the state it stands in: COLLECT (gold) if
  a release or gig payout is unbanked, RELEASE SONG (gold) if a demo is waiting,
  CONTINUE SONG (teal) mid-session, else WRITE A SONG (coral). Collectables outrank
  everything — if money is on the table the button says so. The first three are safety
  nets rather than everyday states, because the dock and `boot()` normally catch those
  cases first; they exist so no path can strand a payout behind an idle screen.
- **GIGS** stays the secondary outline button, with the ticket count on it.

Home's accent budget is exactly three: coral CTA, teal rank bar, gold Next Goal.
**Every tab is a screen, not a drawer.** `#sheet` fills everything from the top to the
tab bar (`bottom:calc(var(--safe-b) + 56px)`) and swaps its content in place — a tab is
somewhere you go, not something that slides over the stage. There is no scrim, no grab
handle and no slide-up: pressing BAND cross-fades HOME out and BAND in, and pressing
HOME brings the stage back. The ✕ survives only on **Settings**, which is reached from
the cog and owns no tab of its own (`#sheet.noTab`); every other screen is left by
pressing another tab. The cog itself lives in the top bar, so Settings is reached from
HOME. BAND holds band identity, rank, royalty rate, studio, every member with level and
upgrade, empty slots with prices, and *Your genres* at the bottom.
The idle dock also carries **GIGS** (with the ticket count), which opens `#gigs`, a
full-screen panel: tickets and next refill, the venue ladder, then the venue brief and
setlist. The show itself reuses `#takefs` with `.gig` on it — same lanes, hype instead
of the take meter, no AUTO-TAKE. `#gigres` is the result card.
**While you play, the HUD is the subject and nothing else is.** The header dims to 55%
for a decision or a take and is replaced outright by the room for a gig; the stage's own
two labels fade; feedback lands in one slot rather than three overlapping positions; and
notes are clipped to their lane. The take panel and the gig panel are told apart by
their ground, their top rule, the REC dot and the presence of AUTO-TAKE.

Bottom dock, one of four states: **idle** (Next Goal + demo line + adaptive CTA + GIGS),
**genre** pick, **writing** (timer, song-sheet strip, 3 cards), **quality** (score +
RELEASE IT). The **take is not a dock state** — it is `#takefs`, a fixed panel over
the bottom 46% (min 300px) holding its header, meter, three lanes and AUTO-TAKE,
with the stage and the song-sheet strip still visible above it. Each lane owns its
own `pointerdown`; `jam()` returns early while a take is running, so the only input
during a take is the lanes.
**Four tabs: HOME | BAND | MUSIC | SHOP.** HOME is not a screen — it is the stage with
nothing over it, so the tab just calls `closeSheet()` and is the selected one at rest;
that keeps one shell instead of a router. BAND is the screen above. MUSIC
holds the home-genre card and a `.seg` of **SONGS** (the catalogue, `htmlSongs()`) and
**TRENDS** (`htmlGenres()`), remembered in `musicTab`; switching tabs scrolls the new
screen to its top, while re-rendering the one you are on keeps your place. SHOP is the
stub, and Settings is still reached from the cog rather than a tab. Gear and League are gone from the bar
until they are real — an empty tab is a worse promise than no tab. Targets ≥44px,
`env(safe-area-inset-*)` respected.

## 13b. THE CHARACTER SHEET

Tap a member **on the stage** — or their row in the Band tab — and you get their own
screen. It is a *detour*, not a tab: `sheetBack` remembers where you came from, the
header button becomes `←` instead of `✕`, and it returns you there. Opened from the
stage there is nowhere to go back to, so it is a `✕` and closes to the stage. An empty
slot is a hire rather than a person, so tapping one opens the Band tab instead.

**The tap is gated on the game being idle.** During a writing session every tap on the
stage is a jam (§4), and during a take the lanes own the input — so a member tap only
opens the sheet when no session, take or reveal is running. The jam mechanic is
untouched.

What the screen holds, top to bottom:
- **Portrait, identity, bio.** The same `charSVG` as the stage, at 104x132, with the
  role, an `LV n` chip, the rarity chip and their one line of bio.
- **What they bring** — the two things a member actually does today: their band
  multiplier (with the reminder that it lifts the *whole* catalogue, and what that
  catalogue currently earns) and their writing-card count, hint clarity and the next
  card level unlocks.
- **Stats** — SKILL / WRITING / STAGE / STAMINA, drawn as four empty hatched rails
  labelled `SOON`. They are deliberately **not filled with a number**: nothing in the
  game computes them yet, and a rail with an invented value in it is a lie the player
  cannot check. They arrive with Gear.
- **Gear** — two dashed slots, `INSTRUMENT` and `RIG`, tappable and honest about what
  they are waiting for.
- **Level n → n+1** — three `before → after` rows measured with the real formulas
  (`memberSPS`, the hint curve, the card pool), then `LEVEL UP · cost`. When the money
  is short the button greys out, disables itself, and the line under it says how much
  more is needed. Buying calls the **existing** `buy('lvl', i)` — same cost curve, same
  effect, no new economy — and the portrait bumps in answer.

`renderSheet()` now restores `scrollTop` after a re-render, so buying something no
longer throws you back to the top of the screen.

## 13c. REWARD MOMENTS, AND THE THREE LAYERS

**Four panels, one component.** `#reveal`, `#gigres`, `#rankup` and `#gone` all say the
same three things — what it was, how much, and one button to take it — so they now share
their ground, padding, `.meyebrow`, `.mhead`, `.mnum` and `.mgo`. Only the middle of each
panel differs: the chart reel, the five score bars, the unlock list, the offline haul.
**Every collect is gold** (`.mgo`), because gold is the reward colour and nothing else;
`#goneGo` used to be teal and was the odd one out.

**Every reward lands in three layers, and `reward()` is the one place all three happen**,
so a new reward cannot ship with two of them:

| layer | what it is | where |
|---|---|---|
| 1 · the press answers | a chord and a haptic, on the press itself | `AU.chord` + `buzz` |
| 2 · the number moves | the counter **eases up, never snaps**; its tile pops; the amount floats off it in place of the label | `statPop()` |
| 3 · the band answers | all four characters nod on stage | `bandNod()` |

Audited action by action:
- **Release COLLECT** — money, streams and fans all pop; big chord.
- **Gig COLLECT** — money and fans; the chord is `big` only on a SOLD OUT.
- **Rank up TAKE IT** — the number that changed is the **rank bar**, so the bar itself
  pops rather than a counter.
- **While you were gone COLLECT** — all three.
- **A member LEVEL UP** — the number that moved is a *rate*, not a total, so the streams
  tile pops with `+N/s`: what a level actually buys is more per second from every song
  already released. The portrait bumps on the character sheet as well.

Two counters were **snapping instead of moving**: `collectGig()` set `dispM = S.money` and
`collectGone()` set all three `disp*` to their new totals, so the single most rewarding
moments in the game showed no movement at all. Both now leave the easing alone.

## 14. SHOP — RESERVED, NOT FAKED

Shop is your **Picks balance** (real state) and then `RESERVED`: one labelled rail per
surface the shop will hold — Gear, Crates, Picks, Backstage Pass, Offers. Each names what
it will contain, which BUILD ORDER step brings it, and shows hatched ghost tiles in the
shape of the future content.

**No rail mimics a product.** There are no prices on buttons and no buttons at all: a
greyed-out `BUY ₪12` reads as *you cannot afford this*, which is a lie about something
that does not exist. The rails carry the spec as text instead — Bronze 50 · Gold 150 ·
Mythic 500 Picks, packs of 100 · 550 · 1200 · 3500, VIP's x2 income and 24h offline cap —
so nothing is lost and nothing is pretended. When a surface ships it replaces its rail and
the screen's shape does not move.

**The Home rail is declared, not empty** (`RAIL`, §13). Its three entries — daily, event,
inbox — each read the state they will own (`S.daily.ready`, `S.event.live`,
`S.inbox.length`). None of that state exists, so every `when()` is falsy and the rail
draws nothing; the moment a system sets its field, its icon and badge appear with no new
component and no layout to find room for. `newState()` is untouched, so the save shape
does not move either.

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

**Phase Two, stage 1 — the palette is flipped.** The game is dark. What that pass
touched beyond the token values, because a value swap alone would have broken them:
- **Members take the four instrument colours** the direction names — drums coral, bass
  teal, guitar gold, vocals violet. The vocalist used to wear `--ink`, which is now
  near-white; violet both fixes that and matches the spec.
- **Faces needed their own ink.** Eyes, mouth and the guitar strap were drawn with
  `--ink` because it was dark. On a dark theme they would have turned white on the
  face, so they now use `--face-ink`, which is dark in any theme. Skin and hair tables
  are untouched — those are content, not palette.
- **Every meter trough moved to `--elev`.** They were `--line`/`--cream3`, which on a
  dark ground is the same value as the card behind them, so a bar at 5% looked empty.
- **Rooms gained an identity colour.** `VENUES[].bg` is the (dark) stage backdrop
  during a show; the new `VENUES[].c` is the room's colour on its card, because a dark
  backdrop on a dark card reads as a hole.
- **The stage spotlight went from a white wash to a dim warm beam**, the crowd's
  opacity roughly doubled so silhouettes read against the dark, and the screen flash
  dropped from 0.5 to 0.22 — on a dark ground a half-white flash is a blast.
- **Sixteen genre badges re-authored** so every one clears 3:1 on `#0B0D12`, none of
  them reusing a reserved accent exactly (METAL had been `--ink`, i.e. invisible, then
  near-white).
- The PWA `theme-color` is `#0B0D12`.

**Phase Two, stage 2 — one button, one panel, one surface, one meter, one pill.**
A pure refactor: the shared declarations moved into grouped base rules placed ahead of
the specific ones, and each specific rule kept only what actually differs.

| shared declaration | before | after |
|---|---|---|
| `position:fixed;inset:0` on a full-screen panel | 9 | 4 |
| `display:none;flex-direction:column` + `.on{display:flex}` | 6 | 1 |
| the press `transform:translateY(2px)` | 6 | 1 |
| the meter trough `background:var(--elev);overflow:hidden` | 6 | 1 |
| the card surface `background:var(--panel);border:2px…` | 20 | 13 |

**Class names were deliberately not renamed.** The plan proposed collapsing 55 classes
to 28 by deleting `.venue`, `.songpick`, `.card2`, `.rolebtn`, `.slot2` and friends in
favour of one `.card`. Ten test suites bind to those exact selectors, and the later
stages restructure Home, navigation, the HUD and the character sheet — none of which
gets cheaper because a venue row is called `.card`. So the *rules* were consolidated
and the *names* kept: the plan's actual goal, "edit one button, not four", is met, and
no suite needed touching.

Two real bugs the refactor exposed, both from cascade order:
- `.locked` (dashed, `--line2`) had been silently overridden for venues by `.venue`'s
  own `border` shorthand appearing later in the file. Moving that shorthand into the
  group ahead of `.locked` let it through, so locked venues turned dashed and grey.
  `.venue.locked` now states its own solid border.
- `#tkmfill` grows by `width`, not `transform`, so it must stay out of the group's
  `transform-origin:left`.

Only two rules were genuinely dead and deleted: `.card2.chosen` and `.paused *`.

**The stage sweep** (`scratchpad/.../sweep.js`) is the tool that proves a refactor: it
dumps colour, background, both borders, box-shadow, fill, stroke, bounding box,
display, position, flex-direction, overflow, transform-origin, font-weight, font-size,
letter-spacing, padding and white-space for every element, with all nine panels and
four dock states forced open and names, looks, market heat and songs pinned. Stage 2
differs on **0 of 928 nodes**.

**Phase Two, stage 3 — five tabs became four, and one of them is the way out.**
`Band | Gear | Catalog | Shop | League` had two tabs leading to stubs and no way back to
the stage except the ✕. Now `HOME | BAND | MUSIC | SHOP`:
- **HOME** is not a screen. `openTab('home')` calls `closeSheet()`, and `closeSheet()`
  selects the HOME tab — so the tab bar always shows where you are, the stage included,
  and there is one shell rather than a router.
- **MUSIC** merges Catalog and the genre pane: the home-genre card, then a `.seg` of
  SONGS and TRENDS (`musicTab` remembers which). The catalogue and the market that
  moves it are one screen because they are one decision.
- **BAND** keeps genres as *identity* — `.gchip` badges of what you play, home tagged —
  and points at Music for the heat and the MAKE HOME buttons.
- **Gear and League are off the bar.** Both were stubs; an empty tab promises more than
  no tab does. They come back with the features.

One real bug, three attempts: with a sheet open the tab bar was unreachable. Raising
`#tabs`' `z-index` did nothing (an unpositioned element ignores `z-index`), adding
`position:relative` still failed because `#app` is `position:fixed` and therefore its
own stacking context, and the fix in the end was geometric rather than layered — both
`#sheet` and `#scrim` now end at `calc(var(--safe-b) + 56px)`, the top of the tab bar.

**And then the sheet stopped being a sheet.** The bottom-drawer treatment — a grab
handle at the top of each panel, a dimming scrim behind it, a slide up from the bottom
— told the player that BAND was a temporary thing pulled over the game. It is not; it
is one of four places the game lives. So `#sheet` became a screen: full height above
the tab bar, cross-faded in place, with `.grab` and `#scrim` deleted outright and the
`.full` modifier gone — every screen is now what `.full` used to mean. The one leftover
of the modal era, the ✕, is kept only for Settings, which has no tab to leave by.

Two pre-flip leftovers went with it, both found by `audit`: the **PWA manifest and the
app icons** were still `#100b1e` / `#ff2e83` / `#00e6c3` from before the palette
flipped, so an installed Chart Breaker had a magenta icon on a purple splash. The
manifest is built in JS, so it now reads `PAL` like everything else; the `<link
rel=icon>` is static markup and carries the Concert Neon hex directly, the same
attribute exception the `theme-color` meta already had. `CONFETTI` said in its own
comment that it moved with the palette and did not — it does now.

Suites: `gu` was rewritten for the split (Band asserts chips and no MAKE HOME; Music →
TRENDS asserts the pane, the home move, rank unlocks and reload), `f1` asserts the Band
screen stops exactly at the tab bar with the bar still on screen, `nav` asserts the
screen geometry, the absent grab/scrim/✕ and the Settings exception, and five suites
now leave a screen by pressing HOME rather than the ✕. Twelve suites pass, no console
errors.

**Phase Two, stage 4 — a Home worth returning to.** Home used to be whatever was left
over: the stage as a permanent backdrop, and a dock that said the band's name, how many
songs were out, and drew four progress bars for four people who share one output. None
of it told the player what to do next.

Now it does. §13 has the layout; what is worth knowing about the build:
- **`GOALS` is an ordered table of predicates**, each returning `{t, h, p}` or nothing,
  and `nextGoal()` takes the first that answers. Adding a goal is one entry, and the
  order *is* the design — nearest actionable first, the rank as the floor.
- **`ctaState()` and `ctaAct()` are separate** so the label and the press can never
  disagree; `renderIdle()` sets the label, the colour class and `data-cta`, and the
  click routes on the same state.
- **`RAIL` ships empty.** The component and the render exist; every system that would
  fill it is a later stage. `#rail:empty{display:none}` means a rail with nothing in it
  is not a hole in the layout.
- **The chip row is gone.** `#bandChip` and `#studioChip` keep their ids (ten suites
  and the audit harness bind to them) but now live on the stage as its name and its
  room. Picks moved into Shop, where it is the currency of the thing being sold.
- **`BAL.studioStep`** — the studio x4 was written out three times in three places
  (`studioMult`, the Band tab, and the new goal line). It is a balance number, so it is
  in `BAL` now, per CONVENTIONS.

Suites: the new `home` suite drives all six goal states, all four CTA states (including
COLLECT actually banking a held payout and the label falling back afterwards), the demo
line, the empty rail, the absent chip row, and WRITE A SONG still opening the genre
pick. Thirteen suites pass, no console errors, frame time unchanged.

**Phase Two, stage 5 — rhythm play that reads at speed.** The HUD was three separate
feedback positions, a header still counting money mid-song, a take panel and a gig panel
that looked identical, and notes that could bleed out of the lane you were aiming at.

- **One slot** (`#feed`) replaces `#takejudge`, `#takecombo` and `#hypeTag`. The rule
  that makes it work is priority, not queueing: judgements replace each other instantly
  (a stale PERFECT is worse than none), while a *moment* holds the slot for 0.9s so a hit
  landing 80ms later cannot erase IN THE POCKET. The persistent streak line is gone — the
  multiplier chip already carries that state, so the feed only reports it when the streak
  *crosses* a step.
- **The header knows what you are doing.** `hudMode()` runs inside `renderTop()` and at
  every take/gig transition: `#top.play` for a decision or a take, `#top.gig` for a show,
  `#stage.playing` for both. That is one function deciding, rather than four call sites
  each remembering to undo their own class.
- **Studio and stage are told apart** on four channels at once: the ground (`--cream2` vs
  `--cream3`), the top rule (neutral vs coral), the REC dot, and whether AUTO-TAKE exists.
- **Notes clip to their lane**, at the lane's own radius.
- **`HYPE_TIERS`** gives the crowd a name at every level and keeps the existing 40/70/90
  milestones as the tier boundaries, so the shout and the label can never disagree.

`hype()` also gained a `!gigRun` guard. It is not reachable in play — `endGigSection()`
nulls `take` before `finishGig()` nulls `gigRun` — but the HUD suite reached it by ending
a show under a live take, and a crash in the rhythm loop is not worth the one word saved.

Suites: the new `hud` suite drives the take chrome (REC dot, `take 1 of 4`, card and
member, TAKE METER, AUTO-TAKE present), the gig chrome (header replaced, counters hidden,
venue and section, no REC, no AUTO-TAKE, full title, `CROWD HYPE · WARMING UP 19`), the
stage labels stepping aside, lane clipping, the single slot with a moment holding it
against a judgement and letting go after, every tier boundary, and a milestone shouting
exactly once. Fifteen suites pass, no console errors, frame time median 16.7ms / p95
17.1ms.

**Phase Two, stage 6 — the members became people you can open.** A member used to be a
row in a list with a LEVEL UP button bolted to its right edge. Now they have a screen
(§13b), reached by tapping them on the stage.

- **`openScreen()` was split out of `openTab()`**, so a screen and a tab are no longer
  the same thing. A tab clears `sheetBack`; the character sheet sets it. `sheetOut()`
  is what the header button calls, and it goes back or closes depending on that one
  field. Adding the next non-tab screen is now three lines.
- **The upgrade explains itself before it takes the money.** Three `before → after`
  rows, computed by temporarily stepping `lvl` and calling the real `memberSPS` rather
  than duplicating the formula — if the curve is retuned, the sheet follows it for free.
- **The stat rails ship empty on purpose.** The plan's wireframe drew them part-filled;
  that would be inventing numbers the game does not have. Empty, hatched and labelled
  `SOON` is the honest version of the same reservation.
- The Band tab's member rows tap through to the same screen (`data-act="member"` on the
  card, with the LEVEL UP and ✎ buttons still winning the `closest()` inside it).

Suites: the new `cs` suite drives opening from the stage and from Band, the header
button being `←` or `✕` and going to the right place, the four rails and two gear slots,
`before → after` matching what `memberSPS` actually returns, a level-up that raises the
level and the catalogue and pays **exactly** the listed price (measured inside one turn,
because money accrues between two reads), the disabled state when short, an empty slot
routing to Band, and a mid-session member tap still counting as a jam. Sixteen suites
pass, no console errors, frame time median 16.7ms / p95 17.0ms.

**Phase Two, stage 7 — every reward legible: what, how much, where it went.** §13c has
the result. What is worth knowing about the build:

- **The four moments were four stylesheets.** Reveal, gig result, rank up and offline each
  carried their own copy of the same centred layout, the same radial ground, the same
  eyebrow, headline and big number, and their own hand-rolled gold button — at four
  slightly different values each (headline 27/29/31/34px, padding three ways). They now
  share `.meyebrow` / `.mhead` / `.mnum` / `.mgo` and one panel rule; each keeps only its
  `z-index` and its `gap`. The suite asserts the four resolve to the same ground, padding
  and alignment, and that all four collect buttons resolve to the same fill.
- **`reward()` is a contract, not a helper.** Three layers, one call, so the next reward
  cannot quietly ship with only sound. `statPop()` also hides the tile's label while the
  amount floats in its place — otherwise `+1.90K` lands directly on top of `MONEY` and
  neither can be read.
- **The bug the audit turned up:** two of the four collects were assigning the display
  counters straight to the new totals, which cancels the ease-up the tick does. The two
  biggest payouts in the game — a gig and a return from offline — banked silently. That is
  the whole point of the audit: it is not visible in code review, only in play.
- `bankPayout()` lost its own `buzz()`. It is called from `boot()` as well, where a haptic
  with no press behind it is wrong; the press is answered by `reward()` now.

Nothing in `newState()` changed and no balance number moved, so a v3 save written before
this stage loads unchanged.

Suites: the new `rw` suite spies on `AU.chord` and `navigator.vibrate` and drives all five
rewards, asserting for each one which tiles popped, what the floating amounts read, that
the band nodded, that a sound and a haptic fired, and that the counters are **behind** the
totals afterwards (i.e. still easing, not snapped). It also asserts the four panels
resolve identically and that every collect button is the same gold. Seventeen suites pass,
no console errors, frame time median 16.7ms / p95 17.1ms.

**Phase Two, stage 8 — reserved surfaces, and Phase Two is done.** The last stage is the
one that makes the next phases cheap: every surface Phase Three needs is drawn, labelled
and honest about not existing yet.

- **Shop stopped pretending to be a shop.** It had nine `.card locked` rows with `₪12`,
  `50 Picks`, `₪19/mo` on disabled buttons — which reads as a store you cannot afford
  rather than a store that is not built. `RESERVED` replaces them with five labelled
  rails carrying the same information as text and no pressable surface at all. The suite
  asserts the screen contains **zero buttons** and no currency glyph.
- **`RAIL` went from `[]` to three declared entries** whose predicates read the state
  their systems will own. Nothing renders — the suite asserts that, and asserts that
  setting one field (`S.inbox = [1,2,3]`) lights exactly one icon with a badge of 3, that
  tapping it answers, and that removing the field empties the rail again.
- Both tables sit with `GOALS` and `HYPE_TIERS` under the CONVENTIONS rule: an ordered
  table you extend with an entry, never with a branch.

**A flaky suite, and why it was the suite's fault.** `t2` intermittently timed out
clicking the HOME tab. The cause is real and by design: fans arrive every tick from gig
money, so a **rank-up card can land on any frame**, and it is modal. The suite now clears
an open rank-up immediately before every tab press. Fourteen consecutive runs pass. The
game behaviour is correct — a rank-up is meant to interrupt.

**Phase Two is complete.** Eight stages: tokenise, flip, consolidate, navigate, Home, HUD,
character sheet, moments, reserved surfaces. Eighteen suites pass, no console errors,
frame time median 16.7ms / p95 17.2ms, and a `chartbreaker.v3` save written before Phase
Two still loads — no `newState()` field was added or removed across the whole phase, and
no balance number moved.

**Removed along the way:** the tap-to-fill-tracks loop, Hook Moments, the Hype stat
(Quality shifts chart odds instead), and weekly-seeded genre trends (replaced by the
live heat cycle). Time-gated member unlocks are gone too —
members are hired with money now. v1 and v2 saves are migrated (streams→money at the
base payout rate, levels, ownership, songs, time away) rather than discarded.

## CONVENTIONS

- **Palette tokens live in `:root`, and JS reads them from there.** `PAL` is built once
  at start-up from `getComputedStyle(document.documentElement)`, so `:root` is the single
  source of truth for the whole game — there is no second list to keep in sync. Never
  write a colour literal below the `PALETTE` banner; repoint a token instead.
  As of Phase Two stage 0 the stylesheet holds **zero** raw hex outside `:root` (the
  `theme-color` meta is the one attribute exception), and every scattered literal in the
  script — 73 quoted, 32 inside template strings — became a `PAL.*` reference.
- The remaining literals are all **content, not palette**: `SKIN` and `HAIRC` (skin and
  hair are not theme colours), the instrument and kit materials inside `charSVG`, and the
  one-off scene colours in `STUDIOS.bg`, `VENUES.bg` and `GENRES.c`. Those tables carry
  their own worlds and move as a unit. `GENRES.c` needs more hues than the palette has —
  sixteen genres have to be told apart at a glance — so it extends the same family rather
  than inventing a second style.
- **Scales, not magic numbers.** `--s1…s6` (4/8/12/16/24/32) for every gap and pad,
  `--r1…r4` (8/12/18/26) for radius, `--t1…t6` (10/12/14/17/23/34) for type,
  `--m1…m3` (120/200/340ms) for motion.
- A member's own colour is their shirt; **rarity is a treatment on top** (jacket
  panels → studs → trim + glow → aura), not a recolour. That keeps the four members
  distinguishable at every rarity.
- Everything lives in `index.html`. Keep the section-comment banners
  (`/* ===== AUDIO ===== */` etc.) and add new systems as new banners.
- Tunables live in the tables near the top of the script — `BAL`, `MEMBERS`,
  `RARITY`, `STUDIOS`, `TIERS`, `ODDS`, `GENRES`, `GCARDS`, `RANKS`, `CARDS`, `PATTERNS`. Never inline a balance
  number in logic. `GOALS`, `RAIL` and `HYPE_TIERS` are the same idea for content rather
  than balance: an ordered table you extend by adding an entry, never by adding a branch. Studio costs are on the *money* scale, which accrues roughly 10x
  slower than streams — rescale them if `payoutBase` ever changes.
- Card vectors are the game's difficulty knob. `DSCALE` (2.2) is the distance at
  which a card scores zero; it is tuned to how far apart the real card vectors sit,
  not to the theoretical maximum. Raising it flattens Quality; lowering it punishes.
- `save()` writes a versioned object; `load()` must tolerate older versions by
  filling defaults rather than throwing.
- No blocking work in the render loop. Audio buffers are built off the first tap.
- Test by opening the file directly on a phone — there is no dev server.
