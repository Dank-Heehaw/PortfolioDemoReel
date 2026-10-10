/**
 * Directus REST mapper — server-only (token stays out of the client bundle).
 * File fields become public `{assetsOrigin}/assets/{id}` URLs for <img>/<video>.
 */

import { journalFromFields } from "../journal-content.js";
import { directusAssetUrl } from "../media.js";

function env(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

export function getDirectusConfig() {
  const url = env("DIRECTUS_URL").replace(/\/+$/, "");
  const token = env("DIRECTUS_TOKEN");
  const assetsUrl = env("DIRECTUS_ASSETS_URL").replace(/\/+$/, "") || url;
  const revalidate = Number(env("CMS_REVALIDATE", "60"));
  return {
    url,
    token,
    assetsUrl,
    revalidate: Number.isFinite(revalidate) && revalidate >= 0 ? revalidate : 60,
  };
}

function assetUrl(origin, file) {
  return directusAssetUrl(origin, file);
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function mapMediaList(origin, items) {
  return asList(items)
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const src =
          assetUrl(origin, item) || (/^https?:\/\//i.test(item) ? item : "");
        return src ? { src } : null;
      }
      if (item.directus_files_id) {
        const src = assetUrl(origin, item.directus_files_id);
        return src ? { src, alt: item.alt || "" } : null;
      }
      const src =
        assetUrl(origin, item.file || item.id || item.src) ||
        (typeof item.src === "string" && /^https?:\/\//i.test(item.src) ? item.src : "");
      if (!src) return null;
      return {
        src,
        alt: item.alt || "",
        layout: item.layout === "half" ? "half" : "full",
        label: item.label || "",
      };
    })
    .filter(Boolean);
}

function mapProject(origin, row) {
  const assetDir = row.asset_dir || row.assetDir || row.slug;
  const cover = assetUrl(origin, row.cover) || assetUrl(origin, row.cover_url) || "";
  const hero = assetUrl(origin, row.hero) || assetUrl(origin, row.hero_url) || cover;
  const gallery = mapMediaList(origin, row.gallery_files?.length ? row.gallery_files : row.gallery);
  const devices = mapMediaList(origin, row.devices).map((item) => ({
    src: item.src,
    label: item.label || "",
  }));
  const videoFile = row.video_file || row.video;
  const videoSrc =
    assetUrl(origin, row.video_file) ||
    (videoFile && typeof videoFile === "object"
      ? assetUrl(origin, videoFile.file || videoFile.src) ||
        (typeof videoFile.src === "string" && /^https?:\/\//i.test(videoFile.src) ? videoFile.src : "")
      : "");
  const videoPoster =
    assetUrl(origin, row.video_poster) ||
    (videoFile && typeof videoFile === "object" ? assetUrl(origin, videoFile.poster) : "");

  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    role: row.role,
    year: row.year,
    tags: row.tags,
    summary: row.summary,
    body: row.body,
    featured: Boolean(row.featured),
    moreWork: row.more_work ?? row.moreWork,
    sort: row.sort,
    assetDir,
    cover,
    hero,
    devices,
    video: videoSrc
      ? {
          src: videoSrc,
          poster: videoPoster,
          label: (videoFile && videoFile.label) || row.video_label || "",
        }
      : null,
    gallery,
  };
}

function mapJournal(origin, row) {
  const cover = assetUrl(origin, row.cover) || assetUrl(origin, row.cover_url) || "";
  const gallery = mapMediaList(origin, row.gallery_files?.length ? row.gallery_files : row.gallery).map((item) => ({
    src: item.src,
    alt: item.alt || "",
    layout: item.layout,
  }));
  return journalFromFields({
    slug: row.slug,
    title: row.title,
    category: row.category,
    tags: row.tags,
    date: row.date || row.published_at,
    cover,
    summary: row.summary,
    body: row.body || row.content || "",
    gallery,
    external_url: row.external_url || row.externalUrl,
  });
}

function mapWorkCategory(origin, row) {
  return {
    id: row.key || row.id,
    label: row.label,
    meta: row.meta || "",
    cover: assetUrl(origin, row.cover) || assetUrl(origin, row.cover_url) || "",
    projectSlug: row.project_slug || row.projectSlug,
  };
}

function mapArchive(origin, row) {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    medium: row.medium,
    year: String(row.year || ""),
    cover: assetUrl(origin, row.cover) || assetUrl(origin, row.cover_url) || "",
  };
}

function isPublished(row) {
  const status = String(row?.status || "published").toLowerCase();
  return status === "published" || status === "public";
}

async function directusItems(config, collection) {
  const params = new URLSearchParams({
    limit: "-1",
    fields: "*.*.*",
  });

  const res = await fetch(`${config.url}/items/${collection}?${params}`, {
    headers: {
      Accept: "application/json",
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
    next: { revalidate: config.revalidate, tags: ["cms", collection] },
  });

  if (res.status === 403 || res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`Directus ${collection} ${res.status}`);
  }
  const json = await res.json();
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows.filter(isPublished);
}

export async function fetchDirectusPayload() {
  const config = getDirectusConfig();
  if (!config.url) return null;

  const safe = (collection) =>
    directusItems(config, collection).catch((error) => {
      console.warn(`Directus collection "${collection}" skipped.`, error);
      return [];
    });

  const [projects, journal, workCategories, archiveItems] = await Promise.all([
    safe("projects"),
    safe("journal_posts"),
    safe("work_categories"),
    safe("archive_items"),
  ]);

  return {
    source: "directus",
    projects: projects.map((row) => mapProject(config.assetsUrl, row)).filter((item) => item.slug),
    journal: journal.map((row) => mapJournal(config.assetsUrl, row)).filter((item) => item?.slug),
    workCategories: workCategories.map((row) => mapWorkCategory(config.assetsUrl, row)).filter((item) => item.id),
    archiveItems: archiveItems.map((row) => mapArchive(config.assetsUrl, row)).filter((item) => item.slug),
  };
}
