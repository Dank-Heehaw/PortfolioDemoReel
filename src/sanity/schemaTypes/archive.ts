import { defineField, defineType } from "sanity";

export const archiveImage = defineType({
  name: "archiveImage",
  title: "Archive image",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: [
          { title: "ART", value: "ART" },
          { title: "3D", value: "3D" },
          { title: "Graphics", value: "Graphics" },
          { title: "UX", value: "UX" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "medium", type: "string" }),
    defineField({ name: "year", type: "string" }),
  ],
  preview: {
    select: { title: "alt", subtitle: "category", media: "image" },
  },
});
