/**
 * Project catalog.
 * Case studies live in src/content/projects/*.ts — edit those files to change a project.
 */

import { encodeAssetPath, mediaUrl } from "./media";
import ford from "@/content/projects/ford";
import hypedocs from "@/content/projects/hypedocs";
import icons from "@/content/projects/icons";
import natureCycle from "@/content/projects/nature-cycle";

export type ProjectInput = {
  slug: string;
  title?: string;
  category?: string;
  role?: string;
  year?: string | number;
  tags?: string[] | string;
  summary?: string;
  body?: string;
  featured?: boolean;
  moreWork?: boolean;
  sort?: number;
  assetDir?: string;
  cover?: string;
  hero?: string;
  devices?: Array<{ src: string; label?: string }>;
  video?: { src: string; poster?: string; label?: string } | null;
  gallery?: Array<string | { src: string; alt?: string; layout?: string }>;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  role: string;
  year: string;
  tags: string[];
  summary: string;
  body: string;
  featured: boolean;
  moreWork?: boolean;
  sort: number | null;
  assetDir: string;
  cover: string;
  hero: string;
  devices: Array<{ src: string; label: string }>;
  video: { src: string; poster: string; label: string } | null;
  gallery: Array<{ src: string; alt: string; layout: "half" | "full" }>;
  hasCaseStudy: boolean;
};

/** Build a public URL like /projects/Ford/Cover%20Slim.png */
export function projectAsset(assetDir: string, file?: string) {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  const pathname = String(file).startsWith("/")
    ? encodeAssetPath(file)
    : encodeAssetPath(`/projects/${assetDir}/${file}`);
  return mediaUrl(pathname);
}

function asStringList(value?: string[] | string) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGallery(items: ProjectInput["gallery"] = [], assetDir: string) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && (typeof item === "string" || item.src))
    .map((item) => {
      const src = typeof item === "string" ? item : item.src;
      const alt = typeof item === "string" ? "" : item.alt || "";
      const layout =
        typeof item === "string" ? "full" : item.layout === "half" ? "half" : "full";
      return {
        src: projectAsset(assetDir, src),
        alt,
        layout: layout as "half" | "full",
      };
    });
}

function normalizeDevices(items: ProjectInput["devices"] = [], assetDir: string) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item?.src)
    .map((item) => ({
      src: projectAsset(assetDir, item.src),
      label: item.label || "",
    }));
}

function normalizeVideo(video: ProjectInput["video"], assetDir: string) {
  if (!video?.src) return null;
  return {
    src: projectAsset(assetDir, video.src),
    poster: video.poster ? projectAsset(assetDir, video.poster) : "",
    label: video.label || "",
  };
}

function normalizeProject(raw: ProjectInput, fileSlug = ""): Project | null {
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
    moreWork: raw.moreWork,
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

/** Cover-only rows until those folders get full case-study assets. */
const LEGACY_COVER_PROJECTS: ProjectInput[] = [
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

function loadProjectSources(): ProjectInput[] {
  return [ford, hypedocs, icons, natureCycle, ...LEGACY_COVER_PROJECTS];
}

function dedupeBySlug(items: ProjectInput[]) {
  const map = new Map<string, Project>();
  for (const item of items) {
    const project = normalizeProject(item);
    if (!project?.slug) continue;
    if (!map.has(project.slug) || project.hasCaseStudy) {
      map.set(project.slug, project);
    }
  }
  return [...map.values()];
}

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

export function getProject(slug = "") {
  return getProjects().find((project) => project.slug === slug);
}

/** URL for a project page: /work/ford */
export function projectPath(projectOrSlug: string | { slug?: string } | undefined) {
  const slug = typeof projectOrSlug === "string" ? projectOrSlug : projectOrSlug?.slug;
  return slug ? `/work/${slug}` : "/work";
}

export function projectCover(slug: string) {
  return getProject(slug)?.cover || mediaUrl(encodeAssetPath(`/projects/${slug}/cover.jpg`));
}

export function featuredProjects() {
  return getProjects().filter((project) => project.featured || project.hasCaseStudy);
}
