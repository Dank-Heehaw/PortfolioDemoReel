export const projectsQuery = /* groq */ `
  *[_type == "project"] | order(sort asc) {
    title,
    "slug": slug.current,
    category,
    role,
    year,
    tags,
    summary,
    body,
    featured,
    moreWork,
    sort,
    "cover": cover.asset->url,
    "hero": coalesce(hero.asset->url, cover.asset->url),
    devices[]{
      label,
      "src": image.asset->url
    },
    video{
      label,
      "src": file.asset->url,
      "poster": poster.asset->url
    },
    gallery[]{
      alt,
      layout,
      "src": image.asset->url
    }
  }
`;

export const journalQuery = /* groq */ `
  *[_type == "journalPost"] | order(date desc) {
    "slug": slug.current,
    title,
    category,
    tags,
    date,
    "cover": cover.asset->url,
    externalUrl,
    summary,
    body,
    gallery[]{
      alt,
      layout,
      "src": image.asset->url
    }
  }
`;

export const archiveQuery = /* groq */ `
  *[_type == "archiveImage"] | order(_createdAt desc) {
    "slug": _id,
    "title": coalesce(alt, "Archive"),
    category,
    medium,
    year,
    "cover": image.asset->url
  }
`;

export const siteMarksQuery = /* groq */ `
  *[_id == "siteSettings"][0]{
    "logo": logo.asset->url,
    "logoHover": logoHover.asset->url,
    "logoMenu": logoMenu.asset->url
  }
`;
