/**
 * Categories shown when you open Work inside the fullscreen menu.
 * Each one points at a featured project cover.
 */

import { cache } from "react";
import { encodeAssetPath, mediaUrl } from "./media";
import { getLocalProjects, getProjects } from "./projects";

export type WorkCategory = {
  id: string;
  label: string;
  meta: string;
  cover: string;
  projectSlug: string;
};

const WORK_CATEGORY_DEFS = [
  {
    id: "ui-ux",
    label: "UI/UX",
    meta: "Product & interfaces",
    projectSlug: "nature-cycle",
  },
  {
    id: "branding",
    label: "Branding",
    meta: "Identity systems",
    projectSlug: "hypedocs",
  },
  {
    id: "motion",
    label: "Motion",
    meta: "Animations VFX",
    projectSlug: "icons",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    meta: "Integrated work",
    projectSlug: "ford",
  },
] as const;

function categoriesFrom(projects: { slug: string; cover: string }[]): WorkCategory[] {
  return WORK_CATEGORY_DEFS.map((item) => {
    const project = projects.find((entry) => entry.slug === item.projectSlug);
    return {
      ...item,
      cover:
        project?.cover ||
        mediaUrl(encodeAssetPath(`/projects/${item.projectSlug}/cover.jpg`)),
    };
  });
}

/** Sync catalog for the site shell so navigation is not blocked on Payload. */
export function getStaticWorkCategories(): WorkCategory[] {
  return categoriesFrom(getLocalProjects());
}

export const getWorkCategories = cache(async function getWorkCategories(): Promise<WorkCategory[]> {
  return categoriesFrom(await getProjects());
});
