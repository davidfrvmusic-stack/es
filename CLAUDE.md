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
3. **Crates + rarity** — **built** (§8d): three crates with published odds and a
   transparent pity floor, member cards, and Star Rank ★1…★5 driving craft, stat points
   and the outfit treatment. There is no 3-into-1 merge — the rarity ladder is the card
   ladder, and two merge systems would muddy both.
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
- **Crates.** Each rank above Garage Band pays a `gift` of crates (§8d), granted the
  moment the rank changes and named on the rank-up card. This replaced a stored `crate`
  odds tier that nothing read — published odds that a rank quietly tilts would not be
  published odds.
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

**CAREER OBJECTIVES — three per room, once each.** The ladder pays money and fans every
time you play it; `CAREER` pays the three things money cannot buy, and each is one-time
per venue.

| objective | what it takes | what it pays |
|---|---|---|
| **Clear the room** | GOOD SHOW or better | 1 Bronze Crate |
| **Bring the right song** | SOLD OUT *and* a Hit-or-better song in the room's genre | 1–3 Studio Hours |
| **Own the room** | peak past 90 hype, **or** three songs with no section below 45% | 15–60 Picks |

Both scaling rewards rise with the room, so the Stadium's objectives are worth playing
for. They are tested against the show that just ended and held in `gig.payout.career` —
**nothing is banked until COLLECT**, so a tab closed on the result card claims nothing and
a replay of a cleared room earns nothing a second time. The venue brief lists all three
with what they pay and marks the claimed ones; the result card names the ones you just
won. `careerOpen()` counts what is still open across the rooms you have reached, which is
what lets a later quest pool retire itself instead of offering a career quest with nothing
left to do.

**This is where Picks and Studio Hours come from.** Crates arrive here and from rank-ups;
Picks and Hours have no other source in the game.

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

Member levels, star rank, the studio, gear and skills all feed **one number**: how good a
song this band is capable of making.

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
the one place they are read). Points come from three places and reach that one reader
through three helpers: Star Rank spends through `S.spend`, gear through `gearStat`, and a
learned skill through `skillStat`. **None of them multiplies streams or touches a released
song.**

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
  grants stat points. It replaced rarity's old 1→8 craft *multiplier* (§6c). See §8d.
- **Gear** — 2 slots per member, visible on the character, and 28 archetypes that are
  builds rather than skins. See §8b.
- **Skills** — 6 per member in three tiers, bought with Studio Hours and gated on ★3 and
  ★5. See §8e.
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

## 8d. CRATES, MEMBER CARDS AND STAR RANK

**The odds are published on the card you open them from** — every rarity, the exact
percentage, and the pity counter, *before* the purchase rather than in a footnote after
it. `CRATES` is the table, and the suite's whole job is to prove the published numbers are
the real ones (20,000 opens per crate, each within 1.6 points of its row).

| crate | Picks | Common | Rare | Epic | Legendary | Mythic | pity |
|---|---|---|---|---|---|---|---|
| Bronze | 50 | 60% | 30% | 8% | 1.8% | 0.2% | Epic+ within 10 |
| Gold | 150 | — | — | 72% | 24% | 4% | Legendary+ within 8 |
| Mythic | 500 | — | — | — | 88% | 12% | Mythic within 5 |

**One roll decides the rarity; a second decides gear or a member card** (`BAL.crateCard`,
22%). The **card bundle scales with the rarity already rolled** — 1 / 2 / 4 / 8 / 16 — so
a card drop is worth **1.70 cards from a Bronze, 5.44 from a Gold, 8.96 from a Mythic**.
That is what stops a Mythic crate ever paying a Bronze crate's card value.

**Pity is a floor, not a second table.** When the counter runs out the same published odds
are re-rolled with everything below `pityAt` zeroed — so the guarantee is exactly "at least
this rarity", and the counter resets on any drop that meets it.

**Gear from a crate is only ever for a chair that exists**, plus the rigs, which fit
anyone. A crate cannot hand you a bass for a bassist you have not hired.

### Star Rank

| rank | cards (cumulative) | stat points | starCraft | outfit |
|---|---|---|---|---|
| ★1 | 0 | — | +0 | base |
| ★2 | 2 | +2 | +2.0 | jacket panels |
| ★3 | 6 | +4 | +3.5 | shoulder studs |
| ★4 | 14 | +7 | +4.5 | trim + glow |
| ★5 | 30 | +11 | +5.0 | aura |

- **Cards always go to whoever is furthest behind** (`lowestStar()`, ties on fewest cards
  then on the slot), so four members rise together instead of one running away. Measured:
  eight card drops land 0,1,2,3,0,1,2,3.
- **A big bundle can cross two ranks at once**, and `applyStar` pays the points for every
  rank it crossed, not just the last one.
- **`S.members[i].rarity` follows the star**, which is what makes the existing outfit
  treatments (§3) the star cosmetic — no second system.
- **Identity is never touched.** Name, look, bio and role are asserted byte-identical
  across a ★1 → ★5 climb. A star rank changes what they can do, never who they are.

### Where crates come from

**A rank pays in crates.** `RANKS[].crate` used to be an odds tier that nothing read, and
tilting published odds by rank would make the published odds a lie — so it is
`RANKS[].gift` now: Local Act 2 Bronze, Regional 3, National 3 + 1 Gold, Global 2 Gold,
Legend 1 Mythic. The gift is granted at the moment the rank changes rather than when the
card is shown, because `rankUp()` runs twice when the card has to queue behind a reveal.

**Picks buy them**, at the prices above, and Picks come from the **Own the room** career
objective in each venue (§4d). Daily quests are the second source and are a later build
step; the Shop says so in as many words.

**The open is the fifth reward moment** and borrows the other four's component (§13c).
Layer two is the star bar filling rather than a counter easing, because a crate moves a
*member*, not money, streams or fans.

## 8e. SKILLS — the third craft source, and the only thing Hours buy

**24 skills, six per member, three tiers.** Tier 1 costs `BAL.skillHours[0]` (3) Studio
Hours and is open to anyone; Tier 2 costs 6 and wants a **★3** member; Tier 3 costs 12 and
wants **★5**. That is 42 Hours a member, **168 for a full band** — and the gate is the
crate ladder, never money. A skill is permanent and cannot be refunded (a stat *point*
can, because the player allocates it; a skill is a purchase with a published price).

| role | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| **drums** | *Steady Hand* +8 SKILL · *Deep Breath* +8 STAMINA | *Click Track* perfect window +3% · *Second Wind* show fatigue −12% | *Pocket Player* IN THE POCKET at 7 · *Machine* a stage miss costs 20% less |
| **bass** | *Root Notes* +8 WRITING · *Groove* +8 SKILL | *Lock In* coherence +6% · *Sustain* the crowd cools 8% slower | *Foundation* +4 craft · *Walking Line* take → Quality +6% |
| **guitar** | *Chord Shapes* +8 WRITING · *Stage Presence* +8 STAGE | *Signature Tone* genre fit +5% · *Feedback* +8 starting hype | *Songwriter* +4 craft · *Solo* encore threshold −5 |
| **vocals** | *Breath Control* +8 STAMINA · *Projection* +8 STAGE | *Phrasing* hint floor +4% · *Crowd Work* venue-fit floor +0.06 | *Front Person* crowd milestones land 5 earlier · *Range* +4 craft |

**A skill is one entry with one effect, and it lands on a site that already exists.** Each
carries either `s` — a stat it grants, read by `skillStat` inside `statOf` — or `k`, **the
same effect key a gear passive uses**, summed by the same `fx(i, key)` / `fxBand(key)`.
Eleven of the fourteen keys were already being read for gear; the whole stage added exactly
three new read sites, each a one-line helper next to the constant it replaces:

    tierAt(k)   HYPE_TIERS[k].at − milestoneCut   (Front Person; tier 0 never moves)
    encoreAt()  BAL.gigEncoreAt − encoreCut       (Solo)
    pocketAt(i) BAL.pocketStreak − pocketAt       (Pocket Player, floored at 2)

plus `gigMissCut` inside `missNote` and `hypeHold` on the drift term in `gigTick`.

**Studio Hours have exactly one source and exactly one sink.** They come from the *Bring
the right song* career objective (§4d), 1–3 a room, and later from the weekly challenge and
streak milestones; they are **never bought with money and never granted by an ad**. They
buy skills and nothing else.

**Nothing here reaches a released song.** The suite asserts a released song's `songSPS` is
byte-identical before and after all 24 are learned, while `craftCap` moves — which is the
same rule §6 states for every other upgrade.

The screen is a section on the character sheet, under Stats and above Gear: three tier
headings carrying the cost and the star gate, six rows each naming the skill and what it
does, and a LEARN button that greys out with the reason on the row — *needs ★3*, or how
many more hours to go.

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
- **Picks** (premium) — crates (§8d), and later swaps and Streak Freezes. Earned from the
  **Own the room** career objective in each venue (§4d), 15 at Open Mic to 60 at Stadium,
  from **daily quests** (10 and 18 a day, plus 60 at the 14-day milestone, §15), and 20
  from a Viral release.
- **Parts** — from scrapping gear you are not playing and from the second daily-quest slot,
  and the only thing that upgrades gear.
- **Member cards** — per member, and the only route to a star rank. Never bought.
- **Studio Hours** — from the **Bring the right song** career objective (1–3 a room), the
  weekly challenge (5) and the streak milestones (2 / 3 / 5 / 8). Never from money and never
  from an ad; they buy **skills** (§8e) and nothing else.
- **Legacy** (prestige) — permanent multipliers.
- **VIP** — `S.vipUntil`, a timestamp. Convenience only: the 24h offline cap, the ad
  rewards posted to the Inbox daily, a Bronze Crate a day, one more quest swap and no ad
  prompts. **Never an income, streams or craft multiplier.** The one in-game path is a
  single free 24-hour trial, once ever, from Offers (§14) — plus, once a checkout exists, the
  30-day Backstage Pass in `PAY`.
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
under it. **The rail draws one icon per system that has something waiting** — `daily`
(the quest board, §15) and `inbox` (§14) are live and tap through to their own screens;
`event` and `offers` draw only when their state says so. Nothing inactive is drawn, and a
badge appears only when it is non-zero.

**The rail is named chips, not mystery icons.** Each entry carries a label beside its
icon — DAILY · SEASON · INBOX · EVENT · OFFER — because an unlabelled glyph on a stage is a
guess. Five systems declare an entry and only the ones with something waiting are drawn.

**The rail owns a row rather than floating over the band.** It used to be absolutely
positioned at the stage's top-right, which was fine while it drew nothing — and put two
buttons squarely on top of the fourth member the moment two systems started filling it. The
band is four wide and fills the stage, so there is no corner for an overlay to live in. It
reserves its own right-aligned row under the band name now, and fades out for a session like
the two labels either side of it.

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
**Three screens have no tab of their own** and are reached from where they belong: the
character sheet from the stage (§13b), **Daily** from the rail's quest icon, and **Inbox**
from the rail's inbox icon. Each is a detour — `sheetBack` remembers where it came from and
the header button is `←` rather than `✕`.

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
  role, an `LV n` chip, the star rank's name as the rarity chip, and their one line of bio.
- **Star rank** — `★★★☆☆`, the craft it adds, how many cards to the next one and a bar,
  plus the line that says a rank change never touches their name, face or instrument.
- **What they bring** — the two things a member actually does today: their band
  multiplier (with the reminder that it lifts the *whole* catalogue, and what that
  catalogue currently earns) and their writing-card count, hint clarity and the next
  card level unlocks.
- **Stats** — WRITING / SKILL / STAGE / STAMINA, four real rails now (§6c), each with its
  value, a one-line note on what it drives, a `+` while the member has unspent points, and
  a free `RESPEC` once anything is spent. Star Rank grants the points; gear and skills add
  to the same rails directly, so a starter instrument alone already moves them.
- **Skills** — three tier headings with their cost and star gate, six rows, one LEARN
  button each, and the reason on the row when it is greyed (§8e).
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

## 13d. ONE POP-UP QUEUE

Every full-screen moment goes through one queue, so two can never stack and the order is a
rule rather than an accident of which code path fired first:

| priority | what |
|---|---|
| **0** | a **reward moment** — the reveal, a gig result, the offline haul, a crate open |
| **1** | **progression** — a rank-up |
| **2** | **commercial** — nothing, because an offer is a Shop surface and not a pop-up (§14) |

`POPS` is the list of panels that own the screen and `popBusy()` is the one thing every
caller asks — it also counts a live take and a live show, so nothing can land on the lanes.
`pushPop(prio, fn)` queues and sorts; `drainPops()` runs the next one and is called by every
panel as it closes.

`rankUp()` used to carry its own two-panel guard (`revealing || #gone`), which missed the gig
result, the crate open and every modal — a rank-up could land on top of a crate you were
opening. It queues now, and a crate opened while something else owns the screen queues too.

## 14. SHOP, ADS, VIP, OFFERS AND THE INBOX

Shop is, top to bottom: your **Picks / Parts / Hours** balance, **this session's offer** if
there is one, the **three crates** (§8d), the **consumables**, the **rewarded ads**, the
**VIP card**, and then `RESERVED` — the rails for surfaces that still do not exist.

### What Picks buy

| item | Picks | cap |
|---|---|---|
| Bronze / Gold / Mythic Crate | 50 / 150 / 500 | — |
| Gig ticket | 25 | 2 a day |
| Quest swap | 15 | 2 a day |
| Streak Freeze | 40 | 2 held |

**A "skip" here is a consumable you would otherwise wait a day for** — a ticket, a swap.
It never skips a timer, because nothing in this game runs on one. The daily caps sit on
`S.shop`, rolled by the same monotonic `dayNum()` the tickets and the quest board use, so a
wound-back clock buys nothing.

### Rewarded ads — a labelled simulation, and nothing permanent

| ad | pays | cap |
|---|---|---|
| Ticket | +1 gig ticket | 3 a day |
| Picks | +10 Picks | 2 a day |
| Offline x2 | doubles the pending offline haul | once per return |

`ADS` is the table and `watchAd(id)` is the one component — a five-second countdown, no
network, and **the reward lives in the terminal branch only**, so closing it early grants
nothing. The gig panel's ad used to be its own function with the ticket hard-wired in; it is
a table entry now. **No ad grants VIP, money, streams or craft** — the suite reads the `ADS`
block out of the shipped file and asserts none of those words appear in it.

### VIP — convenience, never advantage

`S.vipUntil` is a timestamp (`vipOn()` still honours the old `S.vip` boolean). **No income
multiplier, no streams multiplier, no craft bonus** — the suite measures `moneyRate()`,
`totalSPS()` and `craftCap()` across turning it on and asserts all three are unchanged.

| benefit | detail |
|---|---|
| a 24h offline cap instead of 8h | already wired, now off `vipOn()` |
| the ad rewards, without the ads | **3 gig tickets + 20 Picks posted to the Inbox each day** — exactly what a free player collects from the two ad slots — and the offline x2 applied for you |
| no ad prompts | the ad rows and the gig panel's ad button are hidden outright |
| +1 quest swap | 2 free instead of 1 |
| 1 Bronze Crate a day | content, not currency; it rides the same inbox post |
| a VIP line on the Shop card | cosmetic |

**Ads never grant VIP.** The only in-game path is a **single 24-hour trial, once ever**
(`S.vipTrial`), offered from Offers. A real subscription is a Phase Three surface, and there
is **no priced button** for it — a checkout that does not exist would be exactly the lie the
reserved rails avoid.

### Offers and the Inbox are separate, in every way

- **Offers** is commercial, and it appears in **two** places: a card at the top of the Shop,
  and **one pop-up a session** (`offerPop`). The pop-up was built in stage 8, deleted the
  same day for landing over the rewarded ad's own modal, and is back now because §13d's
  queue is what makes it safe — it is pushed at **priority 2**, behind every reward moment
  and behind the rank card, so it can never land on a take, a show, a panel or another
  modal. It is also refused while any screen is open, and polled from the slow clock rather
  than fired on a timer, so it waits for a calm moment instead of interrupting one.
  `S.offers.sessionShown` caps it at one a session; NOT NOW writes the id to
  `S.offers.seen` and it never returns at all. There is **no expiry countdown** anywhere,
  and no offer is shown before `BAL.offerAfter` (3) releases — a pitch before the first
  record is a pitch at nothing. `OFFERS` holds two entries: the free VIP trial, and the
  Season Pass, whose `ok()` requires `payOn()` — **an offer you cannot accept is never
  shown**, so with no provider the second one does not exist.
- **The Inbox** is delivery: VIP daily grants today, compensation and posted payouts later.
  `inboxPost` / `inboxClaim` / `inboxClaimAll`, one screen off the rail, a TAKE per row and
  TAKE EVERYTHING under them.
- **They share no state.** `S.offers` is `{seen, sessionShown}` and `S.inbox` is an array;
  Offers never writes to the Inbox and the Inbox never advertises. The suite asserts the
  shape of both.

### PAYMENTS — every edit point in one banner

**Nothing charges anybody and nothing reaches the network.** There is no provider SDK in the
file and the no-network rule (§17) still holds byte for byte. What exists is the *shape* a
checkout drops into, so wiring one up is four edits in one place instead of a hunt.

**To connect a real provider, edit exactly these four things:**

| # | edit | what it is |
|---|---|---|
| 1 | `PAYMENTS` | provider, env (`none` / `sandbox` / `live`), publishable key, currency |
| 2 | `PAY[].sku` | the product ids as they read in that provider's dashboard |
| 3 | `checkout(id)` | open their sheet; resolve `{ok:true, txn}` on success, `{ok:false}` on cancel |
| 4 | `restorePurchases()` | ask what this account owns; return product ids |

**Everything under those four already works and is covered by the suite.** `PAY` is the
catalogue — four Picks packs (100 / 550 / 1200 / 3500) and a 30-day Backstage Pass — and each
entry's `give` is a reward *in the same shape every other system pays in*, so a pack, a quest
and a career objective all land through `grantReward()`. `grantProduct(id, txn)` is the
entitlement path a webhook would call; **the same transaction id is never paid twice**, which
is what makes `applyRestore()` safe to run on every boot. A **consumable is never restored** —
a spent pack of Picks would be minted currency — while a subscription is.

**`checkout()` never grants anything itself.** `buyProduct()` calls it, and only on
`{ok:true}` calls `grantProduct()`. That keeps one place an item is handed over, whatever the
provider does.

### The rails that are left

`RESERVED` is gone as a hand-written table: **the two remaining rails are built from `PAY`**,
so the reserved copy and the real store can never disagree about what exists. While
`payOn()` is false the Shop shows them as rails — the spec as text, **no button at all** —
because a greyed-out `BUY $1.99` on a product with no checkout behind it reads as *you cannot
afford this*, which is a lie about something that cannot be bought at all. Set a provider and
**the same table renders as real product cards with real prices and a RESTORE PURCHASES
button, and the screen's shape does not move** — the suite asserts the section order is
identical either way. Sandbox is labelled SANDBOX on the screen.

A crate's or a consumable's BUY *is* greyed out when you cannot afford it, and that is not the
same lie: the thing is real, the price is real, and the balance is real. The VIP and Offers
rails are gone because those surfaces exist now, the same reason the Gear and Crates rails
went in Concert Neon stage 8.

Settings carries a **Purchases** row: whether payments are connected, how many receipts are on
the device, and RESTORE when a provider is set. It says plainly that no request leaves the
device.

**The Home rail carries four systems and draws the two that exist** (`RAIL`, §13): `daily`
(the quest board, badge = claimable) and `inbox` (badge = posts waiting) are live; `event`
(weekend events) and `offers` (which draws only while an unseen offer is available) read
state that is usually or always empty. A badge is drawn only when it is non-zero, so a
fully-claimed day is a bare icon rather than a "0".

## 15. DAILY QUESTS, STREAKS AND THE WEEKLY CHALLENGE

**Three quests a day, one reward each, and a streak that bends instead of breaking.** The
screen is reached from the Home rail and is called *Daily*.

| slot | pays |
|---|---|
| 1 | 10 Picks |
| 2 | 18 Picks · 8 Parts |
| 3 | 1 Bronze Crate |

**Every quest type declares `eligible()`, and an ineligible type is never dealt.** That is
the rule the whole pool is built around, because a daily quest that cannot be done is worse
than no quest at all:
- **"Open a crate" needs a crate you already own.** A quest can never ask for a purchase.
- **A career quest retires when `careerOpen()` is 0** — the function §4d built for exactly
  this moment.
- **A gig quest wants a released song and a ticket** (or an unclaimed objective).
- **"Land a Hit" wants a release**, "Learn a skill" wants one that is affordable and
  unlocked, and so on.
- **Five types are always eligible** — write a song, hit a Quality target, get IN THE
  POCKET, land perfect takes, level a member — so `dealQuests()` can always fill three
  distinct slots however bare the save is. The suite deals 200 boards in the barest
  possible state and asserts every one of them is three distinct, doable quests.

**One bus, no polling.** `qEvent(key, n)` is called at the moment a thing happens —
release, hit, quality, gig, sold, career, crate, pocket, perfect take, level, skill — and
the day's board and the week's challenge both read it. A quest that has met its target
stops accumulating; `mode:'max'` quests (the Quality target) take the highest rather than
the sum.

**One free swap a day, and it swaps one quest, not the board.** Rerolling the whole set
would make the eligibility rules pointless — you would simply reroll past anything
inconvenient. The swapped slot is re-dealt from the eligible pool minus what is already on
the board, and its progress resets. Extra swaps cost Picks (build step 8); VIP gets one
more free.

**The streak bends.** A day counts when all three are claimed, and the streak moves on the
*press* rather than at some invisible midnight, so the milestone lands where the player is
looking. A missed day costs **one day, not the streak**. A **Streak Freeze** spends itself
instead of the day — one is earned every week, two held at most, and it will be buyable in
build step 8.

| milestone | pays |
|---|---|
| 3 days | 2 Studio Hours · 1 Bronze Crate |
| 7 days | 3 Studio Hours · 1 Gold Crate |
| 14 days | 5 Studio Hours · 60 Picks |
| 30 days | 8 Studio Hours · 1 Mythic Crate |

Milestones fire **once each, on the way up past `quests.best`** — a streak that falls and
re-climbs does not pay twice.

**The weekly challenge rotates on the week index, not a roll.** `WEEKLY` is five entries
and `weeklyFor(weekNum())` picks one, so the same week deals the same challenge on every
device with no seed to store and nothing to re-roll on load. It pays **1 Gold Crate + 5
Studio Hours**, and the rollover is also what grants the week's Streak Freeze.

**Nothing here is a timer.** The board changes when `dayNum()` does and the challenge when
`weekNum()` does — both monotonic, so a wound-back clock deals nothing and loses nothing
(the suite winds it forward five days and asserts the board is untouched). There is no
countdown bar anywhere on the screen; the copy says a new board is dealt when the date
changes, which is the true statement.

**Where the rewards land.** `grantReward(r)` is the one place a reward of any shape is paid
— Picks, Parts, Studio Hours, crates — and career objectives now go through it too, so a
quest, a milestone, a career objective and the weekly challenge cannot drift apart.
`sayReward(r)` is the matching one place it is written out.

---

## 15b. THE SEASON PASS — one track, two lanes, no clock

A season is `BAL.seasonDays` (28) long and its index is `floor(dayNum() / 28)` — the same
monotonic day count the quest board and the shop caps ride. **A wound-back device clock
cannot re-open a finished season**, and there is no countdown anywhere on the screen: it
says which season you are in and what is left to take, never how long you have.

**XP comes only from things you already do.** `PASS_XP` reads the same `qEvent` bus the
daily board and the weekly challenge read — release 10, Hit 25, show 20, sold out 15,
career objective 40, crate 5, pocket 3, perfect take 5, level 8, skill 30. **One flat value
per event, never scaled by the event's own number**, so a Q95 song cannot pay 95 XP and the
Quality event pays nothing at all. Nothing anywhere sells XP.

**Twenty tiers, 120 XP each, and both lanes pay on every one.** The free lane is the whole
ladder — Picks, Parts, Studio Hours and crates, rising to a Gold Crate at tier 20. The paid
lane is a *second* reward on the same tiers, rising to a Mythic. It **never adds XP and
never speeds the track up**: it is more of the same rewards, not a faster climb.

**The paid lane is the Season Pass in `PAY`** (§14), and with no payment provider it renders
as a reserved rail — what it will hold, no button, no price. Unlocking it pays out **every
tier already earned**, immediately, which is what `passClaimAll()` does the moment
`S.pass.premium` flips.

**Nothing on this track touches the economy.** The suite asserts a released song's `songSPS`
and `craftCap` are unchanged across claiming all forty rewards — the same rule §6 states for
every other system.

The screen is reached from the rail's SEASON chip, which badges how many rewards are
claimable. A new season resets XP, both lanes and the premium flag; `rollPass()` runs on the
same slow clock as the daily rollover and only ever moves forward.

## 16. CUSTOMIZATION — all of it free

**Nothing on this page costs anything, ever.** Not Picks, not money, not an ad. A look is
identity, and identity is not a product.

- **A full look editor** on each member's own screen: `LOOK_PARTS` is four rows — SKIN,
  HAIR, COLOUR, ACCESSORY — each a named cycler, plus SHUFFLE. Random-on-unlock is a
  starting point now rather than a sentence. The character on the stage redraws on the
  press.
- **Instrument finishes.** `COLORWAY` is five entries: *As built* plus Sunburst, Midnight,
  Ivory and Chrome. An item unlocks **one more per rarity step** (`cwOpen`), so a Common
  plays as built and a Mythic plays any of the five. It repaints the **instrument only** —
  the member's shirt is still their own colour (§3), and the suite asserts both.
  - **Every string instrument and mic declares its own `f` pair** — the two colours it was
    already drawn in — and the builder paints from `k.c1` / `k.c2`. With no finish chosen
    that pair *is* the finish, so the 15 archetypes render exactly as they did before
    finishes existed. A chosen colourway replaces the pair.
  - **A drum kit has no `f`,** and gets no finish: its shells take the member's own colour,
    which is what a kit is and what `kit0` was always drawn as. The picker does not appear
    for the drums, and the copy says why.
- **The stage banner** is the band's name on a cloth strip over the stage, toggled in
  Settings. Same element (`#bandChip`), one class.
- **Star Rank treatments** are automatic and unchanged (§3, §8d) — a rank changes the outfit
  on top, never the person underneath.

## 17. THE ACTIVITY LOG — local, capped, and it never leaves the device

`S.log` is a ring buffer of the last `BAL.logMax` (200) notable things you did, written at
**one site**: `qEvent`, which is already the single bus every notable action goes through,
plus the two purchase paths that are not events. Settings shows the count, the last twelve
with how long ago, a CLEAR button and an **off switch that empties it rather than pausing
it**.

**There is no analytics service, no account and no network request anywhere in this game.**
The suite asserts that: it strips the one allowed URL (the SVG namespace, which is a name
and not an address) out of the shipped file and then asserts `fetch(`, `XMLHttpRequest`,
`sendBeacon`, `new WebSocket`, `EventSource`, `http://` and `https://` appear **nowhere**.

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

**Phase Two is complete.** Ten stages: the save layer, stats, gear, the room, crates, career
objectives, skills, quests, the shop, and customization. **Phase Three** is Live Rival Gigs,
a backend, Seasons and Clans — and with them the two checkouts (Picks packs, a VIP
subscription) that are reserved rails today.

**Known gaps (deliberate, deferred):**
the *Daily* Gig and rival/multiplayer gigs (the regular ladder in §4d is built),
six-cards-per-track-per-genre (128 signature cards ship, 384 do not),
prestige, league, weekend events, a real payment provider (the surface is built — §14 — and
`PAYMENTS.provider` is `null`), LLM content,
`sw.js` offline (and with it, true background storage-full notifications), a real
cloud-save backend.

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

**Phase Two, stage 4 — crates, and the odds are on the card.** §8d is the system. Two
stages have shipped machinery with no source — gear with only its starters, stats reading
0 for everyone. This is the stage that fills both, and the thing it had to get right was
not the drop table but the honesty of it.

- **The published odds are the real odds**, and the suite proves it rather than asserting
  it: 20,000 opens of each crate, every rarity within 1.6 points of its published row.
  Gold and Mythic never roll Common or Rare, because their rows say 0.
- **Pity is a floor, not a second table.** When the counter runs out the *same* odds are
  re-rolled with everything below the guarantee zeroed. Nine forced Commons on a Bronze,
  and the tenth open is Epic or better; the counter resets on any qualifying drop. The
  counter is on the card **before** the purchase.
- **The card bundle scales with the rarity already rolled** (1/2/4/8/16), which is what
  makes a Mythic crate's card drop worth 8.96 cards against a Bronze's 1.70. Without that
  a 500-Pick crate could hand out a 50-Pick crate's card value.
- **Cards go to whoever is furthest behind.** Eight drops land 0,1,2,3,0,1,2,3 — four
  members rise together rather than one running away.
- **A star rank never touches identity.** Name, look, bio and role are asserted
  byte-identical across a ★1 → ★5 climb; what changes is craft, stat points and the outfit
  treatment that §3 already had.
- **A rank pays in crates.** `RANKS[].crate` was an odds tier nothing read — and tilting
  published odds by rank would make them not published. It is `gift` now, granted at the
  moment the rank changes rather than when the card is shown, because `rankUp()` runs
  twice whenever the card queues behind a reveal. The suite forces exactly that race.
- **The open is the fifth reward moment** and reuses the other four's component, with the
  star bar as layer two.

**Picks still have no source**, and the Shop says so on the screen. Crates reach a player
through rank-ups until quests and career objectives land in stages 6 and 7; that is the
sequencing, and pretending otherwise would be the same lie the reserved rails exist to
avoid.

Suites: the new `cr` suite is 30 assertions — the three odds tables measured, the pity
floor and its reset, the 22% split, the bundle by rarity, the card-value gap between
crates, the full star ladder with its points and cosmetics, identity survival, the
spread-to-the-furthest-behind rule, gear never dropping for an empty chair, the rank gift
landing exactly once under a queued card, buy/hold/open in the Shop, the moment's three
layers, and everything surviving a reload. Twenty-five suites pass, no console errors,
frame time median 16.7ms / p95 17.2ms. The star card's progress bar started life as a
`.statrail`, which broke `st` immediately: that class promises a name and a value and
three suites read them. It is a `.starbar` now.

**Phase Two, stage 6 taken before stage 5 — career objectives, so Picks and Hours have a
source.** The plan runs Skills at 5 and Career Gigs at 6. Two stages in a row had already
shipped a system with nothing feeding it, and skills are bought with Studio Hours, which
*only* career objectives grant — so building them in plan order would have made three.
The two stages are independent, so they were swapped. Nothing else about either changed.

- **Three objectives per room, tested against the show that just ended** (§4d). Clear pays
  a Bronze Crate; Craft — sold out *and* a Hit-or-better song in the room's own genre —
  pays 1–3 Studio Hours; Own The Room pays 15–60 Picks, and takes either a 90-hype peak or
  three songs with no section below 45%. Both scaling rewards rise with the venue.
- **They obey the gig's existing rule**: held in `gig.payout.career` and granted only on
  COLLECT, so a tab closed on the result card claims nothing. The suite asserts the whole
  path — met, held, nothing banked, then paid and marked, then a replay paying nothing.
- **"Nothing falling apart" needed a number.** A gig take never fails you out, so there is
  no failed section to count; `endGigSection` now records each section's accuracy and the
  test reads it against the same 0.45 the studio take grades a passing take at.
- **`careerOpen()` exists for a stage that has not shipped.** Build step 7's quest pool has
  to retire career quests when nothing is left; this is the one function it will ask.

Suites: the new `ca` suite is 17 assertions — the reward ladders, every objective's test
against the cases that should and should not pass it, the brief before and after, held vs
banked, the replay, a show the tab closed on, and the open count. Twenty-six suites pass, no console errors,
frame time median 16.7ms / p95 17.2ms.

**Phase Two, stage 5 — 24 skills, and the third craft source is real.** Two stages shipped
machinery ahead of its supply on purpose; this one closes the loop the other way round.
Career objectives (stage 6, taken first) grant Studio Hours, and Hours now have the one
thing they buy. §8e is the system.

- **Eleven of the fourteen effect keys already existed.** A skill declares either `s`, a
  stat, or `k`, *the same effect key a gear passive declares* — so `fx(i, key)` grew one
  loop over the member's learned skills and every site that already read a passive reads a
  skill for free. The stage added three new helpers (`tierAt`, `encoreAt`, `pocketAt`) and
  two inline reads (`gigMissCut`, `hypeHold`), each one replacing a bare constant at the
  place it was already being read.
- **The gate is the crate ladder, not money.** Tier 2 wants ★3 and Tier 3 wants ★5, so a
  skill is downstream of member cards; the price is Studio Hours, which no amount of money
  or ad-watching can produce.
- **A skill is permanent and a stat point is not.** A point is allocation and RESPEC is
  free; a skill is a purchase at a published price. Making both refundable would make the
  Hours meaningless, and making neither would make the rails a trap.
- **Nothing here reaches a released song**, and the suite proves it rather than asserting
  it: a released song's `songSPS` is identical before and after all 24 are learned, while
  `craftCap` moves from Q49 to Q75 on the same band.

One naming collision left deliberately: the bass gear passive on the 5-String is *Range*
(coherence) and the vocalist's Tier-3 skill is also *Range* (+4 craft). They live in
different tables, on different members, and both names are the right word for the thing.

Suites: the new `sk` suite is 32 assertions — the table (24, unique, six a member, two a
tier, one effect each), the costs and both star gates, buying refused for hours, rank,
role and repeats, **every one of the fourteen effects measured at its own site** (including
Walking Line through a real take and Machine through a real miss on a real stage), all 24
learned costing exactly 168 hours, the released-song invariant, the sheet's six rows with
only the affordable ones live, LEARN spending the hours and lighting the stat rail, and
everything surviving a reload. Twenty-seven suites pass, no console errors.

**Phase Two, stage 7 — three quests a day, and a streak that bends.** §15 is the system.
What is worth knowing about the build:

- **The eligibility rule is the design, not a guard.** Every type declares `ok()` and an
  ineligible one is never dealt, which is what lets the pool contain quests that reference
  crates you own, career objectives you have left and tickets you hold without ever handing
  a player something they cannot do. The five always-eligible types are what make that safe:
  the suite deals 200 boards in the barest possible save and every one is three distinct,
  doable quests.
- **One bus and no polling.** `qEvent(key, n)` is called where the thing happens — eleven
  sites, each one line — and the day's board and the week's challenge both read it. Nothing
  scans the save looking for progress.
- **The swap is one quest, never the board.** A board reroll would make the eligibility
  rules pointless, because you could simply roll past anything inconvenient.
- **The streak moves on the press.** The third claim is what increments it and fires the
  milestone, rather than an invisible midnight — so the reward lands where the player is
  looking, and `rollQuests()` only ever has to settle *missed* days.
- **`grantReward()` and `sayReward()` are one place each.** Career objectives were paying
  their own crates and hours inline; they go through the same payer now, so four systems
  cannot drift apart.
- **The rail's first entry is real.** `RAIL`'s `daily` was reading `S.daily.ready`, a field
  nothing ever set; it reads the quest board now, with a badge that draws only when
  something is claimable.

Suites: the new `qs` suite is 30 assertions — the tables and the reward ladders, the
eligibility rules (200 boards each in three different states), the bus summing and taking
maxima where it should and stopping at the target, a real crate open and a real level-up
walking it, claiming paying exactly once and never money, the streak over three finished
days with its milestone, a missed day costing one, a freeze spending itself, a three-day gap
costing three, a wound-back clock dealing nothing, a milestone never re-firing, the weekly
rotation and its one-Gold-Crate payout, the freeze cap, the swap, the rail badge, the screen,
and a reload. Twenty-eight suites pass, no console errors.

**Phase Two, stage 8 — the shop stopped being a promise.** §14 is the result. Four things
were built and one was deliberately not:

- **Consumables, not timer skips.** A gig ticket (25 Picks, 2/day) and a quest swap (15, 2/
  day) are things you would otherwise wait a day for; a Streak Freeze (40) is capped by the
  two you can hold. Nothing here skips a timer, because there are no timers to skip, and the
  caps ride the same monotonic `dayNum()` as everything else.
- **One ad component.** `watchGigAd()` was the ticket ad with its reward hard-wired into it;
  `ADS` is a table and `watchAd(id)` is the component. The reward is in the terminal branch
  only, and the suite reads the shipped `ADS` block and asserts the words `vipUntil`,
  `S.money`, `S.streams` and `craft` do not appear anywhere in it.
- **VIP loses nothing and gains no advantage.** Its daily grant is *exactly* what a free
  player collects from the two ad slots — 3 tickets and 20 Picks — posted to the Inbox
  instead of watched for. The suite measures `moneyRate()`, `totalSPS()` and `craftCap()`
  across turning it on and asserts all three are byte-identical.
- **Offers and the Inbox share no field.** One is commercial and lives on the Shop; the other
  is delivery and lives on its own screen off the rail.
- **Not built: a priced offer.** Rule 8 of the plan forbids fake timers, and §14's rule
  forbids a product that cannot be bought. `OFFERS` therefore holds exactly one entry — the
  free 24-hour VIP trial — and the Picks packs stay a reserved rail until there is a
  checkout behind them.

**The offer pop-up was built, and then deleted.** The first cut showed it as a modal a few
seconds after boot. It immediately did two things that made the case against it: it opened
*over the rewarded ad's own modal*, wiping the ad's countdown element out from under a live
interval, and it blocked four test suites by landing on the stage mid-interaction — which is
precisely what it would do to a player. Guarding it (calm moment only, three releases in,
nothing else open) fixed the crash but not the premise, so the pop-up is gone and the offer
is a Shop card. `watchAd`'s interval kept the lesson: it clears itself if the modal is closed
under it, the same shape as the `hype()` and `gigTick()` guards.

One real bug, found by the suite rather than by reading:
- **`modal()`'s danger styling never applied.** The red confirm button's style attribute was
  built inside a plain single-quoted string, so `${PAL.accent}` shipped as literal text and
  the browser dropped the whole declaration. Every scrap and reset confirm had been drawing a
  default button. `modal()` now takes `(html, btn, onOk, two, noLabel, onNo)` and builds both
  buttons in the template literal.

Suites: the new `sh` suite is 34 assertions — the three tables, the "no ad touches VIP or
income" source read, buying and its caps and the daily reset, an ad granting nothing
part-way and everything at the end, VIP's six benefits and its three non-benefits, the inbox
post/claim/claim-all and its separation from Offers, the offer being a card rather than a
pop-up (including that no pop-up function exists at all) and never returning once dismissed,
the Shop's three consumables and its two ad rows disappearing under VIP, the reserved rails
still carrying zero buttons and no currency glyph, and a reload. Twenty-nine suites pass, no
console errors.

**Phase Two, stage 9 — one queue, a free look, and a log that goes nowhere.** The last stage
of the phase. §13d, §16 and §17 are the systems.

- **The pop-up queue replaced a guard that had gone stale.** `rankUp()` checked two panels
  by name; by stage 8 there were seven, so a rank-up could land on top of a crate you were
  opening. `popBusy()` is the one question now, and it counts a live take and a live show as
  well — a rank card can never land on the lanes. The priority is a rule (reward > 
  progression > commercial), not the order the code happened to fire in.
- **Customization is complete and it is all free.** A four-row look editor with SHUFFLE on
  every member's own screen, and instrument finishes unlocked one per rarity step.
- **The finish is a data field, not a special case.** Every string instrument and mic now
  declares its own `f` pair — the exact two colours it was already drawn in — and the
  builder paints from `k.c1`/`k.c2`. With nothing chosen the pair *is* the finish, so all 15
  render identically to before; a colourway simply replaces the pair. The `anchor` harness
  re-measured all 20 archetypes and every role still resolves to one identical `.ch-bob`
  bbox, which is the thing that could have broken.
- **The drums deliberately have no finish.** Their shells wear the member's own colour and
  always have; a kit whose shells are the band's colour is what a kit is. The picker does
  not appear for the drummer, and the copy says why rather than offering five swatches that
  would do nothing.
- **The activity log is one write site.** `qEvent` was already the single bus, so the log
  rides it — no second set of hooks to keep in sync. Switching it off empties it rather than
  pausing it, because a log you have turned off should not still be sitting in your save.
- **And the "no network" rule is now asserted rather than asserted-to.** The suite strips the
  SVG namespace (a name, not an address) out of the shipped file and then requires that
  `fetch(`, `XMLHttpRequest`, `sendBeacon`, `new WebSocket`, `EventSource`, `http://` and
  `https://` appear nowhere in it at all.

Suites: the new `x9` suite is 18 assertions — the queue's busy test, a rank-up queueing
behind a reward moment and landing after it, priority beating arrival order, the four look
rows cycling and wrapping and costing nothing, the five finishes and their rarity gates and
the shirt surviving them, the drums having none, the banner toggle, the log recording,
capping at 200, emptying when switched off and clearing, the whole-file network check, and a
reload carrying all of it. Thirty suites pass, no console errors.

**The Phase Two final pass.** Thirty-one suites (the new `oldsave` harness included), no
console errors, frame time during a gig **median 16.7ms / p95 16.7ms**, and `sim8.js` at 168
simulated hours still lands both players on **Pro Studio and rank Regional** with a **Q68**
ceiling — rule 3 of the plan, unmoved by six content stages. `anchor.js` re-measured all 20
instrument archetypes and every role still resolves to one identical `.ch-bob` bbox.

**A `chartbreaker.v3` save written before Phase Two loads clean**, and the `oldsave` harness
is the proof: it writes a save carrying only the 29 pre-phase fields, with `gear` stripped
off every member and `heat` truncated to ten genres, then reloads and asserts the money,
songs, levels and ownership all survive, the heat array pads with **real numbers** rather
than `undefined`, every Phase Two default arrives (star, skills, hours, parts, shop, inbox,
log, banner, the VIP trial flag), the daily board is dealt and the week has a challenge,
every owned member is holding their starter instrument, and the band still writes and still
earns.

**After Phase Two — the payment surface, and two stage bugs.** Not a stage of the plan: the
two things the screenshots turned up, plus the scaffolding a checkout will land on.

- **`PAYMENTS` / `PAY` / `checkout()` / `restorePurchases()`** — §14. Nothing charges anybody
  and nothing reaches the network; what exists is the shape a provider drops into, so wiring
  one up is four edits in one banner. The catalogue, the grant path, the receipt ledger and
  the restore rules are real and tested; `RESERVED` is now *derived from `PAY`*, so the
  reserved copy and the real store cannot disagree about what exists.
- **The rail was sitting on the fourth member.** Absolute positioning at the stage's
  top-right was fine while the rail drew nothing, and wrong the moment two systems filled it.
  It owns a row now (§13). That exposed a second, older bug: `#band` used `align-items:center`
  with an unclamped portrait, so a member taller than the band spilled its **name tag down
  onto the studio line**. The fix is two modes — `stretch` plus a clamp at rest so the four
  members *fit*, `flex-end` unclamped while playing so the stepped-forward member *overflows*,
  which is the whole treatment. Clamping in both modes collapsed the band to a single pixel,
  because the portrait's intrinsic height is also what stops `#band` shrinking once the
  focused member leaves the flow.
- **Two members could share a first name.** `genName()` deduped on the full name and only
  against *owned* members — but the stage tag shows the first name only, and the setup screen
  draws a name before anybody is owned. It dedupes on `firstOf()` across every slot now.

**A correction to the stage 9 entry above: it said thirty-one suites passed, and thirty did.**
`cr` had been referencing `rankQueue`, which stage 9 deleted when the pop-up queue replaced
it, and the regression run did not surface the crash. It reads `popQ` / `drainPops()` now.

Suites: the new `pay` suite is 18 assertions — the catalogue, no provider meaning no button
anywhere, the grant path paying through `grantReward`, the same transaction id never paying
twice, a subscription turning VIP on for 30 days, a checkout wired in and granting exactly
once, a cancelled sheet granting nothing, restore re-granting a subscription and never a
spent pack, the same table rendering as a store with the screen's shape unchanged, the
payment banner containing no request or SDK or URL, no network request at any point, and a
receipt surviving a reload. The new `ui` suite is 11 — the rail drawing two icons in the flow
and covering no member, every name tag clearing the studio line, a 40px touch target, the
rail fading for a session while the stepped-forward member still fills the stage, and no
duplicate first name across 900 fresh bands, setup draws and hires. Thirty-three suites pass,
no console errors.

**`design/ASSET-BRIEF.md`** is the document to hand to whoever draws the next batch of art.
It carries the hard rules, the paste-ready output shape, the palette, the 24px icon grid, the
character head anchors, the full instrument anchor contract with its exact coordinates, the
rig and room boxes, and the colour-only tables — everything needed to add an icon, a guitar,
a hairstyle or a room without breaking a pivot.

**The season pass, the named rail, and the offer pop-up brought back.** Asked for directly,
after a reference screenshot of a boxing idle game with a labelled side rail and a one-time
offer surface.

- **§15b is the pass.** Twenty tiers, two lanes, XP from the bus that already existed. The
  three things it deliberately does not do: no countdown (a season is a monotonic index), no
  XP for sale, and no economy contact — the suite claims all forty rewards and asserts
  `songSPS` and `craftCap` do not move.
- **The paid lane obeys the §14 rule.** It is a real `PAY` product, so with no checkout it
  renders as a reserved rail with no button and no price, and becomes a real BUY the moment
  a provider is set. Unlocking it pays every tier already earned.
- **The rail entries are named.** DAILY · SEASON · INBOX · EVENT · OFFER, icon plus label —
  an unlabelled glyph on a stage is a guess, and the reference made that obvious.
- **The offer pop-up is back, and this time the queue owns it.** Stage 8 built one and
  deleted it the same day for landing over the rewarded ad's modal; stage 9 built
  `popBusy()` / `pushPop()` for exactly that class of problem. It goes in at **priority 2**,
  behind every reward moment and the rank card, is refused while a screen is open, and is
  polled from the slow clock rather than fired on a timer. The suite drives the queued case:
  it pushes during a live reveal, asserts nothing is shown, ends the reveal and asserts it
  lands.
- **A second offer exists but cannot appear yet.** The Season Pass offer's `ok()` requires
  `payOn()` — an offer you cannot accept is never shown, which is the same rule the reserved
  rails follow.

Suites: the new `bp` suite is 25 assertions — the track, XP per event and the Quality event
paying nothing, claiming once and never ahead of the tier, CLAIM EVERYTHING, the paid lane
refusing without premium and paying everything on unlock, a season resetting forwards only,
the economy invariant, the named chips and their badges, the screen with no button and no
price on the reserved lane, the pop-up queueing behind a reward moment and landing after it,
NOT NOW retiring it, and a reload. Thirty-four suites pass, no console errors.

**`design/GEMINI-PROMPTS.md`** is the art pass, batched: a preamble that carries the rules
and the palette, then eight self-contained prompts — icons, guitars and basses, drum kits,
microphones, rig parts, hair and accessories, rooms, genre badge colours. Each one carries
the exact box, the anchor coordinates that cannot move, and a real entry from the file to
imitate, so a reply can be pasted straight into its table.

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
  number in logic. `INSTR`, `RIG`, `ROOM`, `GEAR`, `PASSIVE`, `SKILLS`, `QUESTS`, `WEEKLY`,
  `CRATES`, `CAREER`, `SHOP_BUY`, `ADS`, `OFFERS`, `PAY`, `COLORWAY` and `LOOK_PARTS` are
  content tables of the same kind — one entry per thing, never a branch. **Art is authored
  against `design/ASSET-BRIEF.md`**, which carries every box, anchor and output shape. The craft knobs (`craftFloor`, `craftMember`, `craftLvl`, `craftExp`,
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
