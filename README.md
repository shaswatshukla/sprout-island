# 🌱 Sprout Island

A tablet-first learning game for children aged 4–10. Five short mini-games teach early maths, reading and logic. Pip the sprout reads every instruction aloud, kids collect stars and stickers, and the difficulty adapts to each child.

**Play it:** https://shaswatshukla.github.io/sprout-island/

## Games

| Game | Ages 4–6 | Ages 7–10 |
|---|---|---|
| 🫧 Bubble Pop | Counting 1–10, number recognition | + / − within 20 and 100, 2/5/10 times tables |
| 🌷 Letter Garden | Starting letters, lowercase ↔ capitals | Spell 3–5 letter words from tiles |
| 🦓 Memory Safari | Animal pairs, number ↔ dots | Picture ↔ word |
| 🔷 Shape Factory | Shapes to shadows, colour + shape | Colour + shape, halves and quarters |
| 🚂 Pattern Train | AB, ABC and growing patterns | Sequences +2, +5, ×2 |

## How difficulty adapts

`src/engine/adaptive.ts` is a pure module that tracks the last 8 answers per child per game:

- ≥ 85% correct with no hints → next level (3 levels per age band)
- < 50% correct → previous level, and the next item gets fewer choices plus a visual hint
- 2 mastered level-3 rounds in a row → a 4–6 player is offered 7–10 content

## Privacy

No accounts, no backend, no analytics, no ads, no network calls. Profiles and progress stay in the browser's `localStorage` on the device. Grown-ups can see progress, toggle sound and reset a profile behind a hold-and-solve parent gate.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest: engine + game generator checks
npm run build    # type-check + production build to dist/
```

Every push to `main` runs the tests, builds, and publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves.

Stack: Vite, React 18, TypeScript, plain CSS. Sound uses the Web Audio API; spoken instructions use the browser's Speech Synthesis.
