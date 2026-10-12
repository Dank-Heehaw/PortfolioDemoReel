import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

export const journalGalleryItemType = defineType({
  name: 'journalGalleryItem',
  title: 'Journal gallery image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'alt', title: 'Alternative text', type: 'string'}),
    defineField({
      name: 'layout',
      type: 'string',
      options: {
        list: [
          {title: 'Full width', value: 'full'},
          {title: 'Half width', value: 'half'},
        ],
        layout: 'radio',
      },
      initialValue: 'full',
    }),
  ],
  preview: {
    select: {title: 'alt', subtitle: 'layout', media: 'image'},
  },
})
