/**
 * Project catalog.
 * Case studies live in src/content/projects/*.ts — edit those files to change a project.
 */

import { cache } from "react";
import { client } from "@/sanity/lib/client";
import { PROJECTS_QUERY } from "@/sanity/queries/projects";
import { encodeAssetPath, mediaUrl } from "./media";
import { framerProjects } from "@/content/projects/framer";

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
  designer?: string;
  contribution?: string;
  nextProjectSlug?: string;
  prototypeUrl?: string;
  assetDir?: string;
  cover?: string;
  hero?: string;
  software?: string[] | string;
  devices?: Array<{ src: string; label?: string }>;
  video?: { src: string; poster?: string; label?: string } | null;
  shortVideo?: { src: string; poster?: string; label?: string } | null;
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
  designer: string;
  contribution: string;
  nextProjectSlug: string;
  prototypeUrl: string;
  assetDir: string;
  cover: string;
  hero: string;
  software: string[];
  devices: Array<{ src: string; label: string }>;
  video: { src: string; poster: string; label: string } | null;
  shortVideo: { src: string; poster: string; label: string } | null;
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
    designer: raw.designer || "",
    contribution: raw.contribution || "",
    nextProjectSlug: raw.nextProjectSlug || "",
    prototypeUrl: raw.prototypeUrl || "",
    assetDir,
    cover: projectAsset(assetDir, coverFile),
    hero: projectAsset(assetDir, heroFile),
    software: asStringList(raw.software),
    devices: normalizeDevices(raw.devices, assetDir),
    video: normalizeVideo(raw.video, assetDir),
    shortVideo: normalizeVideo(raw.shortVideo, assetDir),
    gallery: normalizeGallery(raw.gallery, assetDir),
    hasCaseStudy: Boolean(
      (raw.gallery && raw.gallery.length) ||
        raw.video ||
        raw.shortVideo ||
        raw.body ||
        (raw.devices && raw.devices.length)
    ),
  };
}

const FEATURED_ORDER = [
  "nature-cycle",
  "hypedocs",
  "icons",
  "ford",
  "photography",
  "workday-applicant-framework",
  "william-sonoma",
  "nectar",
  "web101",
  "seneca-spot",
  "yoasobi",
  "the-occult-shop",
  "winter-lodge",
];

function loadProjectSources(): ProjectInput[] {
  return framerProjects;
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

function sortProjects(list: Project[]) {
  return [...list].sort((a, b) => {
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

export function getLocalProjects() {
  return sortProjects(dedupeBySlug(loadProjectSources()));
}

export const getProjects = cache(async function getProjects() {
  const sanityProjects = await client.fetch<ProjectInput[]>(PROJECTS_QUERY);
  if (!sanityProjects.length) return getLocalProjects();

  const projectsBySlug = new Map(
    getLocalProjects().map((project) => [project.slug, project])
  );
  for (const rawProject of sanityProjects) {
    const localProject = projectsBySlug.get(rawProject.slug);
    const project = normalizeProject({
      ...rawProject,
      title: rawProject.title || localProject?.title,
      category: rawProject.category || localProject?.category,
      role: rawProject.role || localProject?.role,
      year: rawProject.year ?? localProject?.year,
      tags: rawProject.tags?.length ? rawProject.tags : localProject?.tags,
      summary: rawProject.summary || localProject?.summary,
      body: rawProject.body || localProject?.body,
      featured: rawProject.featured ?? localProject?.featured,
      moreWork: rawProject.moreWork ?? localProject?.moreWork,
      sort: rawProject.sort ?? localProject?.sort ?? undefined,
      designer: rawProject.designer || localProject?.designer,
      contribution: rawProject.contribution || localProject?.contribution,
      nextProjectSlug: rawProject.nextProjectSlug || localProject?.nextProjectSlug,
      prototypeUrl: rawProject.prototypeUrl || localProject?.prototypeUrl,
      assetDir: rawProject.assetDir || localProject?.assetDir,
      cover: rawProject.cover || localProject?.cover,
      hero: rawProject.hero || localProject?.hero,
      software: rawProject.software?.length ? rawProject.software : localProject?.software,
      devices: rawProject.devices?.length ? rawProject.devices : localProject?.devices,
      video: rawProject.video || localProject?.video,
      shortVideo: rawProject.shortVideo || localProject?.shortVideo,
      gallery: rawProject.gallery?.length ? rawProject.gallery : localProject?.gallery,
    });
    if (project) projectsBySlug.set(project.slug, project);
  }

  return sortProjects([...projectsBySlug.values()]);
});

export async function getProject(slug = "") {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export { projectPath } from "./paths";

export async function projectCover(slug: string) {
  const project = await getProject(slug);
  return project?.cover || mediaUrl(encodeAssetPath(`/projects/${slug}/cover.jpg`));
}

export async function featuredProjects() {
  const projects = await getProjects();
  return projects.filter((project) => project.featured || project.hasCaseStudy);
}
