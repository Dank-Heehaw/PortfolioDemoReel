# Project media + case studies

Case-study **copy** can live in `content/projects/{slug}.js` as a fallback.
**Images and video belong in Directus**, not this folder.

1. Upload cover / gallery / video in Directus (Content → projects).
2. The site reads `{DIRECTUS_URL}/assets/{file-id}`.
3. Production file bytes: Cloudflare R2 — see `docs/directus-media.md`.

Do not git-add `Ford`, `Hypedocs`, `Icons`, `NatureCycle`, or `*.mp4`.
You can delete local copies after they are in the CMS File Library.
