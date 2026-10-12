import {defineQuery} from 'next-sanity'

export const JOURNAL_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)]
    | order(publishedAt desc, title asc) {
      "slug": slug.current,
      title,
      "category": coalesce(category, categories[0]->title, "Blog post"),
      tags,
      publishedAt,
      summary,
      externalUrl,
      "cover": mainImage.asset->url,
      body[]{
        ...,
        _type == "image" => {
          ...,
          "imageUrl": asset->url
        }
      },
      "gallery": gallery[]{
        "src": image.asset->url,
        alt,
        layout
      }
    }
`)
