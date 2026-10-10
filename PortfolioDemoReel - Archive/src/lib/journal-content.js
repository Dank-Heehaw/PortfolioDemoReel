import { load as parseYaml } from "js-yaml";
import MarkdownIt from "markdown-it";
import { getCmsPayload } from "./cms/store.js";
import hustleCulture from "../../content/journal/hustle-culture.md?raw";
import toldBlind from "../../content/journal/told-id-go-blind-from-screens.md?raw";
import digitalBard from "../../content/journal/the-digital-bard.md?raw";

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
  const href = token.attrGet("href") || "";
  const external = /^https?:\/\//i.test(href) || href.startsWith("//");
  if (external) {
    token.attrSet("target", "_blank");
    token.attrSet("rel", "noopener noreferrer");
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

const journalFiles = {
  "hustle-culture.md": hustleCulture,
  "told-id-go-blind-from-screens.md": toldBlind,
  "the-digital-bard.md": digitalBard,
};

/** Browser-safe front-matter parse (no Node filesystem APIs). */
function matter(raw = "") {
  const text = String(raw).replace(/^\uFEFF/, "");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, content: text };
  try {
    const data = parseYaml(match[1]) || {};
    return { data: typeof data === "object" && data ? data : {}, content: match[2] };
  } catch {
    return { data: {}, content: match[2] };
  }
}

function formatDateLabel(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function normalizeGallery(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item?.src)
    .map((item) => ({
      src: item.src,
      alt: item.alt || "",
      layout: item.layout === "half" ? "half" : "full",
    }));
}

function normalizeTags(tags) {
  if (!tags) return [];
  const list = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : [];
  return list
    .map((tag) => String(tag == null ? "" : tag).trim())
    .filter(Boolean);
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
  const re =
    /<(p|h[23]|ul|ol|blockquote)(\s[^>]*)?>[\s\S]*?<\/\1>/gi;
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

/**
 * Magazine structure: opening lede, then heading/image offset pairs,
 * with the references list condensed in its own ruled block.
 */
function enhanceArticleHtml(html = "") {
  if (!html) return html;

  const blocks = splitTopLevelBlocks(html);
  if (!blocks.length) return html;

  const out = [];
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
      out.push(
        `<figure class="archive-article__figure">${extractImgTag(block)}</figure>`
      );
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

export function journalFromFields(data = {}, content = "") {
  const slug = String(data.slug || "").trim();
  if (!slug) return null;
  const body =
    typeof content === "string" && content.trim()
      ? content
      : data.body || data.content || "";
  const dateISO = data.date ? new Date(data.date).toISOString().slice(0, 10) : "";
  const year = dateISO ? dateISO.slice(0, 4) : String(new Date().getFullYear());
  const externalUrl = data.external_url || data.externalUrl || null;
  const category = externalUrl
    ? data.category || "Article"
    : data.category || "Blog post";

  return {
    slug,
    title: data.title || slug,
    category,
    tags: normalizeTags(data.tags),
    dateLabel: formatDateLabel(data.date),
    dateISO,
    year,
    cover: data.cover || "",
    externalUrl,
    path: externalUrl ? null : `/journal/${slug}`,
    summary: data.summary || "",
    html: enhanceArticleHtml(md.render(String(body).trim())),
    gallery: normalizeGallery(data.gallery),
  };
}

function parseJournalFile(raw, filename = "") {
  const { data, content } = matter(raw);
  return journalFromFields(
    { ...data, slug: data.slug || filename.replace(/\.md$/, "") },
    content
  );
}

const localJournalPosts = Object.entries(journalFiles)
  .map(([path, raw]) => parseJournalFile(raw, path.split("/").pop()))
  .filter(Boolean)
  .sort((a, b) => (b.dateISO || "").localeCompare(a.dateISO || ""));

export function getJournalPosts() {
  const cms = getCmsPayload();
  if (!cms?.journal?.length) return localJournalPosts;
  const bySlug = new Map(localJournalPosts.map((item) => [item.slug, item]));
  for (const item of cms.journal) {
    if (item?.slug) bySlug.set(item.slug, item);
  }
  return [...bySlug.values()].sort((a, b) => (b.dateISO || "").localeCompare(a.dateISO || ""));
}

export function getJournalPost(slug = "") {
  return getJournalPosts().find((post) => post.slug === slug) || null;
}

/** Snapshot alias; prefer getJournalPosts() after CMS hydrate. */
export const journalPosts = localJournalPosts;

export function journalPostPath(post) {
  if (post.externalUrl) return post.externalUrl;
  return post.path || `/journal/${post.slug}`;
}
