# CLAUDE.md — Chart Breaker

Working spec for this repo. Read this before making changes.

---

## PROJECT

**Chart Breaker** — a mobile-first idle game about running a band, writing songs,
releasing them, and climbing the charts.

**Hard constraints (do not violate without being asked):**
- Single-page web app: **one `index.html`** with inline CSS/JS. **No build step, no
  dependencies, no external network requests.**
- Touch-optimized, **portrait**, 60fps, mobile-first.
- Works offline (PWA: inline manifest + home-screen install; a `sw.js` may be added
  later for true cache-first offline).
- State persists to `localStorage` (versioned key, forward-migratable).
- Ship a playable MVP first, then layer features in BUILD ORDER.

---

## BUILD ORDER

> The original prompt referenced a BUILD ORDER list but was truncated before it.
> This is the working order derived from the spec's own unlock schedule and its
> "ship a playable MVP first, then layer" instruction. Adjust if the owner supplies
> the original list.

1. **MVP core loop** — tap/jam, 4 stacking tracks, Hook Moments, RELEASE slot
   machine with tiers + near-miss, catalog passive income, Streams/Hype/Picks,
   band members as generators with levels, studio milestones, Web Audio sound
   layers, offline earnings, seeded content generator, save/load, tab shell with
   Gear/Shop/League stubbed. **← current step**
2. **Gear** — 2 slots per member, rarity, main stat, sound flavor that changes the
   tap timbre (Fuzz, Tape Delay, …). Gear Crates become real drops.
3. **Crates + rarity economy** — member drops, Merge 3-same-rarity → +1 rarity,
   rarity passives.
4. **Retention** — Daily Gig, streaks + streak save, notification triggers,
   loss-aversion gear decay.
5. **Prestige** — "Break Up The Band", Legacy = `sqrt(lifetimeStreams / 1e6)`,
   +2% everything per point, audio strips to solo acoustic and rebuilds.
6. **Events + League** — Weekend Event genres, 50-player League by Legacy tier.
7. **Shop for real** — Picks packs, crate pricing, Battle Pass, VIP, Starter Pack,
   Daily Deal, rewarded ads.
8. **LLM content** — replace/augment the seeded generator, cached, never blocking.

---

## 1. FANTASY
You run a band. Your members write songs on their own while you're away. You release
songs, they climb charts, streams pour in. You use streams to buy gear, upgrade
members, and go from a garage to stadium tours. When the band peaks, you break it up
and start a new one — bigger, faster, with legacy.

## 2. CORE LOOP (30 seconds)
The screen shows the current song being written as 4 tracks stacking up:
DRUMS → BASS → GUITAR → VOCALS
- Each band member fills their track automatically (progress bar per track).
- TAP anywhere = "Jam" → adds progress to all tracks + plays a note. Tapping must
  feel great: screen pulse, note sound, +numbers flying.
- Every 15 taps → Hook Moment: 3 seconds of x10 progress, screen glows, drum fill
  plays. Reward is random-weighted: 60% normal, 30% instant track complete,
  10% free Gear Crate.
- When all 4 tracks are full → RELEASE button pulses.

### RELEASE = the slot machine
Animated reveal (2–3 seconds, skippable after first time):
1. Song title generated
2. Cover art appears (procedural gradient + typography)
3. Chart position rolls like a slot reel: #847… #312… #58… #12… #3!
4. Result tier (weighted, modified by Hype stat):
   - Flop 35% — x0.5 streams
   - Solid 40% — x1
   - Hit 18% — x3, confetti
   - Viral 6% — x10, screen shake, gold, free Gear Crate
   - #1 1% — x50, full celebration, permanent +1% catalog income
Near-miss rule: 25% of Flops and Solids show the reel land ONE spot away from a
higher tier before settling.
Released songs join the CATALOG and generate streams passively forever (the idle
income). More songs = more income = the reason to keep releasing.

## 3. CURRENCIES
- **Streams** (soft) — from catalog per second + release payouts.
- **Hype** (0–100) — raised by gear/members, decays 1/hr offline. Shifts release
  odds upward.
- **Picks** (premium) — gacha, skips, streak saves.
- **Legacy** (prestige) — permanent multipliers.
Number formatting: 1.2K, 3.4M, 8.9B, 1.1T… Numbers animate up.

## 4. UPGRADES (always something 30–60s away)
### Band members (4 slots, each a generator)
Drummer, Bassist, Guitarist, Vocalist. Each has: Level (cost x1.15 per level) →
track speed; Rarity (Common→Rare→Epic→Legendary→Mythic) → speed multiplier + unique
passive. New members from Crates. Merge 3 same-rarity → one rarity up.
### Gear (2 slots per member)
Guitars, pedals, amps, mics, kits, synths. Rarity, main stat (speed / hype / stream
multiplier), and a sound flavor that changes the tap note sound.
### Studio (milestones, feel like a new world)
Garage → Bedroom Studio → Rehearsal Space → Pro Studio → Label HQ → World Tour Bus →
Stadium → Orbital Studio. Each: new background, new ambient loop, x5 global income,
unlocks a new system.
### Unlock schedule (target minute-marks for a new player)
0:00 Tap + Drummer only, first release in ~40s | 2:00 Bassist | 8:00 Guitarist |
12:00 Gear slots + first free Crate | 20:00 Vocalist, Hype visible |
35:00 Bedroom Studio | Day 2: Merge, Daily Gig | Day 3: Weekend Event |
Day 5–7: Prestige reachable

## 5. RETENTION LOOPS
**Daily:** Daily Gig (one special release/day, guaranteed Hit+, missed = gone).
Streak: 7 days → Legendary member; on break: "Save streak for 30 Picks?" before loss.
Offline earnings up to 8h (24h VIP); on return: full-screen "While you were gone"
with animated number + COLLECT, watch-ad for x2. Notification triggers: storage full,
Daily Gig unclaimed at 20:00, streak expiring in 2h, weekend event.
**Weekly:** Prestige "Break Up The Band" — resets streams/members/gear/studio, keeps
Legacy/cosmetics/achievements. Legacy = sqrt(lifetime streams / 1e6), each point =
+2% everything. First prestige ~7 days, then 3–4. League: 50 players by Legacy tier,
top 10 promote, bottom 10 relegate, Sunday rewards. Weekend Event: a genre with
exclusive members + gear.
**Loss aversion:** gear drops to 90% after 3 days without login, one free tap
repairs — exists only to give a reason to open.

## 6. SOUND (the differentiator — do not skip)
Every tap plays a pentatonic note in the current song's key (Web Audio API, synth, no
samples). Each track fills = that instrument's loop layer fades in; full song =
4-layer loop; release = final chord. Studio upgrade = warmer/bigger (reverb, stereo
width). Prestige = strips to solo acoustic, rebuilds. Gear flavor: Fuzz = distorted
taps, Tape Delay = echo. Mute toggle. Haptics on tap (`navigator.vibrate` 10ms) and
on Hit/Viral.

## 7. AI-GENERATED CONTENT
Seeded local generator first, LLM later, all cached, never blocks gameplay: song
titles by genre (no repeats per session), member names + one-line bios + passives,
gear names/descriptions, fake press quotes on Hit/Viral, weekend event themes.

## 8. SHOP (stub in MVP)
Picks: 100/₪12, 550/₪45 (highlighted), 1200/₪90, 3500/₪219.
Crates: Bronze 50 (C60 R30 E8 L1.8 M0.2), Gold 150 (Epic+ guaranteed), Mythic 500
(Legendary guaranteed); 10x = price of 9 + guaranteed Epic.
Battle Pass "World Tour" ₪35/month. VIP "Backstage Pass" ₪19/month: x2 income, 24h
offline, no ads, daily Gold Crate. Starter Pack ₪12 (Epic guitarist + 100 Picks)
shown once after first Hit. Daily Deal 70% off with 24h timer. Rewarded ads: x2
income 4h, free Bronze Crate/day, streak revive, offline x2. Cosmetics: stage skins,
crowd effects, band logos.

## 9. UI (portrait, one-thumb)
Top: Streams counter (huge, animated) + Hype bar + Picks.
Middle: studio scene with 4 members; 4 track progress bars; current song title.
Bottom tabs: Band | Gear | Catalog | Shop | League.
Floating RELEASE button when the song is complete.

> The source prompt was truncated mid-sentence at "Floating RELEASE button when".
> Everything from that point in the UI section is implementation judgement:
> full-width thumb-reachable RELEASE pinned above the tab bar, tabs open as bottom
> sheets over the stage so the stage stays tappable underneath, all interactive
> targets ≥44px, `env(safe-area-inset-*)` respected.

---

## CURRENT STATE

- `index.html` — BUILD ORDER step 1 (MVP) complete. Everything else is stubbed
  behind locked tabs.
- Tap-feel layer on top of step 1: visible Hook meter (counts taps to the Hook,
  then drains through the x10 window), touch ripple, stage brightness kick,
  jittered flying numbers, track-completion stamp, RELEASE shimmer. Audio buffer
  generation is deferred off the first tap (~40ms) so tap 1 is not the slow one.
  Measured 60fps (worst frame 18ms) through 60 rapid taps, no DOM node leaks.

**Known gaps vs. spec (deliberate, deferred to later steps):** gear system, crates as
real drops, rarity/merge, daily gig, streaks, prestige, league, weekend events, real
shop, LLM content, `sw.js` cache-first offline.

## CONVENTIONS

- Everything lives in `index.html`. Keep the section-comment banners
  (`/* ===== AUDIO ===== */` etc.) and add new systems as new banners.
- Balance numbers live in the `BAL`/`MEMBERS`/`STUDIOS`/`TIERS` tables near the top
  of the script — tune there, never inline in logic.
- `save()` writes a versioned object; `load()` must tolerate older versions by
  filling defaults rather than throwing.
- No blocking work in the render loop; generators and cosmetics are precomputed.
- Test by opening the file directly on a phone — there is no dev server.
