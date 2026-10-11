import { memoCms } from "./memo";
import { loadSanity } from "@/sanity/lib/load";
import { siteMarksQuery } from "@/sanity/lib/queries";

export type SiteMarks = {
  logo: string;
  logoHover: string;
  logoMenu: string;
};

const FALLBACK: SiteMarks = {
  logo: "/icons/logo-mark-outline.svg",
  logoHover: "/icons/logo-mark.svg",
  logoMenu: "/icons/logo-mark-dark.svg",
};

const readSiteMarks = memoCms(async () => {
  const marks = await loadSanity<Partial<SiteMarks> | null>(siteMarksQuery);
  return {
    logo: marks?.logo || FALLBACK.logo,
    logoHover: marks?.logoHover || FALLBACK.logoHover,
    logoMenu: marks?.logoMenu || FALLBACK.logoMenu,
  };
});

export function getSiteMarks() {
  return readSiteMarks();
}
