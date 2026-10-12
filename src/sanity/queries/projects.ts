import {defineQuery} from 'next-sanity'

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)]
    | order(coalesce(sort, 9999) asc, year desc, title asc) {
      "slug": slug.current,
      title,
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
      "hero": hero.asset->url,
      "devices": devices[]{
        "src": image.asset->url,
        label
      },
      "video": select(
        defined(video.src) => {
          "src": video.src,
          "poster": video.poster.asset->url,
          "label": video.label
        },
        null
      ),
      "gallery": gallery[]{
        "src": image.asset->url,
        alt,
        layout
      }
    }
`)
