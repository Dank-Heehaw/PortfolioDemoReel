import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default defineConfig({
  name: "default",
  title: "GraveyeardShift",
  projectId: projectId || "00000000",
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("journalPost").title("Journal"),
            S.documentTypeListItem("archiveImage").title("Archive"),
          ]),
    }),
    presentationTool({
      previewUrl: {
        initial: siteUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
    }),
  ],
  schema: { types: schemaTypes },
});
