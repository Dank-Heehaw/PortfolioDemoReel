import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {projectType} from './projectType'
import {projectDeviceType} from './projectDeviceType'
import {projectGalleryItemType} from './projectGalleryItemType'
import {projectVideoType} from './projectVideoType'
import {archiveItemType} from './archiveItemType'
import {journalGalleryItemType} from './journalGalleryItemType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    projectType,
    projectDeviceType,
    projectGalleryItemType,
    projectVideoType,
    archiveItemType,
    journalGalleryItemType,
  ],
}
