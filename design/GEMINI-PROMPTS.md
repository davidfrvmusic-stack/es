# Prompts for the art pass

Eight batches. **Send the preamble once**, then one batch per message — asking for
"all the art" in a single turn produces mush, and every batch below has different
coordinates that must not be mixed up.

Paste each reply straight back to me. I drop it into `index.html`, run the anchor
harness and the suite, and tell you what broke.

Read `design/ASSET-BRIEF.md` first if you want the full contract; every prompt here
carries the parts of it that batch needs.

---

## 0 · The preamble — send this first, on its own

````
I'm adding art to a mobile game called Chart Breaker. It is one HTML file with
inline SVG written as JavaScript template strings. There are no image files, no
icon fonts and no network requests — that is a hard constraint, not a preference.

So "make an asset" here means: write a string of SVG markup that slots into a
JavaScript table. I will send you one batch at a time with the exact box, the exact
anchor coordinates and a real example from the file to imitate.

Rules that apply to every batch:

1. Inline SVG only. No <image>, no url(), no base64, no filters, no gradients, no
   blur, no glow. Two or three fills, a stroke, done.
2. Flat and bold. This is drawn about 90 pixels wide on a phone. Anything finer
   than ~0.7 units in a 100-wide box disappears.
3. Write self-closing tags long: <circle ...></circle>, never <circle/>.
4. Double-quote every attribute. Close every element. The markup is concatenated
   into a JS template string, so a stray backtick or ${ breaks the entire file.
5. Draw in the viewBox I give you. Never wrap an asset in a transform to make it
   fit — redraw it at the right size.
6. Give me exactly the object entries, paste-ready, and nothing else around them.
   No explanation unless I ask, no markdown prose between entries, no reformatting
   of the surrounding table.

The palette. Use these names in code exactly as written (PAL.accent, PAL.gold …):

  PAL.cream   #0B0D12  app ground        PAL.panel  #171B24  card
  PAL.cream2  #12161F  stage             PAL.elev   #242B38  raised
  PAL.cream3  #171B24  stage floor       PAL.line   #2C3444  border
  PAL.ink     #F7F4EE  text              PAL.line2  #3A4356  border, lighter
  PAL.dim     #AAB2C0  text, softer      PAL.dim2   #8A93A3  text, softest
  PAL.onAccent #0B0D12 label on a bright fill
  PAL.accent  #FF5364  coral  — the primary action, and the DRUMS
  PAL.accent2 #20D6C7  teal   — progress, and the BASS
  PAL.gold    #FFC247  gold   — rewards only, and the GUITAR
  PAL.violet  #8C6CFF  violet — premium only, and the VOCALS
  PAL.ok      #47D982  PAL.bad #FF4D4D  PAL.faceInk #241A14

Reserved meanings never mix: coral is the primary action, gold is only ever a
reward, violet is only ever premium or high rarity. Instrument materials, skin,
hair and scene colours are content and may be raw hex — everything else uses a
token.

Reply with just "ready" and I'll send the first batch.
````

---

## 1 · Icons

````
Batch 1 of 8: icons.

Every icon is the INNER markup of a 24x24 SVG. No <svg> wrapper, no viewBox, no
fill, no stroke — the renderer supplies all of that:

  const ico = (d, o) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round"
    stroke-linejoin="round">${d}</svg>`;

So: stroked, not filled. Round caps and joins. Keep the drawing inside roughly
2 … 22 so a 2px stroke does not clip. One weight throughout — never mix 1px detail
into a 2px icon. If one shape must read as solid, give that element
fill="var(--panel)" and nothing else.

Three real entries from the file, for the exact style and density to match:

  band:'<path d="M6 4v16M12 4v16M18 4v16"/><circle cx="6" cy="9" r="2.2" fill="var(--panel)"/><circle cx="12" cy="15" r="2.2" fill="var(--panel)"/><circle cx="18" cy="8" r="2.2" fill="var(--panel)"/>',
  mic:'<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21M9 21h6"/>',
  crown:'<path d="M4 18h16"/><path d="M4 15.5 3 7l5 3.5L12 4l4 6.5L21 7l-1 8.5z"/>',

Draw these sixteen, as one object literal:

  daily      a quest board or a checklist — the daily quest rail chip
  inbox      an envelope or a tray — deliveries, distinct from `crate` (a box)
  skill      a learned ability — a spark, a nested chevron, not a lightning bolt
  parts      a scrap component — a bolt, a cog tooth, something salvaged
  hours      studio time — an hourglass or a clock, distinct from `cog`
  streak     a flame or a chain, for a daily streak
  ticket     a torn stub, distinct from `pass` (a rectangular card)
  star       a five-point star, for a star rank
  swap       two arrows exchanging, for rerolling one quest
  lock       a closed padlock
  unlock     the same padlock, open
  plus       a plus, for spending a stat point
  minus      a minus
  left       a chevron pointing left
  right      a chevron pointing right
  close      an X

Format exactly like this, one per line, nothing else:

  daily:'<path .../>',
  inbox:'<path .../>',
````

---

## 2 · Guitars and basses

````
Batch 2 of 8: five new guitars and five new basses.

These are held in a character's hands and the hand positions are hardcoded, so the
geometry is a contract. Read this part twice.

The instrument is drawn inside a group at translate(64 94) rotate(-133). In that
LOCAL space the origin is the bridge, the body runs LEFT (negative x) and the
headstock runs RIGHT (positive x).

THE THREE RULES:

1. Every guitar and bass calls gtrNeck() and does not redraw it. That helper is:

   const gtrNeck = fretless => `<rect x="16" y="-5" width="38" height="10" rx="1.5" fill="#7A4A22"></rect>
     <rect x="16" y="-5" width="38" height="10" rx="1.5" fill="#5C3416" opacity=".4"></rect>
     ${fretless ? '' : '<path d="M21 -5v10M25 -5v10M29 -5v10M34 -5v10M39 -5v10M45 -5v10M51 -5v10" stroke="#CFC0A6" stroke-width=".7"></path>'}
     <circle cx="31" cy="0" r="1" fill="#E8DCC4"></circle><circle cx="42" cy="0" r="1" fill="#E8DCC4"></circle>`;

   The fret hand lands at (43, 0.6). Nothing opaque may cover that point.

2. THE WHOLE INSTRUMENT MUST FIT INSIDE x −20 … 66, y −12 … 12. That box is what the
   character's bob animation pivots on. A headstock or a body tip poking outside it
   silently breaks the animation for the entire character. This is the single most
   common way to get it wrong — check every coordinate you write.

3. Two more helpers exist; call them, do not redraw them:
   gtrStrings(4) or gtrStrings(6) — the strings
   gtrTuners(4) or gtrTuners(6)   — the tuning pegs

Each entry declares `f:[body, face]` — its own two colours — and then paints from
k.c1 (body) and k.c2 (face). That is what lets a player repaint it later. Use raw
hex or a PAL token in `f`, and k.c1 / k.c2 in the markup. Never put a literal colour
on the body or face.

The real Pawnshop SG, to imitate exactly:

  gtr0: {
    f:[PAL.accentSh, PAL.accentDk],
    front: k => `<ellipse cx="-5" cy="0" rx="15" ry="12" fill="${k.c1}"></ellipse>
      <ellipse cx="8" cy="0" rx="11" ry="9" fill="${k.c1}"></ellipse>
      <ellipse cx="-5" cy="-2" rx="12.5" ry="9" fill="${k.c2}"></ellipse>
      ${gtrNeck()}
      <rect x="-2" y="-7" width="4" height="13" rx="1" fill="#221812"></rect>
      <rect x="-10" y="-7" width="4" height="13" rx="1" fill="#221812"></rect>
      <rect x="-18" y="-6" width="4" height="12" rx="1" fill="#C9BCA6"></rect>
      ${gtrStrings(6)}
      <path d="M54 -6 h9 q3 0 3 3 v6 q0 3 -3 3 h-9z" fill="${k.c1}"></path>
      ${gtrTuners(6)}`
  },

Draw these ten. Give each a distinct silhouette — the body outline is the only thing
that tells them apart at 90px, so vary the waist, the horns, the cutaway and the
headstock shape, not just the colour.

  gtr5  Telecaster-ish slab, single cutaway, flat top, one bridge pickup
  gtr6  Explorer-ish angular, hard diagonal edges, pointed lower horn
  gtr7  Double-cut hollow body with two f-holes
  gtr8  Twelve-string — same body family as gtr0, a doubled headstock
  gtr9  Travel guitar — tiny body, almost all neck

  bas5  Jazz-bass offset, two single-coils, four strings
  bas6  Violin bass, hollow, symmetrical, four strings
  bas7  Headless bass — the headstock is a stub, tuners at the bridge instead
  bas8  Six-string bass, wide neck, big lower horn
  bas9  Upright-ish electric — a narrow, tall, minimal body

Return one object literal per instrument, exactly in the shape above.
````

---

## 3 · Drum kits

````
Batch 3 of 8: four new drum kits.

viewBox 0 0 100 130. Two builders per kit:
  back  — stands, cymbals, hardware, drawn BEHIND the drummer
  front — shells and heads, drawn in front

THREE CENTRES THAT CANNOT MOVE. The drummer's sticks land on them:
  snare          (33, 78)
  rack tom       (67, 76)
  bass-drum head (50, 102)

Everything else — shell count, depth, wrap, hoop material, cymbal size, extra toms
— is free.

Two helpers exist; call them rather than redrawing:

  drumSVG(cx, cy, rx, ry, depth, head, shell, ring, strokeWidth)
    one drum at a centre — an elliptical head plus the shell below it
  kitLugs(colour)
    the six lugs around the bass-drum hoop

Unlike the guitars, a kit takes the member's own colour: it paints from k.c2 and
declares no `f`. That is deliberate — a kit's shells are the band's colour.

The real Punk Bop, to imitate exactly:

  kit2: {
    back: () => `<path d="M12 62 v48 M6 118 l6 -8 M18 118 l-6 -8" stroke="#B9AFA0" stroke-width="1.6" stroke-linecap="round"></path>
      <ellipse cx="12" cy="60" rx="13" ry="2.6" fill="${PAL.gold}"></ellipse>
      <path d="M88 54 v56 M82 118 l6 -8 M94 118 l-6 -8" stroke="#B9AFA0" stroke-width="1.6" stroke-linecap="round"></path>
      <ellipse cx="88" cy="52" rx="13" ry="2.6" fill="${PAL.gold}"></ellipse>`,
    front: k => drumSVG(33, 78, 12, 7.5, 8, PAL.onAccent, '#15181F', k.c2, 2.4) +
      drumSVG(67, 76, 11, 7, 6, PAL.onAccent, '#15181F', k.c2, 2.4) +
      `<ellipse cx="50" cy="102" rx="26" ry="21" fill="${PAL.onAccent}"></ellipse>
      <ellipse cx="50" cy="102" rx="26" ry="21" fill="none" stroke="#15181F" stroke-width="4"></ellipse>
      <ellipse cx="50" cy="102" rx="21" ry="17" fill="none" stroke="${k.c2}" stroke-width="1"></ellipse>
      ${kitLugs(k.c2)}
      <path d="M42 96 h16 v4 h-16z M42 104 h16 v4 h-16z" fill="${k.c2}"></path>`
  },

Draw these four:

  kit5  Jazz kit — small shells, a big ride, brushes rather than sticks implied
  kit6  Electronic pads — flat hexagonal pads on a rack, one small module
  kit7  Cocktail kit — a single tall upright drum, one cymbal, minimal hardware
  kit8  Concert toms — five graduated toms in a row, no bass drum shell visible
        (still draw the bass-drum head at 50,102 — a floor tom standing in for it)
````

---

## 4 · Microphones

````
Batch 4 of 8: five new microphones.

viewBox 0 0 100 130. Two builders:
  back  — the mic stand, drawn behind the vocalist
  front — the mic in the hand

TWO ANCHORS THAT CANNOT MOVE:
  the grille sits at (57, 45)
  the barrel must reach the hand at (64, 55)

The face must stay readable: the head is a circle at (50, 38) r 17, the eyes are at
(44, 38) and (56, 38). A shield or a windscreen may sit beside the mic but must not
cover the face.

Like the guitars, a mic declares f:[body, face] and paints from k.c1 / k.c2.

The real Ribbon, to imitate exactly:

  mic1: {
    back: () => `<rect x="86" y="44" width="2" height="80" rx="1" fill="#B9AFA0"></rect>
      <rect x="79" y="43" width="10" height="2" rx="1" fill="#B9AFA0"></rect>`,
    f:['#8E877B', '#2B2620'],
    front: k => `<rect x="57" y="46" width="7" height="11" rx="3.5" fill="${k.c2}" transform="rotate(-32 60 51)"></rect>
      <rect x="51.5" y="38" width="11" height="14" rx="2.5" fill="${k.c1}" stroke="#5E584F" stroke-width="1.1"></rect>
      <rect x="53.5" y="40" width="7" height="10" rx="1.5" fill="#3A322C"></rect>
      <path d="M53.5 42 h7 M53.5 45 h7 M53.5 48 h7" stroke="#8E877B" stroke-width=".7"></path>`
  },

Draw these five:

  mic5  Vintage ball — a big round chrome grille on a short barrel
  mic6  Lavalier + pack — a tiny capsule clipped high, a small belt pack at the hip
  mic7  Telephone mic — a flat perforated disc in a ring, retro broadcast
  mic8  Shotgun on a boom — long and thin, angled down from a boom arm in `back`
  mic9  Gold-plated condenser — a large-diaphragm capsule in a cage, no shield
````

---

## 5 · Rig parts

````
Batch 5 of 8: six new rig parts.

These are stage props at the character's feet, drawn behind everything and OUTSIDE
the animated group — they never touch the character's geometry, which makes them
the easiest batch.

viewBox 0 0 100 130. Keep every part inside roughly x 4 … 34, y 96 … 124.
No `k` parameter, no `f` pair — a rig has its own fixed colours.

The real Tape Echo, to imitate exactly:

  rig3: () => `<rect x="5" y="104" width="26" height="20" rx="2" fill="#3A322C" stroke="#8E877B" stroke-width="1.4"></rect>
    <circle cx="13" cy="112" r="5" fill="#1B1F27" stroke="#C6BFB3" stroke-width="1.2"></circle>
    <circle cx="24" cy="112" r="5" fill="#1B1F27" stroke="#C6BFB3" stroke-width="1.2"></circle>
    <rect x="8" y="119" width="20" height="3" rx="1.5" fill="#8E877B"></rect>`,

Draw these six:

  rig8   Combo amp on a tilt-back stand
  rig9   Rack case, three units, blank panels and a handle
  rig10  Talkbox — a small box with a tube running up out of it
  rig11  Looper — a wide flat pedal with four footswitches
  rig12  Road case, closed, latches and a stencilled band name block
  rig13  Cable snake — a coiled loom and a small stage box
````

---

## 6 · Hair and accessories

````
Batch 6 of 8: hairstyles and head accessories.

Both are drawn for a head that is a circle at (50, 38) with r = 17, in a
viewBox 0 0 100 130. The skull runs roughly x 33 … 67, y 21 … 55.

Hair may rise to about y = 8 and fall to about y = 62. Wider than x 28 … 72 starts
colliding with the shoulders at y 58.

The eyes are at (44, 38) and (56, 38), r 2.1. The mouth is at about y 46. Anything
covering the eyes has to leave the face silhouette readable at 90 pixels wide.

Hair takes one colour argument and uses it for everything — no shading, no
highlight, one flat fill. Accessories take a trim colour.

The real entries, to imitate:

  // hair, style 3 — long
  case 3: return `<path d="M31 36c0-13 8-19 19-19s19 6 19 19v22h-6V38c-4 4-22 4-26 0v20h-6z" fill="${col}"/>`;

  // accessory 3 — headphones
  case 3: return `<path d="M31 40v-6a19 19 0 0 1 38 0v6" stroke="#2f2a52" stroke-width="4" fill="none"/><rect x="26" y="36" width="8" height="13" rx="4" fill="${col}"/><rect x="66" y="36" width="8" height="13" rx="4" fill="${col}"/>`;

Draw eight hairstyles and six accessories. For each, also give me a one-word display
name — they are listed in a look editor the player scrolls through.

  hair:  afro · braids · locs · mohawk · shaved-with-a-part · pixie · long-curly ·
         high-ponytail
  accessory: beanie · bandana · eyepatch · round-glasses · big-hoop-earrings ·
             face-paint-stripe

Return them as switch cases in the same shape as above, each with its name in a
trailing comment.
````

---

## 7 · Rooms

````
Batch 7 of 8: four new practice rooms.

Each room is the wall drawn behind the band. Signature: `r => `…`` where r is that
room's own three-colour palette: r[0] wall, r[1] prop, r[2] highlight. Use ONLY
those three — no other colour, no PAL token.

viewBox 0 0 100 100, but it is stretched with preserveAspectRatio="none" and lands
about 10% wider than tall on a phone.

  RECTANGLES AND LINES ONLY. Nothing that has to stay round — a circle becomes an
  egg. The existing rooms use one ellipse for a rug, which is fine because a
  squashed rug still reads as a rug.

  EVERYTHING LIVES ABOVE y = 50. The band's feet land at about y = 40 and the game's
  bottom half is UI. Nothing solid may hang below the floor line, which is drawn at
  y = 40 as the first path in every room.

  It is a backdrop, not a competitor: the whole layer renders at 82% opacity behind
  four characters. Keep shapes large and few. The first version of one room had
  props the size of the band's heads and had to be redrawn smaller.

The real Bedroom Studio, to imitate exactly:

  r => `<path d="M0 40 H100" stroke="${r[0]}" stroke-width="1.2"/>
    <rect x="62" y="8" width="20" height="15" fill="${r[1]}"/>
    <rect x="65" y="11" width="14" height="6" fill="${r[2]}" opacity=".5"/>
    <path d="M65 20 H79" stroke="${r[2]}" stroke-width="1" opacity=".7"/>
    <rect x="6" y="28" width="30" height="2.4" fill="${r[1]}"/>
    <path d="M8 30 V40 M34 30 V40" stroke="${r[1]}" stroke-width="1.4"/>
    <rect x="10" y="22" width="6" height="6" fill="${r[1]}"/>
    <rect x="26" y="22" width="6" height="6" fill="${r[1]}"/>
    <ellipse cx="13" cy="25" rx="1.8" ry="1.8" fill="${r[2]}" opacity=".6"/>
    <ellipse cx="29" cy="25" rx="1.8" ry="1.8" fill="${r[2]}" opacity=".6"/>
    <ellipse cx="55" cy="42" rx="34" ry="5" fill="${r[1]}" opacity=".55"/>`,

Draw these four, and for each also give me its three-colour palette as
r:['#wall','#prop','#highlight'] — all three dark, in one family, readable at 82%
opacity on a near-black ground:

  Basement       low ceiling pipes, a boiler, a small high window
  Warehouse      roller shutter, stacked pallets, a hanging work lamp
  Beach Shack    slatted wall, an open shutter, hanging lights on a wire
  Radio Station  ON AIR sign, a window into a booth, a wall of small racks
````

---

## 8 · Genre badge colours

````
Batch 8 of 8: colours, not drawings.

Sixteen music genres each carry one badge colour. They appear as small text chips
side by side, so they have to be told apart at a glance in a row.

Two hard requirements:
  every colour must reach at least 3:1 contrast against the app ground #0B0D12
  none may exactly reuse a reserved accent: #FF5364, #20D6C7, #FFC247, #8C6CFF

The genres, in order:
  indie rock, hyperpop, trap, synthwave, garage punk, dream pop, drill, disco,
  shoegaze, afrobeats, metal, lo-fi, house, reggaeton, folk, k-pop

Give me sixteen hex values with the genre name and the measured contrast ratio
against #0B0D12 for each, as a plain list. Aim for hues that are distinguishable
from their immediate neighbours in the list, since they are often shown adjacent.
````

---

## What I do with the replies

Paste a batch's reply back to me and I will:

1. Drop the entries into the right table in `index.html`.
2. Run `anchor.js` — it measures the bob bounding box for every instrument
   archetype, and all five of a role must resolve to one identical box. That is what
   catches a headstock outside the contract.
3. Run the room harness, which measures every shape's bounding box and fails if
   anything solid hangs below the floor line.
4. Run the full suite and tell you what passed.

If a batch comes back with a broken anchor or an out-of-box coordinate, I will fix
it in place rather than sending it back — it is usually a few units.
