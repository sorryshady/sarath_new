import { defineField, defineType } from 'sanity';

export const aboutTeaser = defineType({
  name: 'aboutTeaser',
  title: 'About Teaser',
  type: 'document',
  fields: [
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'portraitCaption',
      title: 'Portrait caption',
      type: 'string',
    }),
    defineField({
      name: 'bioText',
      title: 'Bio text',
      type: 'text',
      rows: 8,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'About Teaser' }),
  },
});
