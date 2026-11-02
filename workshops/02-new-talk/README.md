# Workshop 02, New Talk

## Run locally

```bash
pnpm --filter ./workshops/02-new-talk dev
```

## Build / export

```bash
pnpm --filter ./workshops/02-new-talk build       # static site -> dist/
pnpm --filter ./workshops/02-new-talk export      # PDF
```

## Structure

- `slides.md`, the deck (edit this)
- `snippets/`, code samples the deck imports
- `public/img/`, workshop-specific images
- `public/brand/`, NYUAD lockup (mirrored from theme/public/brand/)
- `exercises/`, hands-on exercises that pair with the deck
- `components/`, workshop-specific Vue components (optional)

See `theme/README.md` at the repo root for the full theme reference (layouts, components, tokens).
