# Project media

Project content and uploaded image assets are managed in the Sanity Studio at
`/studio`. Imported projects are drafts until reviewed and published.

The local project catalog in `src/content/projects/framer.ts` remains the
frontend fallback until the Sanity drafts are ready to publish. Keep local media
that is still referenced by the site; videos should use hosted URLs rather than
Sanity file assets.

To import new catalog entries as drafts, authenticate the Sanity CLI and run
`npx sanity exec scripts/migrate-projects-to-sanity.ts --with-user-token -- --apply`
from the repository root. Existing project slugs are skipped.
