# pénte · Omar Ahallal

Omar Ahallal's site: a photographer and videographer in Morocco. Seven chapters of his work, his services, About, and a contact form.

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
- **Content: `src/lib/content/site.json`.** It is the publish job's contract. The job reads Omar's published chapters from the admin, sizes the photos, writes this file, and builds and deploys the site. Until his first Publish it holds sample content made from his photos (`"sample": true`).
- **Contact** writes to the admin's Messages through Supabase. The publishable key can only add a message there, and the database limits how many can arrive. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`).
- **Hosting: GitHub Pages.** `404.html` shows Frame 404 for any unknown address. `BASE_PATH` serves the site under a project path.

## Changed from board O-08

O-08 planned React Router on Netlify, with Netlify Forms for contact. The admin (Svelte, Supabase) came later. So this site uses:
- **SvelteKit,** to share its viewer and parts with the admin;
- **Supabase Messages** in place of Netlify Forms;
- **GitHub Pages,** where the publish job already runs, so no extra account can lapse (O-08's own criterion A5).
