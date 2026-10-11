/**
 * Create Directus collections this portfolio expects.
 * Uses DIRECTUS_URL + DIRECTUS_TOKEN from .env (same as ADMIN_TOKEN on first boot).
 *
 *   npm run cms:schema
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(pathname) {
  if (!existsSync(pathname)) return;
  const text = readFileSync(pathname, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

const base = String(process.env.DIRECTUS_URL || "http://localhost:8055").replace(/\/+$/, "");
const token = String(process.env.DIRECTUS_TOKEN || process.env.ADMIN_TOKEN || "").trim();

if (!token) {
  console.error("Missing DIRECTUS_TOKEN. Copy .env.example to .env first.");
  process.exit(1);
}

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json?.errors || json)}`);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

async function waitForDirectus(tries = 30) {
  for (let i = 1; i <= tries; i += 1) {
    try {
      const res = await fetch(`${base}/server/health`);
      if (res.ok) return;
    } catch {
      // still booting
    }
    process.stdout.write(`Waiting for Directus at ${base} (${i}/${tries})...\n`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(
    `Directus did not become ready at ${base}. Is Docker running? Try: docker compose up -d`
  );
}

function pk() {
  return {
    field: "id",
    type: "uuid",
    meta: { hidden: true, interface: "input", special: ["uuid"] },
    schema: { is_primary_key: true, length: 36 },
  };
}

function statusField() {
  return {
    field: "status",
    type: "string",
    meta: {
      width: "half",
      interface: "select-dropdown",
      display: "labels",
      options: {
        choices: [
          { text: "Published", value: "published" },
          { text: "Draft", value: "draft" },
        ],
      },
    },
    schema: { default_value: "published" },
  };
}

function sortField() {
  return {
    field: "sort",
    type: "integer",
    meta: { interface: "input", width: "half", hidden: true, special: ["sort"] },
    schema: {},
  };
}

function str(field, extra = {}) {
  return {
    field,
    type: "string",
    meta: { interface: "input", width: extra.width || "full", required: Boolean(extra.required) },
    schema: extra.unique ? { is_unique: true } : {},
  };
}

function text(field, extra = {}) {
  return {
    field,
    type: "text",
    meta: { interface: extra.markdown ? "input-rich-text-md" : "input-multiline", width: "full" },
    schema: {},
  };
}

function bool(field) {
  return {
    field,
    type: "boolean",
    meta: { interface: "boolean", width: "half" },
    schema: { default_value: false },
  };
}

function json(field) {
  return {
    field,
    type: "json",
    meta: { interface: "input-code", options: { language: "json" }, width: "full" },
    schema: {},
  };
}

function fileAny(field) {
  return {
    field,
    type: "uuid",
    meta: { interface: "file", special: ["file"], width: "half" },
    schema: {},
  };
}

function fileImage(field) {
  return {
    field,
    type: "uuid",
    meta: { interface: "file-image", special: ["file"], display: "image", width: "half" },
    schema: {},
  };
}

const COLLECTIONS = [
  {
    collection: "projects",
    meta: {
      icon: "work",
      display_template: "{{title}}",
      sort_field: "sort",
      archive_field: "status",
      archive_value: "draft",
      unarchive_value: "published",
    },
    fields: [
      pk(),
      statusField(),
      sortField(),
      str("slug", { required: true, unique: true, width: "half" }),
      str("title", { required: true, width: "half" }),
      str("category", { width: "half" }),
      str("role", { width: "half" }),
      str("year", { width: "half" }),
      json("tags"),
      text("summary"),
      text("body"),
      bool("featured"),
      bool("more_work"),
      str("asset_dir", { width: "half" }),
      fileImage("cover"),
      fileImage("hero"),
      fileAny("video_file"),
      fileImage("video_poster"),
      json("devices"),
      json("video"),
      json("gallery"),
    ],
  },
  {
    collection: "journal_posts",
    meta: {
      icon: "article",
      display_template: "{{title}}",
      sort_field: "sort",
      archive_field: "status",
      archive_value: "draft",
      unarchive_value: "published",
    },
    fields: [
      pk(),
      statusField(),
      sortField(),
      str("slug", { required: true, unique: true, width: "half" }),
      str("title", { required: true, width: "half" }),
      str("category", { width: "half" }),
      json("tags"),
      {
        field: "date",
        type: "date",
        meta: { interface: "datetime", width: "half" },
        schema: {},
      },
      fileImage("cover"),
      text("summary"),
      text("body", { markdown: true }),
      json("gallery"),
      str("external_url"),
    ],
  },
  {
    collection: "work_categories",
    meta: {
      icon: "category",
      display_template: "{{label}}",
      sort_field: "sort",
      archive_field: "status",
      archive_value: "draft",
      unarchive_value: "published",
    },
    fields: [
      pk(),
      statusField(),
      sortField(),
      str("key", { required: true, unique: true, width: "half" }),
      str("label", { required: true, width: "half" }),
      str("meta"),
      str("project_slug", { width: "half" }),
      fileImage("cover"),
    ],
  },
  {
    collection: "archive_items",
    meta: {
      icon: "inventory_2",
      display_template: "{{title}}",
      sort_field: "sort",
      archive_field: "status",
      archive_value: "draft",
      unarchive_value: "published",
    },
    fields: [
      pk(),
      statusField(),
      sortField(),
      str("slug", { required: true, unique: true, width: "half" }),
      str("title", { required: true, width: "half" }),
      str("category", { width: "half" }),
      str("medium", { width: "half" }),
      str("year", { width: "half" }),
      fileImage("cover"),
    ],
  },
];

async function ensureRelation(collection, field) {
  try {
    await api("/relations", {
      method: "POST",
      body: {
        collection,
        field,
        related_collection: "directus_files",
        schema: { on_delete: "SET NULL" },
        meta: {},
      },
    });
  } catch (error) {
    if (error.status === 400 || error.status === 409) return;
    const msg = String(error.message || "");
    if (msg.includes("already exists") || msg.includes("duplicate")) return;
    throw error;
  }
}

async function ensureField(collection, fieldSpec) {
  try {
    await api(`/fields/${collection}/${fieldSpec.field}`);
    return;
  } catch (error) {
    if (error.status !== 403 && error.status !== 404) throw error;
  }
  try {
    await api(`/fields/${collection}`, { method: "POST", body: fieldSpec });
    console.log(`Added field ${collection}.${fieldSpec.field}`);
  } catch (error) {
    if (error.status === 400 || error.status === 409) return;
    const msg = String(error.message || "");
    if (msg.includes("already exists") || msg.includes("duplicate")) return;
    throw error;
  }
  const special = fieldSpec.meta?.special;
  if (Array.isArray(special) && special.includes("file")) {
    await ensureRelation(collection, fieldSpec.field);
  }
}

async function ensureFilesAlias(collection, field) {
  const junction = `${collection}_${field}`;
  const parentFk = `${collection}_id`;
  await ensureField(collection, {
    field,
    type: "alias",
    meta: { interface: "files", special: ["files"], width: "full" },
  });

  let junctionExists = false;
  try {
    await api(`/collections/${junction}`);
    junctionExists = true;
  } catch (error) {
    if (error.status !== 403 && error.status !== 404) throw error;
  }

  if (!junctionExists) {
    try {
      await api("/collections", {
        method: "POST",
        body: {
          collection: junction,
          meta: { hidden: true, icon: "import_export" },
          schema: {},
          fields: [
            {
              field: "id",
              type: "integer",
              meta: { hidden: true, interface: "input" },
              schema: { is_primary_key: true, has_auto_increment: true },
            },
            { field: parentFk, type: "uuid", schema: {}, meta: { hidden: true } },
            { field: "directus_files_id", type: "uuid", schema: {}, meta: { hidden: true } },
            { field: "sort", type: "integer", schema: {}, meta: { hidden: true } },
          ],
        },
      });
      console.log(`Created junction ${junction}`);
    } catch (error) {
      if (error.status !== 400 && error.status !== 409) throw error;
    }
  }

  const ignoreDup = async (fn) => {
    try {
      await fn();
    } catch (error) {
      if (error.status === 400 || error.status === 409) return;
      const msg = String(error.message || "");
      if (msg.includes("already exists") || msg.includes("duplicate")) return;
      throw error;
    }
  };

  await ignoreDup(() =>
    api("/relations", {
      method: "POST",
      body: {
        collection: junction,
        field: parentFk,
        related_collection: collection,
        schema: { on_delete: "CASCADE" },
        meta: {
          one_field: field,
          one_collection: collection,
          junction_field: "directus_files_id",
          one_deselect_action: "delete",
          sort_field: "sort",
        },
      },
    })
  );

  await ignoreDup(() =>
    api("/relations", {
      method: "POST",
      body: {
        collection: junction,
        field: "directus_files_id",
        related_collection: "directus_files",
        schema: { on_delete: "SET NULL" },
        meta: { junction_field: parentFk },
      },
    })
  );
}

async function publicRoleId() {
  const json = await api("/roles?filter[name][_eq]=Public&limit=1");
  return json.data?.[0]?.id ?? null;
}

async function ensurePublicRead(collection, extra = {}) {
  const role = await publicRoleId();
  const existing = await api(
    `/permissions?filter[collection][_eq]=${encodeURIComponent(collection)}&filter[action][_eq]=read&limit=100`
  );
  const rows = Array.isArray(existing.data) ? existing.data : [];
  if (rows.some((row) => row.role === role || (role == null && row.role == null))) {
    return;
  }
  try {
    await api("/permissions", {
      method: "POST",
      body: {
        role,
        collection,
        action: "read",
        permissions: extra.permissions || {},
        fields: extra.fields || ["*"],
      },
    });
    console.log(`Public read granted on ${collection}`);
  } catch (error) {
    if (error.status === 400 || error.status === 409) return;
    console.warn(`Could not grant public read on ${collection}:`, error.message);
  }
}

async function ensureCollection(spec) {
  let exists = false;
  try {
    await api(`/collections/${spec.collection}`);
    exists = true;
  } catch (error) {
    if (error.status !== 403 && error.status !== 404) throw error;
  }

  if (!exists) {
    await api("/collections", {
      method: "POST",
      body: {
        collection: spec.collection,
        meta: spec.meta,
        schema: {},
        fields: spec.fields,
      },
    });
    console.log(`Created collection ${spec.collection}`);
  } else {
    console.log(`Collection ${spec.collection} already exists`);
  }

  for (const field of spec.fields) {
    const special = field.meta?.special;
    if (Array.isArray(special) && special.includes("file")) {
      await ensureRelation(spec.collection, field.field);
    }
  }
}

async function seedWorkCategories() {
  const existing = await api("/items/work_categories?limit=-1&fields=key");
  const have = new Set((existing.data || []).map((row) => row.key));
  const rows = [
    { key: "ui-ux", label: "UI/UX", meta: "Product & interfaces", project_slug: "nature-cycle", sort: 1, status: "published" },
    { key: "branding", label: "Branding", meta: "Identity systems", project_slug: "hypedocs", sort: 2, status: "published" },
    { key: "motion", label: "Motion", meta: "Moving image", project_slug: "icons", sort: 3, status: "published" },
    { key: "campaigns", label: "Campaigns", meta: "Integrated work", project_slug: "ford", sort: 4, status: "published" },
  ];
  for (const row of rows) {
    if (have.has(row.key)) continue;
    await api("/items/work_categories", { method: "POST", body: row });
    console.log(`Seeded work category ${row.key}`);
  }
}

try {
  await waitForDirectus();
  await api("/users/me");
  for (const spec of COLLECTIONS) {
    await ensureCollection(spec);
  }
  await ensureField("projects", fileAny("video_file"));
  await ensureField("projects", fileImage("video_poster"));
  await ensureFilesAlias("projects", "gallery_files");
  await ensureFilesAlias("journal_posts", "gallery_files");
  await seedWorkCategories();
  const publishedOnly = {
    permissions: { _and: [{ status: { _eq: "published" } }] },
  };
  await ensurePublicRead("directus_files");
  await ensurePublicRead("projects", publishedOnly);
  await ensurePublicRead("journal_posts", publishedOnly);
  await ensurePublicRead("work_categories", publishedOnly);
  await ensurePublicRead("archive_items", publishedOnly);
  console.log(`\nDirectus schema is ready.`);
  console.log(`Admin UI: ${base}`);
  console.log(`Login: ${process.env.ADMIN_EMAIL || "admin@localhost"} / ${process.env.ADMIN_PASSWORD || "admin12345"}`);
  console.log(`Upload images/video in the app — they are served at ${base}/assets/{file-id}`);
  console.log(`Production file bytes: Cloudflare R2 (docs/directus-media.md).`);
} catch (error) {
  if (error.status === 401) {
    console.error(`\n401 from ${base} — the API token does not match this database.`);
    console.error("That usually means an OLD Docker volume from a previous attempt.");
    console.error("Fix (PowerShell):  npm run cms:reset");
    console.error("Then run:          npm run cms:schema");
    process.exit(1);
  }
  console.error(error.message || error);
  process.exit(1);
}
