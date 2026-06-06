import { defineField, defineType } from 'sanity';

export const poetryTeaser = defineType({
  name: 'poetryTeaser',
  title: 'Poetry Teaser',
  type: 'document',
  fields: [
    defineField({
      name: 'excerptLines',
      title: 'Excerpt lines',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'linkedPoem',
      title: 'Linked poem',
      type: 'reference',
      to: [{ type: 'poem' }],
    }),
    defineField({
      name: 'poemTitle',
      title: 'Poem title override',
      type: 'string',
    }),
    defineField({
      name: 'poemYear',
      title: 'Poem year',
      type: 'string',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Poetry Teaser' }),
  },
});
