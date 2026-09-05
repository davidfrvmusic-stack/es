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
badly played still disappoints. Both are then scaled by **craft** (§6b): how well you
played, times what this band is capable of. Idle jam-tapping survives only as a garnish
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
2. **Gear** — guitars, pedals, amps, mics. Visible on the characters. **Built** (§8b);
   what remains is crates as the source, which is step 3.
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
shoulder studs → trim + glow → aura). **Equipped gear is drawn on the character** — the
instrument in their hands, the rig part as a prop at their feet (§8b).
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
  song can still score well — and then **scaled by the band's craft ceiling** (§6b). A
  garage band playing a perfect session still makes a garage-band record: `q = round(raw
  × craftCap / 100)`. Playing well always gets you the best song *this* band can make,
  and buying upgrades is what raises that.
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
  `fansFor(q, tier)` = `BAL.fanTier[tier] × (1 + Quality/100)`, `fanTier` = 1 / 3 / 20
  / 120 / 600 for flop → #1. Solo demos earn it too, immediately, awake or offline.
- Earned from **playing live**: `fanRate() = BAL.fanGig × gigMoney()`, so bigger rooms
  bring more people as well as more money. (The brief's "every gig win" is this until
  the Daily Gig event lands in BUILD ORDER step 4 — there is no gig *event* yet.)

**RANKS** are pure fan thresholds: Garage Band 0 → Local Act 10K → Regional 100K →
National 1M → Global 10M → Legend 100M. A rank is *rare* — a week of steady play reaches
Regional, the third of six (§9). Each one buys four things, all live:

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

**FATIGUE — the one thing STAMINA answers.** A long night costs the room's energy:
`gigFatigue()` is `fatSection` (0.18) per song after the first, `fatHard` (0.10) per
difficulty star above `fatHardFrom` (4), and `fatEncore` (0.25) for the encore, all of it
reduced by the band's STAMINA (`statStamFat` 0.006 a point, capped at 85%). It lands in
one place — `gigRun.hypeMul`, the multiplier on every **positive** hype move — so full
fatigue costs `fatHypeCut` (35%) of the section's hype gain. A miss always costs what a
miss costs; fatigue never makes the punishment worse.

**A one-song show at Open Mic has fatigue exactly 0**, which is the point: STAMINA
matters in long sets and hard rooms, and *songwriting is never fatigued at all*. The
suite asserts a four-take song's Quality is byte-identical at STAMINA 0 and 100. The
venue brief warns you before you commit — "by the last song the room gains N% less hype".

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

- **Nothing you buy changes a song you have already released.** No member level, no
  studio, no gear ever touches a track that has charted. A song's `base` is fixed the day
  it releases, from its **chart tier** and a small Quality nudge; only the *market* moves
  it afterwards — the genre's heat, its own decay, and whether it sits in your home genre.
  This is the single most important rule in the economy and the reason the curve is not
  exponential: there is no retroactive multiplier anywhere.
- **What upgrades buy instead is craft** — see §6b.
- **payoutRate** starts at 0.04 and rises `+0.008` per Royalty Rate upgrade
  (cost `250 × 2.1^n`), **capped by the rank's `payCap`** (§4c). It multiplies
  *everything*, so it stays worth buying up to the ceiling your fans have earned.
- **No passive money from tapping.** Every released song earns its own streams/sec:

    base  = 1.0 × tierMultiplier × qNudge(Quality)          (fixed at release, forever)
    live  = base × genreTrend(now) × decay(now) × homeMult

- **The tier pays; Quality only nudges.** `qNudge` = `1 + 0.5 × (Q/100 − 0.5)`, so Q0 is
  x0.75 and Q100 is x1.25 — a 1.67x swing across the entire Quality range, against a 3x
  step from Solid to Hit. **A Q100 Solid can never out-earn a Q0 Hit.** What Quality
  really buys is the *odds* of landing that Hit: `ODDS` takes Hit-or-better from 17% at
  Q30 to 40% at Q90. Craft buys chances at hits, not a multiplier on streams.
- **The catalogue keeps its best 200, not its newest.** At `BAL.catalogCap` the weakest
  earner loses its slot — so a Hit you wrote pushes out a Q20 demo, and releasing more,
  *better* songs is how the catalogue improves rather than just getting longer. (This is
  also what makes playing more actually pay: in the 168h simulation the steady player ends
  at 4.17K streams/sec against the casual player's 1.37K, from the same 200 slots.)
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

## 6b. CRAFT — the one thing every upgrade buys

Member levels, star rank, the studio, and later gear and skills all feed **one number**:
how good a song this band is capable of making.

    craft     = Σ owned members (craftMember + craftLvl × level^craftExp
                                 + starCraft[star] + statWriteCraft × WRITING
                                 + gear + skills)
              + craftStudio × studio
    craftCap  = craftFloor + (100 − craftFloor) × (1 − exp(−craft / craftK))

`craftCap` is the **highest Quality this band can reach**, and `finishWriting()` scales
the played score into it. It is **asymptotic on purpose**: craft alone approaches 100 and
never arrives, so the top of the scale is not something you can buy. Measured with the
shipped tunables (`craftFloor` 33, `craftMember` 1.73, `craftLvl` 1.27, `craftExp` 0.35,
`craftStudio` 1.8, `craftK` 46):

| band | craft | ceiling |
|---|---|---|
| you alone, level 1, Garage | 3.0 | **Q37** |
| full band, level 1, Garage | 12.0 | Q48 |
| full band, level 20, Garage | 21.4 | Q58 |
| full band, level 20, Pro Studio | 26.8 | Q63 |
| level 120, ★4, Tour Bus | 73.1 | Q86 |
| maxed | 137 | **Q96.6** — and no further |

**The flawless-session overshoot is the only way past it.** Three conditions, checked
across *every* take in the song, each worth `BAL.flawBonus` (2) on top of the ceiling:
every take graded ≥ `flawAcc` (0.90) accurate, every take finished on the top multiplier,
and IN THE POCKET on every track. A maxed band (Q96.6) plus two of the three is Q100; a
week-one band (Q73) playing all three is Q79. An AUTO-TAKE or a botched take fails all
three, so a skipped take can never be part of a Q100 record. **Q100 is a maxed band that
also very nearly did not miss** — rare, and not impossible.

Two consequences worth stating plainly:
- **A level pays you nothing directly.** It raises what you can write. The character
  sheet says so — the before → after rows are craft and *best song*, not streams.
- **Solo demos are graded by the same ceiling** (`soloQ()`), so an unattended band cannot
  exceed itself either — and they never get the overshoot, because nobody played them.

The `level^0.35` is deliberate: craft has diminishing returns per level against a cost
curve that grows at 1.25, so no amount of levelling runs away with the ceiling.

## 6c. STATS — four jobs, and not one of them is streams

Every member carries `WRITING / SKILL / STAGE / STAMINA` (`STATS`, and `statOf(i, k)` is
the one place they are read). Points come from Star Rank, gear and skills — all later
build steps — so today every stat is 0 and every formula below is a no-op that the
content stages switch on. **None of them multiplies streams or touches a released song.**

| stat | what it drives | knob |
|---|---|---|
| **WRITING** | craft, and a **floor** under this member's hint accuracy — a high-WRITING level-1 member is already a reliable narrator | `statWriteCraft` 0.10, `statWriteHint` 0.004 |
| **SKILL** | what a played take is worth in Quality, and a little timing window | `statSkillTake` 0.006, `statSkillWin` 0.0012 **capped at +12%** |
| **STAGE** | hype gain, and a floor under a room's genre fit | `statStageHype` 0.005, `statStageFit` 0.003 capped 0.35 |
| **STAMINA** | show fatigue, and nothing else | `statStamFat` 0.006 capped 0.85 |

The two studio stats are **per member** — the one whose track it is. The two stage stats
are the **band's average** (`bandStat`), because a show is played by a band.

The timing window is capped hard and deliberately: it is an accessibility allowance, not
a difficulty setting. The grade is still accuracy.

**Rarity's `m` multiplier is deleted.** It ran 1 → 8 and multiplied craft and member
power — exactly the unlimited multiplier this economy cannot have. Star Rank replaces it
with additive `BAL.starCraft` (0 / 2.0 / 3.5 / 4.5 / 5.0). Rarity is a name and a colour
now, and the character's outfit treatment.

**Stat points are spent by the player and always refundable.** The character sheet shows
four real rails, a `+` per stat while points are unspent, and a free `RESPEC` that gives
every point back. A stat you cannot undo is a trap.

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

**Every upgrade in this list raises craft (§6b). None of them raises what a released song
earns.** The only thing that multiplies income is the royalty rate, and fans cap that.

- **Member levels** — cost `lvlCost × 1.25^n`. Raises that member's craft, unlocks better
  cards, sharpens hints, speeds up solo demos.
- **Royalty rate** — the one true multiplier, and the one fans gate. See §6.
- **Star Rank** — ★1…★5, from duplicate member cards in crates; adds `BAL.starCraft` and
  grants stat points. It replaced rarity's old 1→8 craft *multiplier* (§6c).
- **Gear** — 2 slots per member, visible on the character, and 28 archetypes that are
  builds rather than skins. See §8b.
- **Studios** — Garage → Bedroom → Rehearsal → Pro Studio → Label HQ → Tour Bus →
  Stadium → Space. Each adds `BAL.craftStudio` (1.8) craft, and each one is a **room you
  can see** — see §8c.

## 8b. GEAR — 28 archetypes, and the anchor contract

**Every variant is a build, not a silhouette.** `GEAR` carries 28 archetypes — five
instruments per role and eight universal rig parts — each with a stat split `sp`
(`[WRITING, SKILL, STAGE, STAMINA]`, always totalling 100) and, for all but the five
starters, one passive from `PASSIVE`.

**Rarity belongs to the instance, not the archetype.** A crate rolls a rarity and then an
archetype, so 28 × 5 = **140 possible items**. An instance is `{id, a, r, lvl}`; its
points are `BAL.gearPts[r] × (1 + 0.12 × lvl)` — 4 / 7 / 11 / 16 / 22 at Level 0, and five
upgrades are +60%. Upgrades cost Parts **4 / 9 / 18 / 34 / 60** and money
`250 × 2.2^L × (1 + rarity)`.

**Upgrades start at Level 0**, as dropped, and run to Level 5.

**A duplicate instrument has nowhere to go**, because there is exactly one member per
role — so it is *material*: scrapping pays `BAL.gearSalvage[r]` Parts, **+50% when you
already own that archetype**. There is no gear merge; merging belongs to Member Cards, and
two overlapping merge systems would muddy both. Scrapping is refused on anything equipped
and asks first, naming the item and the payout.

**Rig parts are universal** — the only gear that can be out on more than one member, up to
four at once, one each. One *instance* still lives in one slot: equipping it elsewhere
moves it.

### The anchor contract

The limb pivots are hardcoded viewBox units in CSS, so where a hand lands is a coincidence
of hand-tuned numbers — the fret hand ends at (35,62), which is (43,0.6) inside the guitar
group, on the neck between two fret dots. **A variant may not move that.** So:

- **The neck is the anchor.** Every guitar and bass draws the same neck rect (x 16..54,
  y −5..5) and the same two inlays. Bodies, pickups, headstocks and string counts change.
- **The drums keep their three centres** — snare (33,78), rack tom (67,76), bass-drum head
  (50,102) — because that is where the sticks land.
- **The mic keeps its grille at (57,45)** and its barrel reaching the hand at (64,55).
- **`.ch-bob` uses `transform-box: fill-box`, so its bounding box IS the bob pivot.** An
  invisible `<rect>` at the base instrument's exact local extent pins the minimum, and
  every variant is clamped inside it — so the pivot is a constant. The suite asserts all
  five archetypes of each role resolve to **one identical `.ch-bob` bbox**.
- **Rig parts are outside `.ch-bob` entirely**, at the feet, behind everything. That is
  precisely why they are a separate slot: anything added inside that group would move the
  bob pivot for the whole character.

### Every passive is one key, read at one site

`PASSIVE` gives each of the 23 a name, a line of copy, an effect key and a value;
`fx(i, key)` sums that key over one member's two items and `fxBand(key)` over the band.
A passive is applied where the mechanic already lives — `approachFor`, `winScale`,
`gigFatigue`, `fitFloor`, `memberCraft`, `cardPoints`, `endTake`, `missNote`,
`gigRun.hypeMul` — never as a special case somewhere else.

| role | archetypes |
|---|---|
| drums | Practice Kit · Vintage Maple *(Warm Room)* · Punk Bop *(Fast Hands)* · Double Kick *(Engine)* · Crystal Shells *(Showpiece)* |
| bass | Starter P · Short Scale *(Easy Reach)* · Thunderbird *(Low End)* · 5-String *(Range)* · Fretless Fusion *(Intonation)* |
| guitar | Pawnshop SG · Offset Jazz *(Clean Tone)* · Flying V *(Rock Stance)* · Semi-Hollow *(Resonance)* · Baritone *(Drop Tune)* |
| vocals | Dynamic 58 · Ribbon *(Studio Voice)* · Condenser + Shield *(Isolation)* · Handheld Wireless *(Work The Room)* · Headset *(Hands Free)* |
| rig | Practice Amp · 4x12 Stack *(Volume)* · Pedalboard *(Palette)* · Tape Echo *(Ambience)* · Compressor Rack *(Levelling)* · Wedge Monitor *(Foldback)* · DI Box *(Clean Signal)* · Tube Preamp *(Harmonics)* |

**Everyone starts holding their instrument.** Each owned member is granted their role's
starter (Common, Level 0) on hire, at setup, and on load for an older save — it is not a
reward, it is what holding an instrument means, and it is why the stage never draws an
empty pair of hands. **Nothing else drops until crates ship**, so a Stage-2 player owns
exactly four items and zero Parts. That is the sequencing, not an oversight.

## 8c. THE ROOM — what a studio upgrade looks like

A studio used to be a number and a gradient. Now each of the eight repaints the wall
behind the band: `ROOM` is an ordered table, one builder per studio, drawn into `#room`
— a layer between the backdrop (`#bg`, z 0) and the band (z 2), under the dock (z 3),
`pointer-events: none` so a tap on the stage is still a jam.

| studio | what appears |
|---|---|
| Garage | segmented door, one bulb on a wire, unpacked boxes |
| Bedroom Studio | poster, desk, two little monitors, a rug |
| Rehearsal Space | foam wedges, a PA stack, mic stands waiting |
| Pro Studio | glass to the control room, a desk of faders, boom arms |
| Label HQ | five framed gold records, plants, light thrown up the wall |
| Tour Bus | bunks, curtained windows, road cases |
| Stadium | rigging truss with X bracing, four lights and their beams, a riser |
| Space | starfield, racks with nothing holding them up, a cable adrift |

**Two rules keep it a backdrop rather than a competitor.**
- **Everything lives above y=50.** The box is `0 0 100 100` stretched with
  `preserveAspectRatio="none"` (about 10% distortion at a phone's aspect, so rectangles
  and lines only — nothing that has to stay round). The dock owns everything below the
  floor line, and the band's feet land at about y=40. The suite asserts no solid shape
  hangs past it.
- **It is never brighter than the band.** Colours come from the studio's own `r` triple
  (wall / prop / highlight) in the same dark family as its `bg`, and the whole layer sits
  at 82% opacity. The first cut of Label HQ had gold records the size of the band's heads;
  they are five small framed ones now.

**A show is not your studio.** `startGig()` puts `.away` on the stage and the room fades
out with the venue backdrop taking over; `finishGig()` brings it back.

## 9. PACING — why the curve is shaped the way it is

**The first cut of this economy finished itself in under an hour.** A member's level
multiplied the *entire catalogue*, and the catalogue grew with every release, so income
compounded on two axes at once against a cost curve growing at only 1.15. That was patched
(`level^0.55`, `costGrow` 1.25, studios x4) and the patched version still reached Tour Bus
and rank Global in a week.

**The rework removed the shape rather than re-pricing it.** Three rules, and they must be
kept together:

1. **No retroactive multiplier exists.** `songSPS` no longer touches `bandMult` or
   `studioMult`. A released song is finished. Income grows because you release *more* and
   *better* songs, not because a purchase re-values the back catalogue.
2. **Upgrades buy craft, and craft has a hard ceiling of 100** (§6b). The thing you spend
   money on saturates by design.
3. **The tier pays and Quality nudges** (§6). Quality's whole range is worth 1.67x; a tier
   step is worth 3x. Better songs earn more by *charting* higher, which is a probability,
   not a multiplier.

Supporting numbers: `fanTier` /10 and every rank threshold x10 (a rank is meant to be
rare); studio costs rescaled `6e3 … 1e11`; `catalogCap` 200 now trims the **weakest**
song rather than the oldest demo.

**Measured** (greedy buyer, headless, real game code, 168 simulated hours; the player's
Quality is their play skill scaled by `craftCap`, raw 88 steady / 72 casual):

Re-measured after the asymptotic craft curve landed (§6b):

| milestone | steady (a song every 2 min) | casual (every 10 min) |
|---|---|---|
| 2nd member | 2m | 2m |
| Bedroom Studio | 3.6h | 6.2h |
| craft ceiling Q60 | 3.6h | 6.2h |
| full band | 1.8h | 3.0h |
| Local Act | 9.9h | 22.5h |
| Rehearsal Space | 12.1h | 23.9h |
| Pro Studio | 2.0d | 3.9d |
| Regional | 2.7d | 6.1d |
| craft ceiling Q75 / Q90 | not in a week | not in a week |
| National / Label HQ / Q100 | not in a week | not in a week |

A week of steady play ends at **Pro Studio, rank Regional, craft ceiling Q68, 532 money/s**
— from 1.0 money/s and a **Q37** ceiling at minute zero. A casual week ends at the same two
landmarks about twice as slowly, at **211 money/s** and the same Q67 ceiling. The ceiling
figures are *without gear or star rank*, which are the two craft sources still to be built;
they carry roughly the last 8 craft, which is the difference between Q68 and the plan's
Q73 target for a first week.

**The ceiling got much slower on purpose.** Under the old linear `craftFloor + craft` a
steady week reached Q93; it now reaches Q68, and Q90 is weeks away rather than days. That
is the brief — *progression should be slow, and quality is the thing you are buying*.

**Playing more has to pay, and it does.** Both runs end holding 200 songs, but the steady
player's 200 are better: **3.29K streams/sec against 1.43K**, and a 28% hit rate against
23%. That gap is entirely the catalogue-trim rule plus the Quality→odds curve — there is no
multiplier doing it.

**If you retune, re-run the simulation** (`scratchpad/.../sim8.js`: a greedy buyer driven
through the real `moneyRate` / `upCost` / `craftCap` / `addSong` / `songSPS` functions for
168 simulated hours, with the band's own demos included). Reading the tables is not enough
— the original runaway was invisible until it was simulated. One trap: the game's top-level
`const` helpers (`craftCap`, `songSPS`, `statOf`, …) are **not** `window` properties, so
`window.craftCap = …` in an injected override silently does nothing and the run measures
unchanged formulas.

**Old saves.** `newState()` is unchanged and a `chartbreaker.v3` save still loads, but a
save written before the rework will show a **sharp income drop** on first load: its songs'
stored `base` values were computed under `qFactor` and were being multiplied live by
`bandMult × studioMult`, and neither multiplier exists any more. That is the intended
consequence of the rebalance, not a migration bug — the same band now earns what the new
model says it earns.

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

Middle: the stage — 4 SVG characters, the active one stepped forward, in front of the
**room their studio buys** (§8c) — with the SAVED pill floating top-right and `#rail`
under it. **The rail draws one icon per system that
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
- **Stats** — WRITING / SKILL / STAGE / STAMINA, four real rails now (§6c), each with its
  value, a one-line note on what it drives, a `+` while the member has unspent points, and
  a free `RESPEC` once anything is spent. They read 0 for everyone until Star Rank, gear
  and skills start granting points — which is the honest number, not an invented one.
- **Gear** — two slots, `INSTRUMENT` and `RIG`. A filled slot is a solid card in the
  item's rarity colour carrying its name, rarity, upgrade level and points; an empty one
  stays dashed. Tapping either opens the **gear screen** — a detour off a detour, so
  `sheetBack` remembers the member screen and the member screen still remembers its tab.
  The screen lists only what fits that slot (instruments are role-locked, rigs fit anyone)
  with EQUIP, the next upgrade priced in Parts and money, and SCRAP behind a confirm.
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
the screen's shape does not move — **the Gear rail is gone for exactly that reason**: gear
exists now, so reserving it would be the same lie the other way round. Crates carries the
reference instead, and the balance row shows Picks **and Parts**, because Parts are real
state that a real screen spends.

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
- Economy verified: a fresh band sits at **0 streams/sec, 1.0 money/sec and a Q37
  ceiling**; hiring raises gig money (1.0→1.5) with no songs out; the first release starts
  streams; hire ladder 30/300/2200; first level 14; royalty 4% at 250. Pacing per §9.
- **The craft rework is verified by its own suite (`ec`)**: the ceiling ladder
  (37 solo → 48 full band → 58 at Lv20 → 63 with Pro Studio → 96.6 maxed, never 100 from
  craft alone since the stage-1 curve), a perfect session
  scoring exactly the ceiling, `baseFor` showing a 1.67x Quality swing against a 3x tier
  step, a Q100 Solid never out-earning a Q0 Hit, Hit-or-better odds moving 17%→40% from Q30
  to Q90, a released song's `songSPS` **unchanged** by taking the band from level 1/Garage
  to level 60/Tour Bus while the same song still moves when its genre goes hot, and the
  catalogue at cap keeping an incoming Hit while rejecting an incoming flop.

**Known gaps (deliberate, deferred):** crates as real drops — so gear exists (§8b) but
**the only items in the game are the four starter instruments**, and there are no Parts to
upgrade with; the rank's `crate` bonus is stored but unread; star rank and member cards, so
**nothing grants a stat point yet**,
the *Daily* Gig and rival/multiplayer gigs (the regular ladder in §4d is built),
six-cards-per-track-per-genre (128 signature cards ship, 384 do not),
streaks, prestige, league, weekend events, real shop, LLM content,
`sw.js` offline (and with it, true background storage-full notifications), a real
cloud-save backend, any way to actually grant VIP.

**Concert Neon, stage 1 — the palette is flipped.** The game is dark. What that pass
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

**Concert Neon, stage 2 — one button, one panel, one surface, one meter, one pill.**
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

**Concert Neon, stage 3 — five tabs became four, and one of them is the way out.**
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

**Concert Neon, stage 4 — a Home worth returning to.** Home used to be whatever was left
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

**Concert Neon, stage 5 — rhythm play that reads at speed.** The HUD was three separate
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

**Concert Neon, stage 6 — the members became people you can open.** A member used to be a
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
  `SOON` is the honest version of the same reservation. (Phase Two stage 1 gives them
  real values — see §6c.)
- The Band tab's member rows tap through to the same screen (`data-act="member"` on the
  card, with the LEVEL UP and ✎ buttons still winning the `closest()` inside it).

Suites: the new `cs` suite drives opening from the stage and from Band, the header
button being `←` or `✕` and going to the right place, the four rails and two gear slots,
`before → after` matching what `memberSPS` actually returns, a level-up that raises the
level and the catalogue and pays **exactly** the listed price (measured inside one turn,
because money accrues between two reads), the disabled state when short, an empty slot
routing to Band, and a mid-session member tap still counting as a jam. Sixteen suites
pass, no console errors, frame time median 16.7ms / p95 17.0ms.

**Concert Neon, stage 7 — every reward legible: what, how much, where it went.** §13c has
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

**Concert Neon, stage 8 — reserved surfaces, and the pass is done.** The last stage is the
one that makes the next phases cheap: every surface Phase Two needs is drawn, labelled
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

**The Concert Neon pass is complete.** Eight stages: tokenise, flip, consolidate, navigate, Home, HUD,
character sheet, moments, reserved surfaces. Eighteen suites pass, no console errors,
frame time median 16.7ms / p95 17.2ms, and a `chartbreaker.v3` save written before the
pass still loads — no `newState()` field was added or removed across the whole phase, and
no balance number moved.

**The craft rework (after the pass).** The direction changed once Concert Neon shipped:
*every upgrade — gear, studio, member, skills — enhances the Quality of the song, and
Quality makes better songs rather than better streams.* That inverted the economy, and
§6 / §6b / §8 / §9 are the rewrite. In short: `bandMult` and `studioMult` left `songSPS`
entirely, `qFactor` became `qNudge` (±25% instead of 0.25x–2x), everything you buy feeds
`craftCap`, and the catalogue trims its weakest song instead of its oldest demo. Fans were
cut 10x and every rank threshold raised 10x so a rank stays rare. Measured: a steady week
now ends at Pro Studio / Regional instead of Tour Bus / Global.

Three decisions were the user's, taken before any of it was built: the tier pays and
Quality nudges (rather than tier-only); nothing retroactive, so only new songs benefit; and
a week of steady play should land mid-ladder.

**Phase Two, stage 0 — the save layer, before any content lands on it.** Phase Two is the
content phase (stats, gear, crates, skills, quests, shop); Phase Three is Live Rival Gigs,
a backend, Seasons and Clans. Stage 0 adds no feature — it fixes the thing every later
stage depends on, which is that a newer version can add a field and an older save gets it.

- **`Object.assign` aliases, and that broke nested defaults.** `load()` did
  `base = newState(); s = Object.assign(base, d)` — after which `base.gig` **is** `d.gig`,
  so the follow-up `Object.assign(base.gig, d.gig)` was `assign(x, x)` and a newly-added
  nested default arrived `undefined`. `deepDefaults(saved, defaults)` walks instead, never
  mutating the defaults, and the three hand-written `Object.assign` lines for `flags`,
  `gig` and `cloud` are gone with it.
- **The same aliasing was padding `heat` with `undefined`.** `base.heat` was the save's own
  short array, so a pre-16-genre save got `heat[10..15] = undefined` → every new genre read
  COLD and `stepTrends` produced `NaN`. With `base` pristine the pad reads real seeded heat.
- **`studioMult()` is deleted.** It referenced `BAL.studioStep`, which the craft rework
  removed, so calling it would have returned `NaN`. Zero call sites; dead since the rework.
- **`weekNum()`** joins `dayNum()` — a monotonic week index for the weekly challenge, with
  the same wound-back-clock protection.
- **The whole Phase Two save shape is declared now**, so no later stage has to migrate:
  `gear{own,next}` `cards[4]` `star[4]` `pts[4]` `spend[4]` `skills[4][]` `hours` `parts`
  `crates{own,pity,opened}` `quests{day,list,done,reroll,streak,freeze,best}`
  `weekly{week,id,prog,done}` `career{obj}` `offers{seen,sessionShown}` `inbox[]`
  `vipUntil` `log[]`, plus `gear{inst,rig}` on each member. Nothing reads any of it yet.
  `S.vip` stays until Stage 8 replaces it with `vipUntil`.

The new `sv2` suite is the proof: it patches `newState()` to add a synthetic future field
at four depths (top level, inside `gig`, three deep inside `crates.own`, and on a member),
strips subtrees whole and in part from a real save, hands one field the wrong shape
entirely, truncates `heat` to ten genres, and asserts every default arrives while every
saved value survives — plus that two `load()` calls share no subtree and the defaults are
not mutated. Twenty assertions, all pass. Twenty suites pass in total, no console errors,
frame time median 16.7ms / p95 17.2ms.

**Phase Two, stage 1 — four stats, one asymptote, and the only fatigue in the game.**
The economy had one progression spine and no branches: a level, a studio, and nothing else
that could ever feed craft. Stage 1 builds the spine every later stage hangs off.

- **The ceiling became a curve.** `craftFloor + craft` was linear and clamped, so Q100 was
  simply a purchase far enough down the road. It is now
  `craftFloor + (100 − craftFloor) × (1 − exp(−craft / craftK))` — it *approaches* 100 and
  never arrives (§6b). Constants moved with it: floor 40 → 33, member 2 → 1.73, lvl
  1.1 → 1.27, exp 0.5 → 0.35, studio 3.5 → 1.8, new `craftK` 46.
- **…so Q100 needed a way to exist.** `flawBonus()` reads the three flawless conditions
  recorded per take and adds up to +6 over the ceiling. A maxed band reaches 100; a
  week-one band reaches 79 playing exactly as well. Auto-taken and botched takes fail all
  three conditions, which is what stops AUTO-TAKE ever being part of a perfect record.
- **`RARITY[].m` is deleted.** It ran 1 → 8 on craft and member power — the unlimited
  multiplier this economy is built to not have. `BAL.starCraft` replaces it, additively.
- **Four stats that each drive a real mechanic** (§6c), read in exactly one place
  (`statOf`). WRITING floors hint accuracy and feeds craft; SKILL converts a take into
  Quality and buys a hard-capped +12% timing window; STAGE lifts hype and floors venue
  fit; STAMINA answers show fatigue and touches nothing else.
- **Fatigue is the STAMINA answer and it lives only in gigs** (§4d). One helper,
  `gigFatigue()`, one landing place, `gigRun.hypeMul`, and a one-song Open Mic is exactly
  0 — so a normal writing take is never punished by it.
- **The rails on the character sheet are real** and carry a `+` and a free RESPEC.
  Nothing grants points yet, so they read 0 — which is the true number, not `SOON`.

Re-simulated (`sim8.js`, 168h, real functions): steady play ends at **Pro Studio, rank
Regional, ceiling Q68, 532 money/s**, casual at the same two landmarks and 211 money/s.
Rule 3 of the plan — a week reaches Regional and Pro Studio — holds for both. §9 has the
table. The ceiling is deliberately far slower than the Q93 the linear curve reached.

Suites: the new `st` suite drives the ceiling ladder (Q37 fresh, Q96.6 maxed, never 100
from craft alone), each stat's formula and its cap, fatigue at every source, **a four-take
song scoring identically at STAMINA 0 and 100**, SKILL's take conversion measured through a
real take, all four flawless outcomes, and allocation plus respec through the sheet's own
buttons. Twenty-one suites pass, no console errors, frame time median 16.7ms / p95 17.5ms.

**Phase Two, stage 2 — the gear is on the characters.** §8b is the system. What is worth
knowing about the build, in the order it was built:

1. **A pure refactor first, proved at 0 diff.** Every instrument moved out of `charSVG`
   into named builders in `INSTR` — `back` for what is drawn behind the body (stands,
   cymbals, a mic stand), `front` for what is in front or in the hands. `sweep.js` differs
   on **0 of 848 nodes** after that step, which is the only way to know a refactor of
   hand-tuned SVG changed nothing.
2. **Then the anchor contract**, because the risk was never the drawing — it was that
   `.ch-bob` uses `transform-box: fill-box`, so its bounding box *is* the bob pivot, and a
   bigger guitar body silently moves it for the whole character. Measured: the first cut of
   the variants moved that box by up to 3 viewBox units. The fix is two-sided — an
   invisible `<rect>` at the base extent pins the minimum, and every variant is clamped
   inside it. A new `anchor` harness measures the bbox for all 20 instrument archetypes;
   all five of each role now resolve to one identical box, and rigs never touch it at all.
   The only sweep difference in the whole stage is those four invisible rects.
3. **Then the items.** 28 archetypes × 5 rarities, rarity on the instance; splits that
   total 100; 23 passives, each one key read at exactly one existing site rather than a
   branch bolted somewhere new.
4. **Then the screens.** The character sheet's two dashed slots became real cards, and the
   gear screen is a detour off a detour — `gearBack` holds the member screen's own back, so
   ← walks out one level at a time. Anything deeper wants a real stack, and says so.

**A duplicate instrument had nowhere to go, and that is the design.** With one member per
role, a second Flying V cannot be equipped — so it is material: scrap it for Parts, +50%
when it duplicates something you own. Only rigs are universal.

**Nothing drops yet.** Every owned member is granted their role's starter instrument and
that is the whole supply until crates ship in stage 4 — a Stage-2 player holds four Common
items and zero Parts. The machinery is complete and the source is the next stage; the suite
grants items directly to exercise it.

Suites: the new `gr` suite drives the table (28 archetypes, splits totalling 100, 23 named
passives, every archetype drawn), the anchor contract, starter grants, role-locking, one
instance in one slot, four rigs at once, the split as a build, upgrades and their cap,
scrapping refused on equipped gear and the duplicate bonus, seven passives measured at
their own sites, and the two screens including a scrap confirm that takes nothing until it
is confirmed. Thirty assertions. Twenty-three suites pass, no console errors, frame time
median 16.7ms / p95 17.3ms.

**Phase Two, stage 3 — the studio became a room.** §8c is the result. A studio had been
a craft number, a name on the stage and a two-stop gradient; eight of them looked like
eight gradients. Now each one draws its own wall behind the band.

- **`ROOM` is one builder per studio**, the same shape as `INSTR` and `RIG` — an entry,
  never a branch. `applyStudio()` calls `renderRoom()`, so every path that changes the
  studio (buying one, loading a save, finishing a gig) repaints it with no new call site.
- **`#room` is a layer, not a component**: between `#bg` and `#band`, under the dock,
  `pointer-events: none`. Tapping the stage is still a jam and still opens a character
  sheet; the suite asserts the z-order and the pointer rule rather than trusting it.
- **The two rules that keep a backdrop a backdrop** are in §8c: nothing solid below the
  floor line (asserted by measuring every shape's `getBBox`), and colours from the
  studio's own palette at 82% opacity. The first Label HQ pass failed the second rule
  visibly — gold records the size of the band's heads — and became five small framed ones.
- **A show is not your studio**: `.away` on the stage fades the room out for a gig.

One real crash, found by the suite rather than by play: `gigTick()` read
`gigRun.hypeMul` and the suite ended a show under a live take, exactly the path that made
`hype()` grow its own guard in Concert Neon stage 5. `gigTick` has the same guard now — a
crash in the rhythm loop is never worth the word it saves.

Suites: the new `rm` suite drives all eight rooms (one per studio, all distinct, each in
its own palette, nothing below the floor line), the layering and the pointer rule, MOVE IN
repainting on the spot, the room surviving a reload, and it stepping aside for a gig and
coming back after. Twenty-four suites pass, no console errors, frame time median 16.7ms /
p95 17.1ms. `sv2` moved one assertion: it read the *player's* gear slot, which now
legitimately holds a starter instrument, so it reads the stripped member's instead and
asserts the saved instrument survives alongside.

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
  As of Concert Neon stage 0 the stylesheet holds **zero** raw hex outside `:root` (the
  `theme-color` meta is the one attribute exception), and every scattered literal in the
  script — 73 quoted, 32 inside template strings — became a `PAL.*` reference.
- The remaining literals are all **content, not palette**: `SKIN` and `HAIRC` (skin and
  hair are not theme colours), the instrument and kit materials inside `charSVG`, and the
  one-off scene colours in `STUDIOS.bg`, `STUDIOS.r`, `VENUES.bg` and `GENRES.c`. Those tables carry
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
  `RARITY`, `STATS`, `STUDIOS`, `TIERS`, `ODDS`, `GENRES`, `GCARDS`, `RANKS`, `CARDS`, `PATTERNS`. Never inline a balance
  number in logic. `INSTR`, `RIG`, `ROOM`, `GEAR` and `PASSIVE` are content tables of the
  same kind — one entry per thing, never a branch. The craft knobs (`craftFloor`, `craftMember`, `craftLvl`, `craftExp`,
  `craftStudio`) and `qNudge` are the two levers that shape the whole curve — moving either
  means re-running the simulation (§9). `GOALS`, `RAIL` and `HYPE_TIERS` are the same idea for content rather
  than balance: an ordered table you extend by adding an entry, never by adding a branch. Studio costs are on the *money* scale, which accrues roughly 10x
  slower than streams — rescale them if `payoutBase` ever changes.
- Card vectors are the game's difficulty knob. `DSCALE` (2.2) is the distance at
  which a card scores zero; it is tuned to how far apart the real card vectors sit,
  not to the theoretical maximum. Raising it flattens Quality; lowering it punishes.
- `save()` writes a versioned object; `load()` must tolerate older versions by
  filling defaults rather than throwing.
- No blocking work in the render loop. Audio buffers are built off the first tap.
- Test by opening the file directly on a phone — there is no dev server.
