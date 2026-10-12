This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Sanity content

The embedded Sanity Studio is available at `/studio`. Create **Project**,
**Archive item**, and **Post** documents there to manage the project index,
archive gallery, and journal. Journal posts use Portable Text for rich content,
and archive/project images are uploaded to Sanity.

Published documents replace local entries with the same slug. Existing local
content remains visible as a fallback until it is migrated; new Sanity entries
are added to the site automatically.

The default Sanity project is `de6gdkw7` with the `production` dataset. Override
these defaults with `NEXT_PUBLIC_SANITY_PROJECT_ID` and
`NEXT_PUBLIC_SANITY_DATASET` when needed. Project, archive, and journal routes
use 60-second incremental revalidation. Log in to the Sanity CLI, then allow
the local and production Studio origins:

```bash
npx sanity login
npx sanity cors add http://localhost:3000 --project-id de6gdkw7 --credentials
npx sanity cors add https://portfolio-demo-reel.vercel.app --project-id de6gdkw7 --credentials
```

Create content in Studio using the **Projects**, **Archive**, and **Posts**
sections. Each new document needs a title and slug; publish it to make it
available on the site.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
