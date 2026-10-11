/**
 * Work menu / Work page categories.
 * Left rail labels after choosing Work in the nav menu;
 * each category maps to a featured cover used in the 3D card stack on the right.
 */
import { getCmsPayload } from "../lib/cms/store.js";
import { projectCover } from "./projects.js";

function localWorkCategories() {
  return [
    {
      id: "ui-ux",
      label: "UI/UX",
      meta: "Product & interfaces",
      cover: projectCover("nature-cycle"),
      projectSlug: "nature-cycle",
    },
    {
      id: "branding",
      label: "Branding",
      meta: "Identity systems",
      cover: projectCover("hypedocs"),
      projectSlug: "hypedocs",
    },
    {
      id: "motion",
      label: "Motion",
      meta: "Moving image",
      cover: projectCover("icons"),
      projectSlug: "icons",
    },
    {
      id: "campaigns",
      label: "Campaigns",
      meta: "Integrated work",
      cover: projectCover("ford"),
      projectSlug: "ford",
    },
  ];
}

export function getWorkCategories() {
  const cms = getCmsPayload();
  if (cms?.workCategories?.length) {
    return cms.workCategories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      meta: cat.meta || "",
      projectSlug: cat.projectSlug,
      cover: cat.cover || projectCover(cat.projectSlug),
    }));
  }
  return localWorkCategories();
}

/** Local snapshot; prefer getWorkCategories() after CMS hydrate. */
export const WORK_CATEGORIES = localWorkCategories();
