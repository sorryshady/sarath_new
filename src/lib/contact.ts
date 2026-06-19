import { defineQuery } from 'next-sanity';

import { client, isSanityConfigured } from '@/sanity/lib/client';
import type { ContactSettings } from '@/types/contact';

const contactSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  contactEmail,
  contactPhone,
  contactLocation,
  instagramUrl,
  vimeoUrl,
  linkedinUrl
}`);

export async function getContactSettings(): Promise<ContactSettings | null> {
  if (!isSanityConfigured) return null;
  try {
    return await client.fetch(contactSettingsQuery);
  } catch {
    return null;
  }
}
