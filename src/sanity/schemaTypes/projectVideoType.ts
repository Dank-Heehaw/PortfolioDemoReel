import {PlayIcon} from '@sanity/icons/Play'
import {defineField, defineType} from 'sanity'

export const projectVideoType = defineType({
  name: 'projectVideo',
  title: 'Project video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'src',
      title: 'YouTube or video URL',
      description: 'Paste a YouTube link or hosted video URL. Do not upload video files to Sanity.',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({name: 'label', type: 'string'}),
  ],
})
