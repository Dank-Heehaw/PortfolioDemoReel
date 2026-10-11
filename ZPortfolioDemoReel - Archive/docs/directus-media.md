# Directus media (free hosting)

Editors **upload images and video in Directus**. The Next.js site never needs those
files on disk or in Git. It reads public URLs:

```
{DIRECTUS_URL}/assets/{file-id}
```

Example: `http://localhost:8055/assets/a1b2c3d4-...`

Bytes sit in Directus storage:

| Environment | Where the file bytes live |
|---|---|
| Local Docker (default) | Docker volume `directus_uploads` — fine for trying the CMS |
| Production | **Cloudflare R2** (S3-compatible, generous free tier) |

Do **not** use Git LFS. Do **not** commit `public/projects/Ford` (and similar) folders.

Login and Docker: **[directus.md](./directus.md)**. Field list: **[directus-content-model.md](./directus-content-model.md)**.

---

## How the site consumes a file

1. Next.js (`src/app/[[...slug]]/page.js`) calls `loadCmsPayload()` on the server
   with `DIRECTUS_URL` + `DIRECTUS_TOKEN`.
2. `src/lib/cms/directus.js` maps file fields (`cover`, `hero`, `video_file`,
   `gallery_files`, …) to `{DIRECTUS_ASSETS_URL or DIRECTUS_URL}/assets/{id}`.
3. That JSON is injected into the page. The browser loads `<img>` / `<video>` from
   those URLs. The API token is **not** sent with image requests, so **Public**
   must be allowed to read `directus_files` (`npm run cms:schema` grants this).

Until Directus has published items, the site falls back to `content/projects/*.js`
(copy only). Those local modules may still name files; the binaries are **not**
in Git. Upload the same assets in Directus for a working production site.

---

## Upload a project thumbnail or video

1. `npm run cms:up` then open http://localhost:8055 (`admin@localhost` / `admin12345`).
2. `npm run cms:schema` (once) so `cover`, `video_file`, `gallery_files`, and public read exist.
3. **Content → projects → Create Item** (or open an existing project).
4. **Cover** — click the field, upload a JPG/PNG/WebP. This is the MORE WORK hover thumbnail.
5. **Hero** — optional wider image for the case-study page.
6. **Video file** — upload `.mp4` / `.webm`. **Video poster** — still frame.
7. **Gallery files** — add as many images as you want (File Library picker).
8. Set **Status** to **Published**, save.
9. Refresh http://127.0.0.1:3000 (or wait up to `CMS_REVALIDATE` seconds).

The File Library (**Settings → File Library**, or the folder icon) is the same
pool of files. You can upload once and reuse on journal / archive items.

---

## Production: Cloudflare R2 (free tier)

R2 is S3-compatible object storage. [Current free tier](https://developers.cloudflare.com/r2/pricing/)
(confirm on Cloudflare): **10 GB** stored, **1 million** Class B reads/month, **no egress fees**.
That is enough for a portfolio of images plus a few videos.

Directus talks to R2; visitors still hit `{your-directus}/assets/{id}`. Directus
streams the object. You do not paste R2 URLs into content.

### Sign up and bucket

1. Create a free [Cloudflare](https://dash.cloudflare.com/sign-up) account.
2. **R2** → **Create bucket** (e.g. `portfolio-media`). Leave it private; Directus
   uses the S3 API with keys. Public bucket access is not required.
3. **R2** → **Manage R2 API Tokens** → **Create API token**.
   - Permission: **Object Read & Write** on that bucket.
   - Copy **Access Key ID**, **Secret Access Key**, and the **S3 endpoint**
     `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (no trailing slash, no bucket
     name on the path).

### Directus env (same names in `.env` and on the hosted Directus)

```
STORAGE_LOCATIONS=r2
STORAGE_R2_DRIVER=s3
STORAGE_R2_KEY=<access key id>
STORAGE_R2_SECRET=<secret access key>
STORAGE_R2_BUCKET=portfolio-media
STORAGE_R2_REGION=auto
STORAGE_R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
STORAGE_R2_FORCE_PATH_STYLE=true
```

Local Docker already reads these from `.env` (`docker-compose.yml`). After saving:

```powershell
npm run cms:down
npm run cms:up
```

New uploads go to R2. Files already in the local Docker volume stay there until
you re-upload them in the File Library.

**Never commit** the access key or secret. `.env` is gitignored.

### Next.js / Vercel

The portfolio only needs the **public Directus URL**, not R2 keys.

| Variable | Where | Example |
|---|---|---|
| `DIRECTUS_URL` | `.env` and Vercel | `https://cms.example.com` |
| `DIRECTUS_TOKEN` | `.env` and Vercel | read-only static token |
| `DIRECTUS_ASSETS_URL` | optional | same as `DIRECTUS_URL` unless assets are on another origin |
| `CMS_REVALIDATE` | optional | `60` |

Do not put `STORAGE_R2_*`, `ADMIN_PASSWORD`, or `BLOB_READ_WRITE_TOKEN` on Vercel
unless Vercel is also running Directus (it is not).

Production Directus must be a URL the internet can reach (Directus Cloud, or
Directus on any always-on host with the R2 env vars). Laptop-only Docker is not
visible to Vercel.

---

## Directus Cloud (optional)

If you use [Directus Cloud](https://directus.cloud/) instead of Docker in
production, files are stored on that project. Set `DIRECTUS_URL` to
`https://<project>.directus.app`, create a read token, run `npm run cms:schema`
against that URL, and upload in that dashboard. Check Cloud’s current free/trial
limits; **R2 + self-hosted Directus** is the durable zero-cost file path.

---

## Env vars (complete)

**Next.js (this repo)**

| Variable | Purpose |
|---|---|
| `DIRECTUS_URL` | CMS API origin |
| `DIRECTUS_TOKEN` | Server-side fetch of collections |
| `DIRECTUS_ASSETS_URL` | Optional override for `/assets/{id}` origin |
| `CMS_REVALIDATE` | ISR seconds (default 60) |

**Directus process (Docker / hosted CMS)**

| Variable | Purpose |
|---|---|
| `STORAGE_LOCATIONS` | `local` (default) or `r2` |
| `STORAGE_R2_KEY` / `SECRET` / `BUCKET` / `ENDPOINT` / `REGION` | R2 S3 API |
| `MAX_PAYLOAD_SIZE` | Allow large video (Compose default `1024mb`) |
| `PUBLIC_URL` | Must match the URL you open in the browser |

---

## Remaining signup steps (checklist)

- [ ] Cloudflare account + R2 bucket + API token
- [ ] Paste `STORAGE_R2_*` into `.env` (local) and into **hosted Directus** env
- [ ] Set `STORAGE_LOCATIONS=r2` and restart Directus
- [ ] Host Directus somewhere public for Vercel (or Directus Cloud)
- [ ] Vercel: `DIRECTUS_URL` + `DIRECTUS_TOKEN` only
- [ ] `npm run cms:schema` against that Directus
- [ ] Upload cover/video/gallery in Content → projects
- [ ] Publish items; confirm `{DIRECTUS_URL}/assets/{id}` opens in a private window
