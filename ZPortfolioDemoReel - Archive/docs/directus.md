# Directus CMS (local login)

This portfolio uses **Directus** as the CMS for work/projects (including the MORE WORK list and cover thumbnails), journal, work categories, and archive.

You do **not** need Directus Cloud. Run it on your machine with Docker.

Without Directus running, the Next.js site still works from the files in `content/` and `src/data/`.

---

## Login (local defaults)

These values are committed in `.env.example` as **local-dev only**. They are not production secrets.

| | |
|---|---|
| **Admin URL** | http://localhost:8055 |
| **Email** | `admin@localhost` |
| **Password** | `admin12345` |
| **API token** (for Next.js) | `portfolio-local-dev-token` |

The Next app reads the same token via `DIRECTUS_URL` + `DIRECTUS_TOKEN`.

**Use `http://localhost:8055`, not `127.0.0.1`, and not port 3000.** Port 3000 is the portfolio site.

---

## 1. One-time prerequisites (Windows)

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) and **start it**. Wait until the whale icon in the system tray is idle (not “Starting…”).
2. **Close and reopen PowerShell** (or reboot) so the `docker` command is on your PATH. If you see `'docker' is not recognized`, Docker is not installed or this terminal is stale.
3. In this repo, copy the example env file (PowerShell):

```powershell
cd F:\Projects\Web\PortfolioDemoReel
Copy-Item .env.example .env
```

`.env` is gitignored. Do not commit it.

Open `.env` and confirm these lines exist (they already do if you copied the example):

```
ADMIN_EMAIL=admin@localhost
ADMIN_PASSWORD=admin12345
ADMIN_TOKEN=portfolio-local-dev-token
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=portfolio-local-dev-token
PUBLIC_URL=http://localhost:8055
```

`ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_TOKEN` are how the **first** admin user is created. If they are missing, Directus boots with **no login** and shows a “create project” screen instead.

---

## 2. Start Directus (preferred: Docker Compose)

From the repo root, PowerShell:

```powershell
npm run cms:up
```

That runs `docker compose up -d`. First boot can take 30–60 seconds while Postgres and Directus initialize.

Check it is healthy:

```powershell
docker compose ps
```

`directus` should be `healthy` (or at least `running`). If it is still `starting`, wait and run `npm run cms:logs`.

When it is up, open **http://localhost:8055** and sign in with:

- Email: `admin@localhost`
- Password: `admin12345`

Then create the collections this site expects:

```powershell
npm run cms:schema
```

---

## 3. Point the Next.js app at Directus

`.env` already has `DIRECTUS_URL` and `DIRECTUS_TOKEN` if you copied `.env.example`.

Restart the site:

```powershell
npm run dev
```

The portfolio is **http://127.0.0.1:3000**. Directus stays at **http://localhost:8055**.

---

## 4. Create a static API token (if you need a new one)

On **first boot**, `ADMIN_TOKEN` in `.env` already creates the token `portfolio-local-dev-token`. Next.js can use it immediately — you do not have to generate one in the UI.

To create or rotate a token later:

1. Open http://localhost:8055 and log in.
2. Click your **avatar** (bottom left) → **User Directory** (or **Settings → User Directory**).
3. Open the **Administrator** user (`admin@localhost`).
4. Find **Token** → **Generate** (or paste your own string).
5. Copy the token into `.env` as `DIRECTUS_TOKEN=...`
6. Restart Next: stop `npm run dev` and start it again.

Do not put that token in git. Production should use a **read-only** role, not the admin user.

---

## 5. Forgot the password / already have a volume

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are applied **only when the database is empty**. If you ran Directus before, Docker still has a volume and **changing `.env` will not change the login**.

### Option A — reset password, keep content

```powershell
npm run cms:passwd
```

That runs:

```powershell
docker compose exec directus directus users passwd --email admin@localhost --password admin12345
```

Then log in at http://localhost:8055 with `admin@localhost` / `admin12345`.

If you used a different admin email last time, pass that email:

```powershell
docker compose exec directus directus users passwd --email YOUR_OLD_EMAIL --password admin12345
```

### Option B — wipe the CMS and recreate the known admin (recommended if you could not get in last time)

This deletes Directus data (projects you entered in the CMS), not your git repo or `public/` images.

```powershell
npm run cms:reset
npm run cms:schema
```

Wait until `docker compose ps` shows Directus healthy, then log in with the defaults above.

---

## 6. Next.js env vars

| Variable | Required | What it is |
|---|---|---|
| `DIRECTUS_URL` | Yes, to use the CMS | `http://localhost:8055` locally |
| `DIRECTUS_TOKEN` | Yes unless collections are public | Same as `ADMIN_TOKEN` on first boot |
| `DIRECTUS_ASSETS_URL` | No | Override origin for `/assets/{id}` (defaults to `DIRECTUS_URL`) |
| `CMS_REVALIDATE` | No | Cache Directus fetches, seconds (default `60`) |

Directus-only (Compose / first boot):

| Variable | Local default |
|---|---|
| `ADMIN_EMAIL` | `admin@localhost` |
| `ADMIN_PASSWORD` | `admin12345` |
| `ADMIN_TOKEN` | `portfolio-local-dev-token` |
| `PUBLIC_URL` | `http://localhost:8055` |

On Vercel, set only `DIRECTUS_URL` (your hosted Directus URL) and `DIRECTUS_TOKEN`. Do not set `ADMIN_*` on Vercel.

---

## 7. Add a project (MORE WORK + hover thumbnail)

1. Log in at http://localhost:8055.
2. **Content → projects → Create Item**.
3. Fill `slug`, `title`, `category`, `year`.
4. Upload `cover` (MORE WORK hover thumbnail). Optional: `hero`, `video_file`, `video_poster`, `gallery_files`.
5. Turn on `more_work` to include it in the MORE WORK list (default for case studies is already “yes”).
6. Turn on `featured` if it should be treated as featured.
7. Set **Status** to **Published**.
8. Save. Refresh the site (or wait up to `CMS_REVALIDATE` seconds).

Images are public `{DIRECTUS_URL}/assets/{id}` URLs. Production storage (Cloudflare R2): **[directus-media.md](./directus-media.md)**.

Collections and field lists: [directus-content-model.md](./directus-content-model.md).

CMS items **override local files with the same slug** and add any new slugs. Empty Directus collections leave the local `content/projects` fallback in place.

---

## Alternative: `npx` without Docker (not recommended)

Docker is the path that sets admin email/password for you. `npx` is interactive and easy to end up with no admin user.

```powershell
npx create-directus-project .\directus-app
```

When prompted:

- Database: SQLite is fine for trying it locally.
- Admin email / password: use `admin@localhost` / `admin12345` so the README still matches.

Then start that project from its folder (`npx directus start`) and set in **this** repo’s `.env`:

```
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=<token you generate in the Directus user screen>
```

There is no `ADMIN_TOKEN` unless you add it to that project’s own `.env` **before the first bootstrap**. If you already started it once, generate a token in the UI instead.

---

## If you still cannot log in

| What you see | Likely cause | Fix |
|---|---|---|
| `'docker' is not recognized` | Docker Desktop missing, not running, or old terminal | Install/start Docker Desktop, then **open a new PowerShell** |
| Browser error / connection refused | Directus is not running, or Docker Desktop is not started | Start Docker Desktop, then `npm run cms:up`. Wait for healthy. |
| Login page on **port 3000** | That is the Next.js site, not Directus | Open http://localhost:8055 |
| `127.0.0.1:8055` looks blank or odd | `PUBLIC_URL` is `http://localhost:8055` | Use http://localhost:8055 |
| “Create project” / onboarding, no login form | `ADMIN_EMAIL` / `ADMIN_PASSWORD` were missing on first boot | Copy `.env.example` → `.env`, then `npm run cms:reset` |
| “Wrong email or password” | Old Docker volume; env vars no longer apply | `npm run cms:passwd` or `npm run cms:reset` |
| 401 from `npm run cms:schema` | Token does not match this database | `npm run cms:reset` then `npm run cms:schema` |
| Hitting a `*.directus.app` URL | That is **Directus Cloud**, not this local stack | Local login is only http://localhost:8055 |
| CORS errors in the **browser** on API calls | `CORS_ORIGIN` not enabled | `.env` has `CORS_ORIGIN=true`; restart Compose (`npm run cms:down` then `npm run cms:up`) |
| Site works but CMS content missing | Next env empty, or items are **Draft** | Confirm `.env` `DIRECTUS_URL` / `DIRECTUS_TOKEN`, publish items, restart `npm run dev` |
| Port 8055 already in use | Another Directus / process | Stop the other app, or change `DIRECTUS_PORT` in `.env` and `DIRECTUS_URL` to match |

Useful logs:

```powershell
npm run cms:logs
```

Stop Directus (keeps data):

```powershell
npm run cms:down
```
