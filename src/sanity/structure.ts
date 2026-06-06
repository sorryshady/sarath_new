import type { StructureResolver } from 'sanity/structure';

const singleton = (
  S: Parameters<StructureResolver>[0],
  typeName: string,
  title: string,
) =>
  S.listItem()
    .title(title)
    .id(typeName)
    .child(S.document().schemaType(typeName).documentId(typeName));

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site')
        .child(
          S.list()
            .title('Site')
            .items([
              singleton(S, 'siteSettings', 'Site Settings'),
              singleton(S, 'aboutTeaser', 'About Teaser'),
              singleton(S, 'poetryTeaser', 'Poetry Teaser'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Photography')
        .child(
          S.documentTypeList('photoSeries')
            .title('Photo Series')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Films')
        .child(
          S.documentTypeList('film')
            .title('Films')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Poetry')
        .child(
          S.documentTypeList('poem')
            .title('Poems')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
    ]);
