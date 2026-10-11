# Directus Content Model

Login, Docker, tokens, and troubleshooting: **[directus.md](./directus.md)**.

This page is the field list. Local admin: http://localhost:8055 — `admin@localhost` / `admin12345`.

This site reads **Directus** when `DIRECTUS_URL` is set (see `.env.example`).
Without credentials, it uses the local modules under `content/` and `src/data/`.

Next.js fetches collections in `src/app/[[...slug]]/page.js` and injects JSON for
the client SPA. Tokens never ship to the browser.

## Dashboard setup

**Local Docker (preferred):** follow [directus.md](./directus.md), then run `npm run cms:schema` to create these collections.

**Hosted Directus:** create the collections below by hand (or run the schema script against that URL), then set `DIRECTUS_URL` and `DIRECTUS_TOKEN` in Vercel env vars.

## Collection: `projects`

Work / case studies. Used for `/work`, `/work/{slug}`, MORE WORK, and featured covers.

| Field | Type | Notes |
|---|---|---|
| `status` | string | `published` (default) or `draft` |
| `sort` | integer | Lower first |
| `slug` | string, unique | URL: `/work/{slug}` |
| `title` | string | |
| `category` | string | e.g. UI/UX, Branding |
| `role` | string | |
| `year` | string or integer | |
| `tags` | json or csv | |
| `summary` | text | |
| `body` | text | Case-study copy |
| `featured` | boolean | Featured / work-page emphasis |
| `more_work` | boolean | Include in MORE WORK (default: yes if the project has a case study) |
| `asset_dir` | string | Legacy only; production media is Directus files, not `public/` |
| `cover` | file | Thumbnail — upload in Directus |
| `hero` | file | Case-study hero |
| `video_file` | file | Case-study video (any type) |
| `video_poster` | file | Poster frame |
| `gallery_files` | files | Repeatable File Library attachments |
| `devices` | json | Optional `[{ "file": "<uuid>", "label": "Desktop" }]` |
| `video` | json | Legacy `{ "src", "poster", "label" }` if you paste https URLs |
| `gallery` | json | Legacy list; prefer `gallery_files` |

### Add a project

1. Content → **projects** → Create Item.
2. Fill `slug`, `title`, `category`, `year`, upload **cover**.
3. Set `featured` and/or `more_work`.
4. Upload **hero**, **video_file**, **gallery_files** as needed.
5. Save as **published**.

The Next app turns file fields into `{DIRECTUS_URL}/assets/{id}`. Put production bytes on **Cloudflare R2** ([directus-media.md](./directus-media.md)). Do not use Git LFS.

## Collection: `journal_posts`

| Field | Type |
|---|---|
| `status` | `published` / `draft` |
| `slug` | string, unique |
| `title` | string |
| `category` | string |
| `tags` | json or csv |
| `date` | date |
| `cover` | file |
| `summary` | text |
| `body` | markdown text |
| `gallery_files` | files |
| `gallery` | json (legacy) |
| `external_url` | string, optional |

## Collection: `work_categories`

Nav + work-page rails (UI/UX, Branding, Motion, Campaigns).

| Field | Type |
|---|---|
| `status` | `published` / `draft` |
| `sort` | integer |
| `key` | string | e.g. `ui-ux` |
| `label` | string |
| `meta` | string |
| `project_slug` | string | Featured project slug |
| `cover` | file, optional | Falls back to that project's cover |

## Collection: `archive_items`

- `id` (uuid, primary key)
- `slug` (string, unique)
- `title` (string, required)
- `category` (string)
- `medium` (string)
- `year` (integer or string)
- `cover` (file, Directus `directus_files` relation)
- `status` (`published` / `draft`)

## Collection: `media_blocks` (optional, archive-adjacent)

- `id` (uuid, primary key)
- `type` (enum: `weblink`, `video`, `youtube`, `spline`, `asset3d`, `epub`, `document`)
- `title` (string, required)
- `description` (text)
- `url` (string) for web links
- `embed_url` (string) for YouTube or Spline embed URL
- `file` (file, Directus `directus_files` relation) for uploads
- `file_url` (alias/computed optional, string)
- `mime_type` (string)
- `sort` (integer)
- `status` (string, e.g. `published` / `draft`)

## Recommended Validation Rules

- `youtube` requires `embed_url`
- `spline` requires `embed_url`
- `video`, `asset3d`, `epub`, `document` require `file`
- `weblink` requires `url`

## Supported File Types

- 3D: `model/gltf-binary`, `model/gltf+json`, `model/vnd.usdz+zip`, `text/plain` (`.obj`)
- EPUB: `application/epub+zip`
- Docs: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, etc.
