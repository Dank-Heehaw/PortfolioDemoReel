/**
 * Categories shown when you open Work inside the fullscreen menu.
 * Each one points at a featured project cover.
 */

import { projectCover } from "./projects";

export function getWorkCategories() {
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
