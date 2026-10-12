type FigmaPrototypeProps = {
  src: string;
  title: string;
};

function getFigmaEmbedUrl(src: string) {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (url.protocol !== "https:" || hostname !== "figma.com") return null;
  if (!/^\/(proto|design)\//.test(url.pathname)) return null;

  const embedUrl = new URL("https://www.figma.com/embed");
  embedUrl.searchParams.set("embed_host", "share");
  embedUrl.searchParams.set("url", url.toString());
  return embedUrl.toString();
}

export function FigmaPrototype({ src, title }: FigmaPrototypeProps) {
  const embedUrl = getFigmaEmbedUrl(src);

  return (
    <section className="project-prototype" aria-label="Interactive prototype" data-reveal>
      <h2 className="project-section__title">Interactive Prototype</h2>
      {embedUrl ? (
        <div className="project-prototype__frame">
          <iframe
            src={embedUrl}
            title={`${title} Figma prototype`}
            loading="lazy"
            allowFullScreen
          />
        </div>
      ) : (
        <p role="status">This prototype URL is invalid. Check the Figma URL in the project settings.</p>
      )}
    </section>
  );
}
