# pénte · Omar Ahallal

Omar Ahallal's site: a photographer and videographer in Morocco. Seven chapters of his work, his services, About, and a contact form.

**Live:** https://omar-ahlal.vercel.app (Vercel; pages re-read the database every 60 s, so a Publish in the admin shows within a minute)

Designed on boards O-04 to O-07 and O-12. The admin that feeds it is a separate private repository.

## Run

```sh
npm ci
npm run dev        # http://localhost:5180
npm run build      # every page prerendered into build/
npm run check      # types and Svelte
```

## How it is built

- **SvelteKit, prerendered.** Every page is real HTML, for search engines and slow phones. The image viewer is the same component as the admin's (O-12).
- **Content comes from the admin's database,** read through Supabase's API when the site is built. The publishable key reads published rows only (row-level security). Photos load from the public `published` bucket that Publish fills. No photo or chapter lives in this repository, and Omar edits everything in the admin. The words (statement, services, About) live in `src/lib/copy.ts` until the admin has screens for them.
- **Publish** in the admin starts the job that sizes the photos, rebuilds this site from the database and deploys it, so visitors get prerendered pages. Locally, `npm run build` reads whatever database `.env` points at (the admin's local stack).
- **Contact** writes to the admin's Messages through Supabase. The publishable key can only add a message there, and the database limits how many can arrive. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`).
- **Hosting: GitHub Pages.** `404.html` shows Frame 404 for any unknown address. `BASE_PATH` serves the site under a project path.

## Changed from board O-08

O-08 planned React Router on Netlify, with Netlify Forms for contact. The admin (Svelte, Supabase) came later. So this site uses:
- **SvelteKit,** to share its viewer and parts with the admin;
- **Supabase Messages** in place of Netlify Forms;
- **GitHub Pages,** where the publish job already runs, so no extra account can lapse (O-08's own criterion A5).
