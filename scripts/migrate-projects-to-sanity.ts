import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCliClient } from "sanity/cli";
import { framerProjects } from "../src/content/projects/framer";

const apiVersion = "2026-10-12";
const client = getCliClient({ apiVersion });
const apply = process.argv.includes("--apply");
const projectIds = new Map<string, string>();
const imageAssets = new Map<string, Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } }>>();
const uploadWaiters: Array<() => void> = [];
let activeUploads = 0;

type ImageReference = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

type ExistingProject = {
  _id: string;
  slug?: string;
};

type ProjectDraft = {
  _id: string;
  _type: "project";
  title: string;
  [key: string]: unknown;
};

type ImportedProject = {
  _id: string;
  title: string;
  slug: { current: string };
  nextProject?: { _ref: string };
  cover?: ImageReference;
  hero?: ImageReference;
  devices?: Array<{ image?: ImageReference }>;
  gallery?: Array<{ image?: ImageReference }>;
  video?: { poster?: ImageReference };
  shortVideo?: { poster?: ImageReference };
};

const localFileFor = (project: (typeof framerProjects)[number], src: string) =>
  path.resolve(
    process.cwd(),
    "public",
    "projects",
    project.assetDir || project.slug,
    src
  );

async function uploadImage(
  project: (typeof framerProjects)[number],
  src: string
): Promise<ImageReference> {
  const url = /^https?:\/\//i.test(src) ? src : "";
  const localPath = url ? "" : localFileFor(project, src);
  const cacheKey = url || localPath;
  const cached = imageAssets.get(cacheKey);
  if (cached) return cached;

  const upload = (async () => {
    if (activeUploads >= 4) {
      await new Promise<void>((resolve) => uploadWaiters.push(resolve));
    }
    activeUploads += 1;
    try {
      let data: Buffer;
      let filename: string;
      let contentType: string;

      if (url) {
        const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
        if (!response.ok) {
          throw new Error(`Image download failed (${response.status}): ${url}`);
        }
        data = Buffer.from(await response.arrayBuffer());
        filename = path.basename(new URL(url).pathname) || `${randomUUID()}.jpg`;
        contentType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
      } else {
        try {
          data = await readFile(localPath);
        } catch (error) {
          throw new Error(`Local image is unavailable: ${localPath}`, { cause: error });
        }
        filename = path.basename(localPath);
        contentType = filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
      }

      const asset = await client.assets.upload("image", data, { filename, contentType });
      return {
        _type: "image" as const,
        asset: { _type: "reference" as const, _ref: asset._id },
      };
    } finally {
      activeUploads -= 1;
      uploadWaiters.shift()?.();
    }
  })();

  imageAssets.set(cacheKey, upload);
  try {
    return await upload;
  } catch (error) {
    imageAssets.delete(cacheKey);
    throw error;
  }
}

async function createDrafts() {
  const existing = await client
    .withConfig({ perspective: "raw" })
    .fetch<ExistingProject[]>(
      '*[_type == "project" && defined(slug.current)]{_id, "slug": slug.current}'
    );
  const existingBySlug = new Map(existing.map((project) => [project.slug, project]));
  const pending = framerProjects.filter((project) => !existingBySlug.has(project.slug));

  for (const project of framerProjects) {
    const existingProject = existingBySlug.get(project.slug);
    projectIds.set(
      project.slug,
      existingProject?._id.replace(/^drafts\./, "") || randomUUID()
    );
  }

  console.log(
    `${framerProjects.length} source projects; ${existing.length} already in Sanity; ${pending.length} drafts to create.`
  );
  if (!apply || pending.length === 0) {
    if (existing.length) await verifyImportedProjects();
    if (!apply) console.log("Dry run only. Pass --apply to upload images and create drafts.");
    return;
  }

  const drafts: ProjectDraft[] = [];
  for (const project of pending) {
    const document: ProjectDraft = {
      _id: `drafts.${projectIds.get(project.slug)}`,
      _type: "project",
      title: project.title || project.slug,
      slug: { _type: "slug", current: project.slug },
      category: project.category,
      role: project.role,
      year: Number(project.year),
      designer: project.designer,
      contribution: project.contribution,
      prototypeUrl: project.prototypeUrl,
      tags: Array.isArray(project.tags)
        ? project.tags
        : project.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) || [],
      software: typeof project.software === "string"
        ? project.software.split(",").map((item) => item.trim()).filter(Boolean)
        : project.software || [],
      summary: project.summary,
      body: project.body,
      featured: Boolean(project.featured),
      moreWork: project.moreWork,
      sort: project.sort,
    };

    const attachImage = async (src?: string) => {
      if (!src) return undefined;
      return uploadImage(project, src);
    };

    const cover = await attachImage(project.cover);
    if (cover) document.cover = cover;
    const hero = await attachImage(project.hero);
    if (hero) document.hero = hero;

    if (project.devices?.length) {
      document.devices = await Promise.all(
        project.devices.map(async (device) => ({
          _key: randomUUID().replaceAll("-", ""),
          _type: "projectDevice",
          label: device.label,
          image: await uploadImage(project, device.src),
        }))
      );
    }

    if (project.video?.src && /^https?:\/\//i.test(project.video.src)) {
      document.video = {
        _type: "projectVideo",
        src: project.video.src,
        label: project.video.label,
        poster: await attachImage(project.video.poster),
      };
    } else if (project.video?.src) {
      console.warn(
        `Omitting non-URL video source for ${project.slug}; the local video file is not present in public/projects.`
      );
    }

    if (project.shortVideo?.src && /^https?:\/\//i.test(project.shortVideo.src)) {
      document.shortVideo = {
        _type: "projectVideo",
        src: project.shortVideo.src,
        label: project.shortVideo.label,
        poster: await attachImage(project.shortVideo.poster),
      };
    }

    if (project.gallery?.length) {
      document.gallery = await Promise.all(
        project.gallery.map(async (item) => {
          const src = typeof item === "string" ? item : item.src;
          return {
            _key: randomUUID().replaceAll("-", ""),
            _type: "projectGalleryItem",
            image: await uploadImage(project, src),
            alt: typeof item === "string" ? "" : item.alt,
            layout: typeof item === "string" ? "full" : item.layout || "full",
          };
        })
      );
    }

    if (project.nextProjectSlug) {
      const targetId = projectIds.get(project.nextProjectSlug);
      if (!targetId) {
        throw new Error(
          `Unknown next project "${project.nextProjectSlug}" referenced by ${project.slug}.`
        );
      }
      document.nextProject = {
        _type: "reference",
        _ref: targetId,
        _weak: true,
      };
    }

    drafts.push(document);
    console.log(`Prepared draft: ${project.title}`);
  }

  for (const draft of drafts) {
    await client.create(draft);
    console.log(`Created draft: ${String(draft.title)}`);
  }
  console.log(`Created ${drafts.length} project drafts and uploaded ${imageAssets.size} unique images.`);
  await verifyImportedProjects();
}

async function verifyImportedProjects() {
  const slugs = framerProjects.map((project) => project.slug);
  const imported = await client
    .withConfig({ perspective: "raw" })
    .fetch<ImportedProject[]>(
      '*[_type == "project" && slug.current in $slugs]{_id, title, slug, cover{asset}, hero{asset}, devices[]{image{asset}}, gallery[]{image{asset}}, video{poster{asset}}, shortVideo{poster{asset}}}',
      { slugs }
    );
  const drafts = imported.filter((project) => project._id.startsWith("drafts."));
  const importedSlugs = new Set(drafts.map((project) => project.slug.current));
  const missing = slugs.filter((slug) => !importedSlugs.has(slug));
  if (missing.length) throw new Error(`Sanity draft verification failed; missing: ${missing.join(", ")}`);

  const assetIds = new Set<string>();
  for (const project of drafts) {
    const references = [
      project.cover?.asset?._ref,
      project.hero?.asset?._ref,
      ...(project.devices || []).map((device) => device.image?.asset?._ref),
      ...(project.gallery || []).map((item) => item.image?.asset?._ref),
      project.video?.poster?.asset?._ref,
      project.shortVideo?.poster?.asset?._ref,
    ];
    for (const id of references) if (id) assetIds.add(id);
  }

  const assets = await client
    .withConfig({ perspective: "raw" })
    .fetch<Array<{ _id: string }>>(
      '*[_type == "sanity.imageAsset" && _id in $assetIds]{_id}',
      { assetIds: [...assetIds] }
    );
  const foundAssets = new Set(assets.map((asset) => asset._id));
  const missingAssets = [...assetIds].filter((id) => !foundAssets.has(id));
  if (missingAssets.length) {
    throw new Error(`Sanity image verification failed; missing asset IDs: ${missingAssets.join(", ")}`);
  }

  const resolvedProjects = await client
    .withConfig({ perspective: "drafts" })
    .fetch<Array<{ slug: string; nextProjectSlug?: string }>>(
      '*[_type == "project" && slug.current in $slugs]{"slug": slug.current, "nextProjectSlug": nextProject->slug.current}',
      { slugs }
    );
  const resolvedBySlug = new Map(
    resolvedProjects.map((project) => [project.slug, project.nextProjectSlug])
  );
  const unresolved = framerProjects.filter(
    (project) =>
      project.nextProjectSlug &&
      resolvedBySlug.get(project.slug) !== project.nextProjectSlug
  );
  if (unresolved.length) {
    throw new Error(
      `Sanity next-project references did not resolve for: ${unresolved.map((project) => project.slug).join(", ")}`
    );
  }

  console.log(
    `Verified ${drafts.length} project drafts, ${foundAssets.size} image assets, and next-project references.`
  );
}

createDrafts().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
