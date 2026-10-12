export type SiteMarks = {
  logo: string;
  logoHover: string;
  logoMenu: string;
};

const MARKS: SiteMarks = {
  logo: "/icons/logo-mark-outline.svg",
  logoHover: "/icons/logo-mark.svg",
  logoMenu: "/icons/logo-mark-dark.svg",
};

export function getSiteMarks() {
  return MARKS;
}
