import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

export const projectDeviceType = defineType({
  name: 'projectDevice',
  title: 'Project device image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({name: 'label', type: 'string'}),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'label', media: 'image'},
  },
})
