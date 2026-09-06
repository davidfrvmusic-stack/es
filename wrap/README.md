# Chart Breaker — Android wrapper

**The game is still one `index.html` with no build step.** This folder exists only to put
that file inside an APK. Nothing here transforms, bundles or minifies it — `copy.js` is a
single `copyFileSync`.

## Build it

You need a JDK 17+ and the Android SDK (Android Studio installs both). Then:

```
cd wrap
npm install
npm run apk        # -> android/app/build/outputs/apk/debug/app-debug.apk
```

Push it to a phone with `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`,
or just copy the APK over and tap it (you will have to allow install from unknown sources).

That debug APK is signed with the throwaway debug key. It runs on any device and is the
right thing for testing. **It cannot go to Play** — that needs a release bundle signed with
your own key.

## Release bundle, for Play

```
keytool -genkey -v -keystore chartbreaker.jks -alias chartbreaker \
  -keyalg RSA -keysize 2048 -validity 10000
cp android/keystore.properties.example android/keystore.properties   # then fill it in
npm run bundle     # -> android/app/build/outputs/bundle/release/app-release.aab
```

**Back up `chartbreaker.jks` and its passwords somewhere you will still have in five
years.** Play ties your app's identity to that key. Lose it and you can never publish an
update to this listing again — you would have to ship a new app with a new package name and
leave every installed player behind. `.gitignore` keeps the key and `keystore.properties`
out of the repo; that is deliberate, not an oversight.

## What was changed from Capacitor's default template, and why

| change | why |
|---|---|
| `colors.xml` added | the template's theme referenced `@color/colorPrimary` and friends without defining them anywhere, which does not compile. They are the game's own Concert Neon values now. |
| `screenOrientation="portrait"` | the game is portrait-only and says so in its own manifest |
| `compileSdk`/`targetSdk` 34 → 35 | Play rejects new uploads below the current target-API floor |
| AGP 8.2.1 → 8.7.2, Gradle 8.2.1 → 8.11.1 | `compileSdk 35` needs AGP 8.6+, and AGP 8.7 needs Gradle 8.9+. All three move together or none do. |
| `google-services` plugin removed | it was in the template for Firebase push. There is no Firebase, no account and no network here, so it was a Google dependency for a feature that does not exist. |
| window background → `#0B0D12` | so there is no white flash under the web view on resume or rotate |
| launcher icons + splash regenerated | `icons.js` draws them from the **same shape `index.html` builds its PWA icon from**, so the installed app and a home-screen shortcut cannot drift apart |
| release signing config | reads `keystore.properties` if it exists, and stays unsigned if it does not — so a debug build works with no setup |

Re-run `node icons.js` if the mark ever changes. It writes PNGs into the Android project
only; no image file enters the game's own folder, where the single-file rule still holds.

## Still yours to do, in Play Console

- **Privacy policy URL** — required for every listing, and needs to be hosted somewhere.
  The honest text is short: this app collects nothing, sends nothing and has no accounts.
- **Data safety form** — answer "no data collected". The test suite asserts the shipped file
  contains no `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource` or any
  `http(s)://` URL at all, so that answer is checkable rather than a claim.
- **Content rating questionnaire** — the loot-box question is already satisfied: the crate
  odds and the pity counter are published on the card *before* the purchase, and crates are
  bought with an earned currency, not money.
- **Store listing** — `store/playstore-icon-512.png` is generated here. You still need a
  1024×500 feature graphic and at least two phone screenshots.

## One thing to decide before you ship

`AndroidManifest.xml` still declares `android.permission.INTERNET`, which is Capacitor's
template default. **This game makes no network requests**, and Capacitor serves the page
through a local asset loader rather than the network, so removing that line very likely
works — and shipping without it is the strongest possible version of the Data safety
answer. It is left in because it could not be tested on a device from where this was set
up. Try removing it, build, and run the game through a session, a gig and a reload; if
everything works, ship it removed.

## If you ever add a checkout

In-app digital goods on Play **must** use Google Play Billing — Stripe and friends are a
policy violation there. `checkout()` in `index.html` (§14 of CLAUDE.md) is deliberately
provider-agnostic for exactly this reason; wire it to the Play Billing library, not to a
web payment sheet.
