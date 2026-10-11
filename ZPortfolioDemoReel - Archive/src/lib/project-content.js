/**
 * Project content layer (CMS-ready).
 *
 * Edit case studies in content/projects/*.js — same shape a headless CMS
 * would return. Later, replace loadProjectSources() with Notion/Sanity/etc.
 */

import { getCmsPayload } from "./cms/store.js";
import { mediaUrl } from "./media.js";
import ford from "../../content/projects/ford.js";
import hypedocs from "../../content/projects/hypedocs.js";
import icons from "../../content/projects/icons.js";
import natureCycle from "../../content/projects/nature-cycle.js";

/** @typedef {{
 *  slug: string,
 *  title?: string,
 *  category?: string,
 *  role?: string,
 *  year?: string|number,
 *  tags?: string[]|string,
 *  summary?: string,
 *  body?: string,
 *  featured?: boolean,
 *  moreWork?: boolean,
 *  sort?: number,
 *  assetDir?: string,
 *  cover?: string,
 *  hero?: string,
 *  devices?: Array<{src: string, label?: string}>,
 *  video?: {src: string, poster?: string, label?: string}|null,
 *  gallery?: Array<string|{src: string, alt?: string, layout?: string}>,
 * }} ProjectInput */

/** Encode each path segment so spaces in filenames stay valid URLs. */
export function encodeAssetPath(pathname = "") {
  return String(pathname)
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");
}

export function projectAsset(assetDir, file) {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  const pathname = String(file).startsWith("/")
    ? encodeAssetPath(file)
    : encodeAssetPath(`/projects/${assetDir}/${file}`);
  return mediaUrl(pathname);
}

function asStringList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGallery(items = [], assetDir) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && (item.src || typeof item === "string"))
    .map((item) => {
      const src = typeof item === "string" ? item : item.src;
      const alt = typeof item === "string" ? "" : item.alt || "";
      const layout =
        typeof item === "string" ? "full" : item.layout === "half" ? "half" : "full";
      return {
        src: projectAsset(assetDir, src),
        alt,
        layout,
      };
    });
}

function normalizeDevices(items = [], assetDir) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item?.src)
    .map((item) => ({
      src: projectAsset(assetDir, item.src),
      label: item.label || "",
    }));
}

function normalizeVideo(video, assetDir) {
  if (!video?.src) return null;
  return {
    src: projectAsset(assetDir, video.src),
    poster: video.poster ? projectAsset(assetDir, video.poster) : "",
    label: video.label || "",
  };
}

/** @param {ProjectInput} raw */
function normalizeProject(raw = {}, fileSlug = "") {
  const slug = String(raw.slug || fileSlug).trim();
  if (!slug) return null;

  const assetDir = String(raw.assetDir || slug).trim();
  const coverFile = raw.cover || "";
  const heroFile = raw.hero || coverFile;

  return {
    slug,
    title: raw.title || slug,
    category: raw.category || "Design",
    role: raw.role || "",
    year: String(raw.year || ""),
    tags: asStringList(raw.tags),
    summary: raw.summary || "",
    body: typeof raw.body === "string" ? raw.body.trim() : "",
    featured: Boolean(raw.featured),
    moreWork: raw.moreWork ?? raw.more_work,
    sort: Number.isFinite(Number(raw.sort)) ? Number(raw.sort) : null,
    assetDir,
    cover: projectAsset(assetDir, coverFile),
    hero: projectAsset(assetDir, heroFile),
    devices: normalizeDevices(raw.devices, assetDir),
    video: normalizeVideo(raw.video, assetDir),
    gallery: normalizeGallery(raw.gallery, assetDir),
    hasCaseStudy: Boolean(
      (raw.gallery && raw.gallery.length) ||
        raw.video ||
        raw.body ||
        (raw.devices && raw.devices.length)
    ),
  };
}

/**
 * Cover-only stubs until their case-study folders are filled in.
 * @type {ProjectInput[]}
 */
const LEGACY_COVER_PROJECTS = [
  {
    slug: "photography",
    title: "TIFF 2026",
    category: "Motion",
    role: "Motion Design",
    year: "2026",
    tags: ["Motion", "Festival"],
    summary: "Motion design for TIFF-related work.",
    assetDir: "photography",
    cover: "cover.jpg",
  },
  {
    slug: "william-sonoma",
    title: "Williams Sonoma",
    category: "Layouts",
    role: "IMC Campaign",
    year: "2026",
    tags: ["Editorial", "Campaign"],
    summary: "Layout and merchandising study for a retail brand.",
    assetDir: "william-sonoma",
    cover: "cover.jpg",
  },
  {
    slug: "nectar",
    title: "Nectar Energy",
    category: "Design",
    role: "Brand Design",
    year: "2025",
    tags: ["Business", "Brand"],
    summary: "Business brand exploration and identity applications.",
    assetDir: "nectar",
    cover: "cover.jpg",
  },
  {
    slug: "web101",
    title: "Website 101 Podcast",
    category: "Web",
    role: "Motion Design",
    year: "2025",
    tags: ["Web", "Motion"],
    summary: "Motion for the Website 101 podcast.",
    assetDir: "web101",
    cover: "cover.jpg",
  },
  {
    slug: "seneca-spot",
    title: "Seneca Spot",
    category: "Apps",
    role: "Mobile App Design",
    year: "2024",
    tags: ["Product", "Pitch"],
    summary: "Campus experience concept and pitch materials.",
    assetDir: "seneca-spot",
    cover: "cover.jpg",
  },
];

function loadProjectSources() {
  const local = [ford, hypedocs, icons, natureCycle, ...LEGACY_COVER_PROJECTS];
  const cms = getCmsPayload();
  if (!cms?.projects?.length) return local;
  const bySlug = new Map(local.map((item) => [item.slug, item]));
  for (const item of cms.projects) {
    if (item?.slug) bySlug.set(item.slug, item);
  }
  return [...bySlug.values()];
}

function dedupeBySlug(items) {
  const map = new Map();
  for (const item of items) {
    const project = normalizeProject(item);
    if (!project?.slug) continue;
    if (!map.has(project.slug) || project.hasCaseStudy) {
      map.set(project.slug, project);
    }
  }
  return [...map.values()];
}

const FEATURED_ORDER = [
  "nature-cycle",
  "hypedocs",
  "icons",
  "ford",
  "photography",
  "william-sonoma",
  "nectar",
  "web101",
  "seneca-spot",
];

export function getProjects() {
  const list = dedupeBySlug(loadProjectSources());
  return list.sort((a, b) => {
    if (a.sort != null || b.sort != null) {
      const aRank = a.sort == null ? 9999 : a.sort;
      const bRank = b.sort == null ? 9999 : b.sort;
      if (aRank !== bRank) return aRank - bRank;
    }
    const ai = FEATURED_ORDER.indexOf(a.slug);
    const bi = FEATURED_ORDER.indexOf(b.slug);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    return aRank - bRank;
  });
}

/** Local snapshot used when CMS is not hydrated. Prefer getProjects(). */
export const projects = getProjects();

// Keep lookups centralized so route matching and components use identical data.
export function getProject(slug = "") {
  return getProjects().find((project) => project.slug === slug) || null;
}

export function projectPath(projectOrSlug) {
  const slug = typeof projectOrSlug === "string" ? projectOrSlug : projectOrSlug?.slug;
  return slug ? `/work/${slug}` : "/work";
}

export function projectCover(slug) {
  return getProject(slug)?.cover || mediaUrl(encodeAssetPath(`/projects/${slug}/cover.jpg`));
}

export function featuredProjects() {
  return getProjects().filter((project) => project.featured || project.hasCaseStudy);
}
