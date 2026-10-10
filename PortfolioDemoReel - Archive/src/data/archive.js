/** Archive — past work samples from Portfolio Sample. */
import { getCmsPayload } from "../lib/cms/store.js";

const LOCAL_ARCHIVE_POSTS = [
  { slug: "sample-01", title: "Amber Drift", category: "Graphics", medium: "Photography", year: "2024", cover: "/archive/samples/sample-01.png" },
  { slug: "sample-02", title: "Brutalist Form", category: "UX", medium: "Digital", year: "2024", cover: "/archive/samples/sample-02.jpg" },
  { slug: "sample-03", title: "Chromatic Wave", category: "ART", medium: "Collage", year: "2024", cover: "/archive/samples/sample-03.png" },
  { slug: "sample-04", title: "Dusk Portrait", category: "ART", medium: "Photography", year: "2024", cover: "/archive/samples/sample-04.png" },
  { slug: "sample-05", title: "Ember Grid", category: "Graphics", medium: "Typography", year: "2025", cover: "/archive/samples/sample-05.jpg" },
  { slug: "sample-06", title: "Fragment III", category: "3D", medium: "Mixed Media", year: "2025", cover: "/archive/samples/sample-06.png" },
  { slug: "sample-07", title: "Gilded Type", category: "ART", medium: "Typography", year: "2025", cover: "/archive/samples/sample-07.jpg" },
  { slug: "sample-08", title: "Horizon Line", category: "UX", medium: "Photography", year: "2025", cover: "/archive/samples/sample-08.jpg" },
  { slug: "sample-09", title: "Ink Wash", category: "ART", medium: "Print", year: "2025", cover: "/archive/samples/sample-09.jpg" },
  { slug: "sample-10", title: "Jasper Collage", category: "Graphics", medium: "Collage", year: "2025", cover: "/archive/samples/sample-10.jpg" },
  { slug: "sample-11", title: "Kinetic Mark", category: "UX", medium: "Digital", year: "2025", cover: "/archive/samples/sample-11.jpg" },
  { slug: "sample-12", title: "Lumen Field", category: "3D", medium: "Photography", year: "2025", cover: "/archive/samples/sample-12.jpg" },
  { slug: "sample-13", title: "Mosaic Study", category: "ART", medium: "Mixed Media", year: "2026", cover: "/archive/samples/sample-13.png" },
  { slug: "sample-14", title: "Neon Still", category: "ART", medium: "Photography", year: "2026", cover: "/archive/samples/sample-14.png" },
  { slug: "sample-15", title: "Opal Texture", category: "Graphics", medium: "Digital", year: "2026", cover: "/archive/samples/sample-15.png" },
  { slug: "sample-16", title: "Prism Grid", category: "3D", medium: "Digital", year: "2026", cover: "/archive/samples/sample-16.png" },
  { slug: "sample-17", title: "Quiet Form", category: "UX", medium: "Print", year: "2026", cover: "/archive/samples/sample-17.png" },
  { slug: "sample-18", title: "Rust Palette", category: "ART", medium: "Mixed Media", year: "2026", cover: "/archive/samples/sample-18.png" },
  { slug: "sample-19", title: "Signal Noise", category: "Graphics", medium: "Digital", year: "2026", cover: "/archive/samples/sample-19.jpg" },
  { slug: "sample-20", title: "Terra Print", category: "ART", medium: "Print", year: "2026", cover: "/archive/samples/sample-20.png" },
  { slug: "sample-21", title: "Ultraviolet", category: "UX", medium: "Photography", year: "2026", cover: "/archive/samples/sample-21.png" },
  { slug: "sample-22", title: "Velvet Edge", category: "3D", medium: "Collage", year: "2026", cover: "/archive/samples/sample-22.png" },
  { slug: "sample-23", title: "Woven Grid", category: "ART", medium: "Typography", year: "2026", cover: "/archive/samples/sample-23.webp" },
];

export function getArchivePosts() {
  const cms = getCmsPayload();
  if (!cms?.archiveItems?.length) return LOCAL_ARCHIVE_POSTS;
  const bySlug = new Map(LOCAL_ARCHIVE_POSTS.map((item) => [item.slug, item]));
  for (const item of cms.archiveItems) {
    if (item?.slug) bySlug.set(item.slug, item);
  }
  return [...bySlug.values()];
}

export const archivePosts = LOCAL_ARCHIVE_POSTS;

export const archiveCategories = ["ART", "3D", "Graphics", "UX"];

export function getArchivePost(slug = "") {
  return getArchivePosts().find((post) => post.slug === slug) || null;
}

export function archiveCover(post) {
  return post?.cover || "";
}

export function archivePostPath(post) {
  if (post.externalUrl) return post.externalUrl;
  return post.path || `/archive/${post.slug}`;
}
