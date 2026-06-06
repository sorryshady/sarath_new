# Sarath Menon Portfolio

## Dependencies

Use the project npm wrapper to avoid Cursor/sandbox `devdir` warnings and keep install output clean:

```bash
npm run setup          # install (preferred over raw npm install)
npm run npm -- install # explicit wrapper
npm run npm -- audit   # audit without devdir noise
```

Direct `npm install` may show `Unknown env config "devdir"` when run inside Cursor — that comes from the sandbox injecting `npm_config_devdir`, not this project.

## Overrides

- `uuid` pinned to v11 via npm overrides (Sanity transitive deps)
- `jsdom` pinned to v29 (drops deprecated `whatwg-encoding`)
- `react-use` removed (replaced with `src/hooks/useMedia.ts`) — fixes high-severity `js-cookie` advisory

Remaining moderate audit findings are in Sanity/Next transitive deps; fixing them requires breaking downgrades (`npm audit fix --force` is not safe).
