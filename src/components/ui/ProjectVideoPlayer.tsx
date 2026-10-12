type ProjectVideoPlayerProps = {
  src: string;
  label?: string;
  poster?: string;
  orientation?: "landscape" | "portrait";
};

function getYouTubeEmbedUrl(src: string) {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  let videoId: string | undefined;

  if (hostname === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0];
  } else if (
    hostname === "youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "youtube-nocookie.com"
  ) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") ?? undefined;
    } else {
      const [, route, id] = url.pathname.split("/");
      if (route === "embed" || route === "shorts" || route === "live") {
        videoId = id;
      }
    }
  }

  if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function ProjectVideoPlayer({
  src,
  label,
  poster,
  orientation = "landscape",
}: ProjectVideoPlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(src);

  return (
    <div
      className={`project-video__frame${orientation === "portrait" ? " project-video__frame--portrait" : ""}`}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={label || "Project video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <video
          controls
          playsInline
          preload="none"
          poster={poster || undefined}
          src={src}
        />
      )}
    </div>
  );
}
