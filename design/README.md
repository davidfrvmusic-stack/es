# Design canvas sources

The warm-palette visual overhaul for Chart Breaker. Each `.dc.html` is one artboard;
`canvas.json` positions them. `chart-breaker-overhaul.html` is the assembled canvas —
a build output, gitignored, re-cut from these files.

| file | artboard |
|---|---|
| `Main.dc.html` | main gameplay screen (idle dock) |
| `Writing.dc.html` | writing session card picker |
| `Release.dc.html` | release reveal |
| `BandTab.dc.html` | band tab, full page |
| `Characters.dc.html` | the four members with their instruments |
| `GearIcons.dc.html` | gear icon set + rarity frames |

Palette: cream `#FFF3E2`, panel `#FFFAF0`, ink `#2C1D16`, coral `#FF5A45` / `#D93A26`,
yellow `#FFC22E` / `#E39A00`, teal `#12A79C` / `#0B7A72`, warm border `#EBD9BE`.
Type: Bricolage Grotesque (display) over Archivo (UI).

Screens mirror the shipped `index.html` — 390x844, real dock states, card and slot
anatomy, real copy and numbers. Not yet implemented in the game.
