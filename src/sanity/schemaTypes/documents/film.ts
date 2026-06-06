import { defineField, defineType } from 'sanity';

export const film = defineType({
  name: 'film',
  title: 'Film',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'videoProvider',
      title: 'Video host',
      type: 'string',
      options: {
        list: [
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'YouTube', value: 'youtube' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
      description:
        'Vimeo numeric ID (e.g. 409444661) or YouTube ID (e.g. dQw4w9WgXcQ) — not the full URL.',
    }),
    defineField({
      name: 'vimeoId',
      title: 'Vimeo ID (legacy)',
      type: 'string',
      hidden: true,
      description: 'Deprecated — use Video host + Video ID instead.',
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube ID (legacy)',
      type: 'string',
      hidden: true,
      description: 'Deprecated — use Video host + Video ID instead.',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Director', value: 'director' },
          { title: 'Director of Photography', value: 'dop' },
          { title: 'Screenwriter', value: 'screenwriter' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'award',
      title: 'Award',
      type: 'string',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on home',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Sort order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', media: 'thumbnail', subtitle: 'year' },
  },
});
