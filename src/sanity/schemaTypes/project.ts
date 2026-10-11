import { defineArrayMember, defineField, defineType } from "sanity";

const layoutOptions = [
  { title: "Full width", value: "full" },
  { title: "Half width", value: "half" },
];

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "category", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "year", type: "string" }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "body", type: "text", rows: 8 }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({ name: "moreWork", type: "boolean", initialValue: true }),
    defineField({ name: "sort", type: "number" }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "hero",
      title: "Hero",
      description: "Large image at the top of the case study. Upload a file here.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "devices",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "image", type: "image", options: { hotspot: true } }),
            defineField({ name: "label", type: "string" }),
          ],
          preview: {
            select: { title: "label", media: "image" },
          },
        }),
      ],
    }),
    defineField({
      name: "video",
      type: "object",
      fields: [
        defineField({ name: "file", type: "file", options: { accept: "video/*" } }),
        defineField({ name: "poster", type: "image", options: { hotspot: true } }),
        defineField({ name: "label", type: "string" }),
      ],
    }),
    defineField({
      name: "gallery",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "image", type: "image", options: { hotspot: true } }),
            defineField({ name: "alt", type: "string" }),
            defineField({
              name: "layout",
              type: "string",
              options: { list: layoutOptions },
              initialValue: "full",
            }),
          ],
          preview: {
            select: { title: "alt", media: "image" },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "hero" },
  },
});
