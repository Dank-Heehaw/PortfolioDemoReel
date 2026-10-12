import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('archiveItem').title('Archive'),
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            'project',
            'projectDevice',
            'projectGalleryItem',
            'projectVideo',
            'archiveItem',
            'journalGalleryItem',
            'post',
            'category',
            'author',
          ].includes(item.getId()!),
      ),
    ])
