import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "logo",
      title: "Logo",
      description: "Default mark in the top bar. Leave empty to keep the built-in SVG.",
      type: "image",
    }),
    defineField({
      name: "logoHover",
      title: "Logo, hover",
      type: "image",
    }),
    defineField({
      name: "logoMenu",
      title: "Logo, menu open",
      type: "image",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
