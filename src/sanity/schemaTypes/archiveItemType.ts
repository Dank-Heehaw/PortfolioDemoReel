import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

export const archiveItemType = defineType({
  name: 'archiveItem',
  title: 'Archive item',
  type: 'document',
  icon: ImageIcon,
  orderings: [
    {
      title: 'Year, newest first',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}, {field: 'title', direction: 'asc'}],
    },
    {
      title: 'Custom order',
      name: 'sortAsc',
      by: [{field: 'sort', direction: 'asc'}, {field: 'title', direction: 'asc'}],
    },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      description: 'Used by the Archive filters.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'medium', type: 'string'}),
    defineField({
      name: 'year',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1900).max(2200),
    }),
    defineField({
      name: 'cover',
      title: 'Archive image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'sort', title: 'Manual sort order', type: 'number'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'cover'},
  },
})
