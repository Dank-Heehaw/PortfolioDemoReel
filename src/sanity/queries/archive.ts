import {defineQuery} from 'next-sanity'

export const ARCHIVE_ITEMS_QUERY = defineQuery(`
  *[_type == "archiveItem" && defined(slug.current)]
    | order(coalesce(sort, 9999) asc, year desc, title asc) {
      "slug": slug.current,
      title,
      category,
      medium,
      year,
      "cover": cover.asset->url
    }
`)
