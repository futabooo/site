# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

futabooo's personal site/blog, built with [HonoX](https://github.com/honojs/honox) and deployed to Cloudflare Workers.

## Commands

| Command | Action |
| :-- | :-- |
| `bun install` | Install dependencies |
| `bun run dev` | Dev server at `localhost:5173` (Vite + Cloudflare adapter via miniflare) |
| `bun run build` | Production build to `./dist/` (see pipeline below) |
| `bun run preview` | Preview the build with `wrangler dev` (local KV) |
| `bun run deploy` | Build + `wrangler deploy` (uses production KV) |
| `bunx biome check app` | Lint + format check. Add `--write` to auto-fix |
| `bun run link-cards` | Fetch OGP for bare-URL lines in blog posts, cache to `content/link-cards.json`. Add `-- --refresh` to refetch everything |

There is **no test suite** in this repo (no test runner configured).

**Node version**: managed by asdf via `.tool-versions` (`nodejs 24.14.0`). If you see `No version is set for command node`, the version isn't being picked up — commands can be run with `ASDF_NODEJS_VERSION=24.14.0 <cmd>` as a fallback.

## Build pipeline

`bun run build` runs three stages in order (breaking the first breaks hydration silently):

1. `vite build --mode client` — builds the **client bundle**: `/app/client.ts` (island hydration runtime), island chunks, and Tailwind CSS into `dist/static/`. Inputs are set by `client.input` in `vite.config.ts`.
2. `vite build` — SSG pre-render of all pages + the Cloudflare **Worker** bundle (`dist/index.js`).
3. `pagefind --site dist` — builds the static search index from the rendered HTML.

`vite.config.ts` also registers custom plugins: `copyContentAssets` (copies `content/blog/**/assets/**` into `dist`), `generateOGImages` (renders per-article OG images with satori + sharp at build end), and `servePagefind` (serves the pagefind index in dev).

## Architecture

**HonoX + SSG + Workers hybrid.** Pages are statically pre-rendered to HTML and served as Cloudflare static assets, while the Worker (`dist/index.js`, entry `app/server.ts`) runs for any path that doesn't match a static asset — this is how runtime API routes work. File-based routing lives in `app/routes/`.

**Content loading is build-time.** `app/lib/blog.ts` loads every `content/blog/**/index.md` via `import.meta.glob({ eager: true })`, so all posts are **inlined into the Worker bundle**. This means `allPosts` / `getPostById` are available at runtime without filesystem access — safe to call from Worker API routes. Each article is validated against a Zod schema (`blogPostMetaDataSchema`): `tags` requires ≥1 entry, and if `eyeCatchImg` is set then `eyeCatchAlt` is required. By contrast `app/lib/about.ts` reads `content/about/about-cv.md` via `node:fs` and only works at SSG/dev time.

**Bare-URL lines become link cards.** `marked.parse` in `app/lib/blog.ts` is synchronous and runs at module load, so OGP can't be fetched during the build itself. Instead a line that's just a URL (nothing else in the paragraph, not `[text](url)`, not inside a list) is rendered as a card (`.rlc-*` classes in `app/style.css`) using metadata pre-fetched into `content/link-cards.json` by `scripts/fetch-link-cards.ts` — run `bun run link-cards` after adding one and commit the updated JSON. A URL with no cache entry just renders as a normal link. Detection logic lives in `app/lib/link-card.ts` (`getBareLinkHref`), shared by both the fetch script and the marked renderer override.

**Routes that touch the filesystem only work in dev.** `app/routes/blog/[slug]/assets/[filename].tsx` reads files via `node:fs`; in production those assets are served statically from `dist` (copied by the build plugin). Don't rely on fs in routes that need to run in the deployed Worker.

**Static vs. runtime routes.** Pages use `ssgParams` (e.g. `app/routes/blog/[slug].tsx`) to enumerate slugs for pre-rendering. A dynamic route **without** `ssgParams` (e.g. `app/routes/api/likes/[slug].ts`) is not pre-rendered and instead runs in the Worker at request time. Follow HonoX conventions: `export default createRoute(...)` handles GET, `export const POST = createRoute(...)` handles other methods.

**Islands (client interactivity).** Interactive components go in `app/islands/` as default exports using `hono/jsx` hooks; they render server-side with a `<honox-island>` marker and are hydrated by `app/client.ts` (`createClient()`). **Gotcha:** islands only hydrate if `/app/client.ts` is included in `client.input` in `vite.config.ts`. Some interactive bits (Search, ThemeChange) are instead plain inline `<script>` in components rather than islands.

**Cloudflare bindings.** Declared in `wrangler.jsonc` and typed in `app/global.d.ts` under `interface Env { Bindings }`. The `LIKES` KV namespace stores per-article like/clap counts (key `likes:{slug}`), accessed via `c.env.LIKES`. KV is eventually consistent with ~1 write/sec per key; like writes are debounced client-side. KV namespace IDs in `wrangler.jsonc` are resource identifiers, not secrets (safe to commit). Two namespaces exist: `id` (production, used by `deploy`) and `preview_id` (local/`wrangler dev`).

## Conventions

- **Path aliases**: `@components/*` → `app/components/*.tsx`, `@layouts/*` → `app/layouts/*.tsx`.
- **Styling**: Tailwind CSS v4 + daisyUI. Global styles in `app/style.css`; article body uses `@tailwindcss/typography` (`prose`).
- **JSX runtime**: `hono/jsx` (server) / `hono/jsx/dom` (islands). Use `class=`, not `className=`.
- **Formatting (Biome)**: single quotes (incl. JSX), no semicolons, es5 trailing commas, 80-col, 2-space indent. Imports are auto-organized — keep them sorted.

## Adding a blog post

Create `content/blog/YYYY-MM-DD-slug/index.md` with frontmatter (`title`, `description`, `tags`, `pubDate`; optional `updatedDate`, `eyeCatchImg`+`eyeCatchAlt`). Place images in that folder's `assets/` and reference them as `./assets/foo.png` (rewritten to `/blog/{slug}/assets/foo.png` at render). The slug is the directory name; OG images are generated automatically at build time. If the post has a line that's just a URL, run `bun run link-cards` and commit the resulting `content/link-cards.json` change so it renders as a link card instead of a plain link.
