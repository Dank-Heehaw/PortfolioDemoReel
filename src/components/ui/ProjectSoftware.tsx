import { siBlender, siFigma } from "simple-icons";

type ProjectSoftwareProps = {
  software: string[];
};

type SoftwareIcon =
  | "after-effects"
  | "blender"
  | "figma"
  | "illustrator"
  | "indesign"
  | "lightroom"
  | "photoshop"
  | "premiere-pro"
  | "generic";

function getSoftwareIcon(name: string): SoftwareIcon {
  const normalizedName = name.toLowerCase().replace(/^adobe\s+/, "").trim();

  if (normalizedName.includes("after effects")) return "after-effects";
  if (normalizedName.includes("premiere")) return "premiere-pro";
  if (normalizedName === "blender") return "blender";
  if (normalizedName === "photoshop") return "photoshop";
  if (normalizedName === "illustrator") return "illustrator";
  if (normalizedName === "indesign") return "indesign";
  if (normalizedName === "lightroom") return "lightroom";
  if (normalizedName === "figma") return "figma";
  return "generic";
}

export function ProjectSoftware({ software }: ProjectSoftwareProps) {
  if (!software.length) return null;

  return (
    <section className="project-software" aria-label="Software used" data-reveal>
      <h2 className="project-section__title">Applications used</h2>
      <ul className="project-software__list">
        {software.map((name) => {
          const icon = getSoftwareIcon(name);

          return (
            <li className="project-software__item" key={name}>
              <span
                className={`project-software__icon project-software__icon--${icon}`}
                aria-hidden="true"
              >
                {icon === "blender" ? (
                  <svg viewBox="0 0 24 24">
                    <path d={siBlender.path} />
                  </svg>
                ) : icon === "figma" ? (
                  <svg viewBox="0 0 24 24">
                    <path d={siFigma.path} />
                  </svg>
                ) : icon === "after-effects" ? (
                  "Ae"
                ) : icon === "premiere-pro" ? (
                  "Pr"
                ) : icon === "photoshop" ? (
                  "Ps"
                ) : icon === "illustrator" ? (
                  "Ai"
                ) : icon === "indesign" ? (
                  "Id"
                ) : icon === "lightroom" ? (
                  "Lr"
                ) : (
                  name.slice(0, 2)
                )}
              </span>
              <span className="project-software__name">{name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
