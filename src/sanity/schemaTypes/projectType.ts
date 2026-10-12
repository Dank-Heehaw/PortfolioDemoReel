import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: DocumentIcon,
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
      title: 'Project title',
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
      title: 'Project type',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'role', type: 'string'}),
    defineField({
      name: 'year',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1900).max(2200),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({name: 'summary', type: 'text', rows: 3}),
    defineField({name: 'body', title: 'Case study introduction', type: 'text', rows: 6}),
    defineField({
      name: 'cover',
      title: 'Index cover',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({
      name: 'hero',
      title: 'Case study hero image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({
      name: 'devices',
      type: 'array',
      of: [defineArrayMember({type: 'projectDevice'})],
    }),
    defineField({
      name: 'video',
      type: 'projectVideo',
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [defineArrayMember({type: 'projectGalleryItem'})],
    }),
    defineField({name: 'featured', type: 'boolean', initialValue: false}),
    defineField({name: 'moreWork', title: 'Show in related projects', type: 'boolean'}),
    defineField({
      name: 'sort',
      title: 'Manual sort order',
      description: 'Optional; lower numbers appear first.',
      type: 'number',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'cover'},
  },
})
