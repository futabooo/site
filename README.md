# futabooo's site

futabooo's personal site powered by [HonoX](https://github.com/honojs/honox)

## Tech Stack

- [HonoX](https://github.com/honojs/honox) - Full-stack web framework
- [Hono](https://hono.dev/) - Web framework for the Edges
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/) - Styling
- [Pagefind](https://pagefind.app/) - Static search
- [Cloudflare Workers](https://workers.cloudflare.com/) - Deployment

## Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `bun install`     | Installs dependencies                        |
| `bun run dev`     | Starts local dev server at `localhost:5173`  |
| `bun run build`   | Build your production site to `./dist/`      |
| `bun run preview` | Preview your build locally with Wrangler     |
| `bun run deploy`  | Build and deploy to Cloudflare Workers       |
