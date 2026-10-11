/** Client-safe URL helpers. Keep CMS imports out of this file. */

export function projectPath(projectOrSlug: string | { slug?: string } | undefined) {
  const slug = typeof projectOrSlug === "string" ? projectOrSlug : projectOrSlug?.slug;
  return slug ? `/work/${slug}` : "/work";
}

export function journalPostPath(post: { externalUrl?: string | null; path?: string | null; slug?: string }) {
  if (post.externalUrl) return post.externalUrl;
  return post.path || `/journal/${post.slug}`;
}
