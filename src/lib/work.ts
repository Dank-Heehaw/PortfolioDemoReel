/**
 * Categories shown when you open Work inside the fullscreen menu.
 * Each one points at a featured project cover.
 */

import { cache } from "react";
import type { Project } from "./projects";
import { getLocalProjects, getProjects } from "./projects";

export type WorkCategory = {
  id: string;
  label: string;
  meta: string;
  indexCategory: string;
  featuredProjects: Pick<Project, "slug" | "title" | "category" | "cover">[];
};

const WORK_CATEGORY_DEFS = [
  {
    id: "ui-ux",
    label: "UI/UX",
    meta: "Product & interfaces",
    indexCategory: "UX Case Study",
    featuredSlugs: ["nature-cycle", "workday-applicant-framework"],
  },
  {
    id: "branding",
    label: "Branding",
    meta: "Identity systems",
    indexCategory: "Brand Design",
    featuredSlugs: ["hypedocs", "nectar"],
  },
  {
    id: "motion",
    label: "Motion",
    meta: "Animations VFX",
    indexCategory: "Motion Design",
    featuredSlugs: ["photography", "web101"],
  },
  {
    id: "campaigns",
    label: "Campaigns",
    meta: "Integrated work",
    indexCategory: "IMC Campaign",
    featuredSlugs: ["ford", "william-sonoma"],
  },
] as const;

function categoriesFrom(projects: Project[]): WorkCategory[] {
  return WORK_CATEGORY_DEFS.map(({ featuredSlugs, ...category }) => ({
    ...category,
    featuredProjects: featuredSlugs.flatMap((slug) => {
      const project = projects.find((entry) => entry.slug === slug);
      return project
        ? [{
            slug: project.slug,
            title: project.title,
            category: project.category,
            cover: project.cover,
          }]
        : [];
    }),
  }));
}

/** Sync catalog for the site shell so navigation does not wait on Sanity. */
export function getStaticWorkCategories(): WorkCategory[] {
  return categoriesFrom(getLocalProjects());
}

export const getWorkCategories = cache(async function getWorkCategories(): Promise<WorkCategory[]> {
  return categoriesFrom(await getProjects());
});
