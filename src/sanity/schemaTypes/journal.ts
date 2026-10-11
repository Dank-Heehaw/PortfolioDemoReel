import { defineArrayMember, defineField, defineType } from "sanity";

export const journalPost = defineType({
  name: "journalPost",
  title: "Journal",
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
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({ name: "date", type: "date" }),
    defineField({
      name: "cover",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "externalUrl", type: "url" }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "body", type: "text", rows: 12 }),
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
              options: {
                list: [
                  { title: "Full width", value: "full" },
                  { title: "Half width", value: "half" },
                ],
              },
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
    select: { title: "title", subtitle: "category", media: "cover" },
  },
});
