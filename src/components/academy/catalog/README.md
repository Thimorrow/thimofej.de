# Academy catalog snapshot

The demo uses the HTML class/state contracts from `academy-design/base/components/`.
`CatalogParts.tsx` and `AcademyDemo.tsx` bind those contracts to React state.

`catalog.css` is generated from the original component style blocks and their
include dependencies, with Academy runtime tokens, heading rules and font assets.
CSS is scoped to `.academy-modules`; token values are preserved. The app's Tailwind
utility mapping is excluded because this site has its own Tailwind build.

Regenerate explicitly from the portfolio root:

```sh
node scripts/sync-academy-catalog.mjs
```

An optional first argument supplies another academy-design checkout path.
The source checkout and its Experts sibling are only read. Production builds use
this snapshot and do not need those checkouts. `manifest.json` records source
headers, revision, checksums and the three catalog quality-note refinements.
`academy-demo.css` contains the embedding layout and those documented refinements.

After importing, run `npm test`, `npm run lint`, and `npm run build`, then inspect
light/dark modes at desktop and 375px and exercise the mission flow and exports.
