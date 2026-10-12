/**
 * Journal posts.
 * Markdown files live in src/content/journal/.
 * This file only runs on the server (it reads the disk).
 */

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import type { ArbitraryTypedObject, PortableTextBlock } from "@portabletext/types";
import { client } from "@/sanity/lib/client";
import { JOURNAL_POSTS_QUERY } from "@/sanity/queries/journal";

export type JournalPortableBlock =
  | PortableTextBlock
  | (ArbitraryTypedObject & { _type: "image"; imageUrl?: string; alt?: string });

export type JournalPost = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  dateLabel: string;
  dateISO: string;
  year: string;
  cover: string;
  externalUrl: string | null;
  path: string | null;
  summary: string;
  body: string;
  html: string;
  portableBody?: JournalPortableBlock[];
  gallery: Array<{ src: string; alt: string; layout: "half" | "full" }>;
};

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const defaultLinkOpen =
  md.renderer.rules.link_open ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const href = String(token.attrGet("href") || "");
  const external = /^https?:\/\//i.test(href) || href.startsWith("//");
  if (external) {
    token.attrSet("target", "_blank");
    token.attrSet("rel", "noopener noreferrer");
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

function formatDateLabel(dateValue?: string | Date) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function normalizeGallery(items: Array<{ src?: string; alt?: string; layout?: string }> = []) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item?.src)
    .map((item) => ({
      src: item.src || "",
      alt: item.alt || "",
      layout: item.layout === "half" ? "half" : "full",
    })) as JournalPost["gallery"];
}

function normalizeTags(tags: unknown) {
  if (!tags) return [];
  const list = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",") : [];
  return list.map((tag) => String(tag ?? "").trim()).filter(Boolean);
}

function isImageOnlyParagraphHtml(block = "") {
  return /^<p>\s*<img\b[^>]*>\s*<\/p>$/i.test(String(block).trim());
}

function extractImgTag(block = "") {
  const match = String(block).match(/<img\b[^>]*>/i);
  return match ? match[0] : "";
}

function splitTopLevelBlocks(html = "") {
  const blocks = [];
  const re = /<(p|h[23]|ul|ol|blockquote)(\s[^>]*)?>[\s\S]*?<\/\1>/gi;
  let match;
  while ((match = re.exec(html))) {
    blocks.push(match[0]);
  }
  return blocks;
}

function isHeadingBlock(block = "") {
  return /^<h[23]\b/i.test(block);
}

function isListBlock(block = "") {
  return /^<(ul|ol)\b/i.test(block);
}

function isRefsHeading(block = "") {
  return /<h[23][^>]*>\s*References\s*<\/h[23]>/i.test(block);
}

/** Wrap the markdown HTML in the magazine layout classes the CSS expects. */
function enhanceArticleHtml(html = "") {
  if (!html) return html;

  const blocks = splitTopLevelBlocks(html);
  if (!blocks.length) return html;

  const out: string[] = [];
  let i = 0;

  const lede = [];
  while (
    i < blocks.length &&
    !isImageOnlyParagraphHtml(blocks[i]) &&
    !isHeadingBlock(blocks[i]) &&
    !isListBlock(blocks[i])
  ) {
    lede.push(blocks[i]);
    i += 1;
  }
  if (lede.length) {
    out.push(`<div class="archive-article__lede">${lede.join("")}</div>`);
  }

  let splitIndex = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (isRefsHeading(block)) {
      const refs = [block];
      let j = i + 1;
      while (j < blocks.length && isListBlock(blocks[j])) {
        refs.push(blocks[j]);
        j += 1;
      }
      out.push(`<aside class="archive-article__refs">${refs.join("")}</aside>`);
      i = j;
      continue;
    }

    if (isImageOnlyParagraphHtml(block)) {
      out.push(`<figure class="archive-article__figure">${extractImgTag(block)}</figure>`);
      i += 1;
      continue;
    }

    if (isHeadingBlock(block)) {
      const copy = [block];
      let j = i + 1;
      while (
        j < blocks.length &&
        !isImageOnlyParagraphHtml(blocks[j]) &&
        !isHeadingBlock(blocks[j]) &&
        !isListBlock(blocks[j])
      ) {
        copy.push(blocks[j]);
        j += 1;
      }

      if (j < blocks.length && isImageOnlyParagraphHtml(blocks[j])) {
        const flip = splitIndex % 2 === 1 ? " archive-article__split--flip" : "";
        out.push(
          `<section class="archive-article__split${flip}"><div class="archive-article__split-copy">${copy.join(
            ""
          )}</div><figure class="archive-article__figure">${extractImgTag(
            blocks[j]
          )}</figure></section>`
        );
        splitIndex += 1;
        i = j + 1;
        continue;
      }
    }

    out.push(block);
    i += 1;
  }

  return out.join("");
}

function journalFromFields(
  data: Record<string, unknown> = {},
  content = "",
  portableBody?: JournalPortableBlock[]
): JournalPost | null {
  const slug = String(data.slug || "").trim();
  if (!slug) return null;
  const body =
    typeof content === "string" && content.trim()
      ? content
      : typeof data.body === "string"
        ? data.body
        : String(data.content || "");
  const parsedDate = data.date ? new Date(String(data.date)) : null;
  const dateISO =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString().slice(0, 10)
      : "";
  const year = dateISO ? dateISO.slice(0, 4) : String(new Date().getFullYear());
  const externalUrl = (data.external_url || data.externalUrl || null) as string | null;
  const category = externalUrl
    ? String(data.category || "Article")
    : String(data.category || "Blog post");

  return {
    slug,
    title: String(data.title || slug),
    category,
    tags: normalizeTags(data.tags),
    dateLabel: formatDateLabel(data.date as string | Date | undefined),
    dateISO,
    year,
    cover: String(data.cover || ""),
    externalUrl,
    path: externalUrl ? null : `/journal/${slug}`,
    summary: String(data.summary || ""),
    body: String(body).trim(),
    html: enhanceArticleHtml(md.render(String(body).trim())),
    ...(portableBody?.length ? { portableBody } : {}),
    gallery: normalizeGallery(data.gallery as JournalPost["gallery"]),
  };
}

function loadJournalPosts() {
  const dir = path.join(process.cwd(), "src/content/journal");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      return journalFromFields(
        { ...data, slug: data.slug || file.replace(/\.md$/, "") },
        content
      );
    })
    .filter((post): post is JournalPost => Boolean(post))
    .sort((a, b) => (b.dateISO || "").localeCompare(a.dateISO || ""));
}

export function getLocalJournalPosts() {
  return loadJournalPosts();
}

type SanityJournalPost = {
  slug: string;
  title?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  summary?: string;
  externalUrl?: string | null;
  cover?: string;
  body?: JournalPortableBlock[];
  gallery?: Array<{ src?: string; alt?: string; layout?: string }>;
};

export const getJournalPosts = cache(async function getJournalPosts() {
  const sanityPosts = await client.fetch<SanityJournalPost[]>(JOURNAL_POSTS_QUERY);
  if (!sanityPosts.length) return getLocalJournalPosts();

  const postsBySlug = new Map(
    getLocalJournalPosts().map((post) => [post.slug, post])
  );
  for (const rawPost of sanityPosts) {
    const localPost = postsBySlug.get(rawPost.slug);
    const post = journalFromFields(
      {
        slug: rawPost.slug,
        title: rawPost.title || localPost?.title,
        category: rawPost.category || localPost?.category,
        tags: rawPost.tags?.length ? rawPost.tags : localPost?.tags,
        date: rawPost.publishedAt || localPost?.dateISO,
        summary: rawPost.summary || localPost?.summary,
        externalUrl: rawPost.externalUrl ?? localPost?.externalUrl,
        cover: rawPost.cover || localPost?.cover,
        body: localPost?.body || "",
        gallery: rawPost.gallery?.length ? rawPost.gallery : localPost?.gallery,
      },
      "",
      rawPost.body?.length ? rawPost.body : localPost?.portableBody
    );
    if (post) postsBySlug.set(post.slug, post);
  }

  return [...postsBySlug.values()].sort((a, b) =>
    (b.dateISO || "").localeCompare(a.dateISO || "")
  );
});

export async function getJournalPost(slug = "") {
  const posts = await getJournalPosts();
  return posts.find((post) => post.slug === slug);
}

export { journalPostPath } from "./paths";

export async function getOnSiteJournalPosts() {
  const posts = await getJournalPosts();
  return posts.filter((post) => !post.externalUrl);
}
