import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroVideoProvider',
      title: 'Hero showreel host',
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
      name: 'heroVideoId',
      title: 'Hero showreel video ID',
      type: 'string',
      description: 'Vimeo or YouTube ID — not the full URL.',
    }),
    defineField({
      name: 'heroVimeoId',
      title: 'Hero Vimeo ID (legacy)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'heroPoster',
      title: 'Hero poster image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'photographerLabel',
      title: 'Photographer label',
      type: 'string',
      initialValue: 'Photographer',
    }),
    defineField({
      name: 'filmmakerLabel',
      title: 'Filmmaker label',
      type: 'string',
      initialValue: 'Filmmaker',
    }),
    defineField({
      name: 'lfsCredit',
      title: 'LFS credit line',
      type: 'string',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact phone',
      type: 'string',
    }),
    defineField({
      name: 'contactLocation',
      title: 'Contact location',
      type: 'string',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'Vimeo URL',
      type: 'url',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    defineField({
      name: 'seoTitle',
      title: 'Default SEO title',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default SEO description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      title: 'Default OG image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
