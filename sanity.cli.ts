import { defineCliConfig } from 'sanity/cli';

import { dataset, projectId } from './src/sanity/env';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  /** Hosted Studio target — `sanity deploy` publishes to <studioHost>.sanity.studio */
  studioHost: 'sarathmenonfilms',
  /** Pin the deployed Studio application so future deploys don't re-prompt. */
  deployment: {
    appId: 'gfplg6ibqysld57517vajoqv',
  },
});
