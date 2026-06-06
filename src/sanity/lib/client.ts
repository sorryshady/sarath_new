import { createClient } from 'next-sanity';

import { apiVersion, dataset, isSanityConfigured, projectId } from '../env';

export const client = createClient({
  projectId: projectId ?? 'unconfigured',
  dataset,
  apiVersion,
  useCdn: true,
});

export { isSanityConfigured };
