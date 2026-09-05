# Chart Breaker — asset brief

Everything in this game is **inline SVG written as JavaScript template strings**. There are
no image files, no icon fonts and no network requests, and there never will be — that is a
hard constraint of the project, not a preference. So "make an asset" here means **write a
string of SVG markup that slots into one of the tables below**.

Hand this document to whoever (or whatever) is drawing. It has the exact box, the exact
anchor coordinates, the exact colours and the exact output shape for every drawable thing
in the game.

---

## 0. The seven rules that cannot be broken

1. **Inline SVG only.** No `<image>`, no `url(...)`, no base64, no external anything. If a
   thing cannot be drawn with paths, rects, circles, ellipses and strokes, it does not ship.
2. **No raw hex outside the content tables.** UI colour comes from `PAL.*`, which is read
   once from the `:root` CSS variables. Instrument materials, skin, hair, genre badges,
   venue backdrops and room palettes *are* content tables and carry their own literals —
   those are listed below. Everywhere else, use a token.
3. **Flat and bold.** No gradients, no blur, no filters, no glow. Two or three fills, a
   stroke, done. The game is drawn at ~90px wide on a phone; anything finer than ~0.7 units
   in a 100-wide box will not survive.
4. **Every path must be closed and every attribute double-quoted.** The markup is
   concatenated into a template string and injected with `innerHTML`; a stray backtick or
   `${` breaks the whole file.
5. **Self-closing tags are written long.** `<circle ...></circle>`, not `<circle/>`. The
   existing code is consistent about this; match it.
6. **Coordinates are in the viewBox given for that asset.** Never add a `transform` to a
   whole asset to make it fit — redraw it in the right box.
7. **The anchor contract (§5) is law.** A hand lands where it lands because of hardcoded
   CSS pivots. An instrument that moves an anchor breaks every character animation.

---

## 1. How to hand work back

One JavaScript object literal per table, paste-ready, nothing else around it. For example,
a new icon is one line:

```js
  crown:'<path d="M4 18h16"/><path d="M4 15.5 3 7l5 3.5L12 4l4 6.5L21 7l-1 8.5z"/>',
```

…and a new guitar is one entry:

```js
  gtr5: { f:['#2E5C86', '#4C86BC'],
    front: k => `<ellipse cx="-5" cy="0" rx="15" ry="12" fill="${k.c1}"></ellipse>
      ${gtrNeck()}
      <path d="M54 -6 h9 q3 0 3 3 v6 q0 3 -3 3 h-9z" fill="${k.c1}"></path>
      ${gtrTuners(6)}` },
```

Do not reformat the surrounding file, do not rename keys, and do not "improve" a table's
shape. One entry per thing, never a branch — that is the convention the whole codebase runs
on.

---

## 2. The palette

These are the only UI colours. In JS they are `PAL.cream`, `PAL.accent`, `PAL.onAccent` and
so on; in CSS they are `var(--accent)`.

| token | hex | what it means |
|---|---|---|
| `--cream` / `--cream2` / `--cream3` | `#0B0D12` `#12161F` `#171B24` | app ground / stage / stage floor |
| `--panel` / `--elev` | `#171B24` `#242B38` | a card / a raised surface |
| `--line` / `--line2` | `#2C3444` `#3A4356` | 2px borders — this UI outlines, it never shadows |
| `--ink` / `--dim` / `--dim2` / `--dim3` | `#F7F4EE` `#AAB2C0` `#8A93A3` | text, three weights |
| `--onAccent` | `#0B0D12` | **the label on any bright fill** |
| `--accent` / `-dk` / `-sh` | `#FF5364` `#C93B49` `#A32E3A` | coral — the primary action, money, **drums** |
| `--accent2` / `-dk` | `#20D6C7` `#15998F` | teal — progress, streams, **bass** |
| `--gold` / `-dk` | `#FFC247` `#C68E27` | gold — rewards, PERFECT, **guitar** |
| `--violet` / `-dk` | `#8C6CFF` `#6247C4` | violet — premium, high rarity, **vocals** |
| `--ok` / `--bad` | `#47D982` `#FF4D4D` | success / miss |
| `--face-ink` | `#241A14` | eyes, mouth, straps — drawn on skin, dark in any theme |

**Reserved meanings, never mixed.** Coral is the primary action. Gold is only ever a reward,
a first clear or a PERFECT. Violet is only ever premium or high rarity. Nothing may show more
than three accents at once.

**A bright fill always takes a near-black label.** Cream on coral is 2.9:1 and fails.

---

## 3. Icons — `ICON`, a 24px grid

```js
const ico = (d, o) => `<svg width="${o.s||20}" height="${o.s||20}" viewBox="0 0 24 24" fill="none"
  stroke="${o.c||'currentColor'}" stroke-width="${o.w||2}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
```

An `ICON` entry is **only the inner markup** — no `<svg>` wrapper, no `viewBox`, no
`stroke`, no `fill`. Those come from `ico()`.

- **viewBox `0 0 24 24`.** Keep the drawing inside roughly `2 … 22` so a 2px stroke does not
  clip at the edge.
- **Stroked, not filled.** `fill="none"` is set on the wrapper. If a shape must be solid,
  give that one element `fill="var(--panel)"` (see `band`) — never a hex.
- **Round caps and joins**, set by the wrapper. Draw for them: a 2px round-capped stroke
  reads as ~3px of ink.
- **One weight throughout.** Do not mix 1px detail into a 2px icon.

The set today: `band gear catalog shop league pick sound muted mic money house crate pass
cog cloud save bell trash play globe pin map flag crown home check music fans`.

**Wanted:** a real *daily/quest* mark (the quest rail currently borrows `flag`), an *inbox*
mark (borrows `crate`), *skill*, *parts*, *hours*, *streak/fire*, *ticket*, *star*, *swap*,
*lock*, *plus*, *minus*, *chevron-left/right*, *close*, and a *settings sliders* variant
distinct from `cog`.

---

## 4. Characters — viewBox `0 0 100 130`

The body, legs, torso, shadow and limbs are already drawn and **must not change** — they are
what the CSS animations pivot on. Two parts are open to new content:

### 4a. Hair — `hairSVG(style, col)`

Drawn for a head that is a **circle at (50, 38) with r = 17**. The skull line runs roughly
`x 33 … 67`, `y 21 … 55`. Hair may rise to about `y = 8` and fall to about `y = 62`; wider
than `x 28 … 72` starts to collide with the shoulders at `y 58`.

Return one or more filled paths using the passed `col` — one colour only, no shading.
Five styles ship (crop, bob, spikes, long, bun). **More are wanted**, and each new one needs
a display name for the look editor's `LOOK_PARTS` table.

### 4b. Accessories — `accSVG(acc, col)`

Same head. `col` is the rarity trim colour and should be used for anything that reads as
"equipment" rather than "hair". Four ship: cap, shades, headphones, grill. The eyes are at
`(44, 38)` and `(56, 38)`, r 2.1; the mouth is at `y ≈ 46`. Anything covering the eyes must
leave the face silhouette readable at 90px wide.

### 4c. Skin and hair colour tables

`SKIN` is five tones (`#F6C99E #E0A276 #C98A55 #9B6033 #7E4A2B`) and `HAIRC` is seven
(`#2A1C14 #6B3A1F #C97A2C #EBD9A8 #1B1310 #8A4E18 #D9534F`). Both are content, both can be
extended, and both are surfaced in the free look editor — so anything added must be
distinguishable from its neighbours at thumbnail size.

---

## 5. Instruments — `INSTR`, and the anchor contract

**This is the part that breaks things.** The limbs are round-capped stroked paths animated
with hardcoded `transform-origin` values in CSS. Where a hand lands is a coincidence of
hand-tuned numbers. A variant may not move any of it.

Each entry has up to three keys:

```js
  gtr0: {
    f:[PAL.accentSh, PAL.accentDk],   // the archetype's own two colours — see 5e
    back: k => `…`,                   // drawn BEHIND the body (stands, cymbals, mic stands)
    front: k => `…`                   // drawn in front, or in the hands
  },
```

`k` is `{ sk, c1, c2 }` — the player's skin tone and two colours. **Colour is the only thing
an archetype takes from the member.**

### 5a. Guitars and basses — the neck is the anchor

`front` is drawn inside `<g transform="translate(64 94) rotate(-133)">`, so its local origin
is the bridge and it runs **left (body, negative x) to right (headstock, positive x)**.

- **Every guitar and bass draws the same neck**: `gtrNeck()` — a rect at `x 16 … 54`,
  `y −5 … 5`, with the same two inlays at `(31, 0)` and `(42, 0)`. Call the helper; do not
  redraw it.
- **The fret hand lands at (43, 0.6) in this local space.** Nothing opaque may cover it.
- **The whole instrument must fit inside `x −20 … 66`, `y −12 … 12`.** That is the invisible
  anchor rect the bob pivot is measured from. Anything outside it moves the pivot for the
  entire character.
- Bodies, pickups, headstocks, string counts, cutaways and finishes are all free.
- Helpers you should use: `gtrNeck(fretless)`, `gtrStrings(n)`, `gtrTuners(n)`.

### 5b. Drums — three centres that cannot move

The sticks land on them:

| part | centre |
|---|---|
| snare | `(33, 78)` |
| rack tom | `(67, 76)` |
| bass-drum head | `(50, 102)` |

Stands, cymbals and hardware go in `back`; shells and heads go in `front`. Everything else —
shell count, depth, wrap, hoop material, cymbal size — is free.

### 5c. Microphones — grille and barrel

The grille sits at **`(57, 45)`** and the barrel must reach the hand at **`(64, 55)`**. A
mic stand belongs in `back`. Shields, windscreens and headset booms are free as long as the
face stays readable.

### 5d. Rig parts — `RIG`

Stage props at the character's feet, **drawn outside the bob group entirely** and behind
everything. Box: roughly `x 4 … 34`, `y 96 … 124` in the same `0 0 100 130` viewBox. They
are the only gear that can appear on more than one member at once. Eight ship (amp, 4x12,
pedalboard, tape echo, compressor rack, wedge monitor, DI box, tube preamp); more are
welcome.

### 5e. The `f` pair, and finishes

Every guitar, bass and mic declares `f:[body, face]` — **the exact two colours it is drawn
in today**. The builder then paints from `k.c1` / `k.c2`. With no finish chosen the pair is
the finish, so the archetype looks exactly as authored; when the player picks a colourway,
the pair is replaced. A new instrument **must** declare `f` and use `k.c1` / `k.c2` for its
body and face, or its finishes will do nothing.

The drum kit has no `f` on purpose: its shells wear the member's own colour.

### 5f. How to check an instrument

There is a harness (`anchor.js`) that measures the `.ch-bob` bounding box for all 20
archetypes. **All five archetypes of a role must resolve to one identical box.** If a new
instrument changes it, the whole character's bob pivot has moved and the drawing is wrong —
usually a headstock or a body tip poking outside `x −20 … 66`.

---

## 6. Rooms — `ROOM`, viewBox `0 0 100 100`

One builder per studio, drawn on the wall behind the band. Signature: `r => \`…\`` where `r`
is that studio's own three-colour palette `[wall, prop, highlight]`.

Two rules keep a backdrop a backdrop:

- **Everything lives above `y = 50`.** The band's feet land at about `y = 40` and the dock
  owns the bottom half. Nothing solid may hang below the floor line.
- **It is never brighter than the band.** Colours come only from `r`, and the whole layer is
  drawn at 82% opacity.

The box is stretched with `preserveAspectRatio="none"` — about **10% horizontal distortion**
at a phone's aspect ratio. **Rectangles and lines only.** Nothing that has to stay round.

Eight ship: Garage, Bedroom Studio, Rehearsal Space, Pro Studio, Label HQ, Tour Bus,
Stadium, Space.

---

## 7. Colour-only tables

- **`GENRES[].c`** — 16 badge colours, one per genre, each of which must clear **3:1 on
  `#0B0D12`** and must not exactly reuse a reserved accent. They need to be told apart at a
  glance in a row of chips.
- **`STUDIOS[].bg`** — a two-stop dark gradient per studio; **`STUDIOS[].r`** — the
  three-colour room palette above, in the same dark family as its `bg`.
- **`VENUES[].bg`** — the dark stage backdrop during a show; **`VENUES[].c`** — the room's
  colour on its card, because a dark backdrop on a dark card reads as a hole.

---

## 8. Do not touch

- `charSVG`'s torso, legs, shadow, head circle, eye and mouth geometry.
- The limb paths and the `pl-*` group names.
- `.ch-bob`, `transform-box`, or any `transform-origin` in the stylesheet.
- The `0 0 100 130` character viewBox or the `translate(64 94) rotate(-133)` guitar group.
- Any balance number. Art has no stats: an archetype's stat split lives in `GEAR`, not here.
