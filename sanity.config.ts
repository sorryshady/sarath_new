'use client';

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { dataset, projectId } from './src/sanity/env';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

export default defineConfig({
  // Embedded Next route lives at /studio; the hosted Studio is served at the
  // subdomain root, where SANITY_STUDIO_BASEPATH=/ overrides this.
  basePath: process.env.SANITY_STUDIO_BASEPATH ?? '/studio',
  projectId: projectId!,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
