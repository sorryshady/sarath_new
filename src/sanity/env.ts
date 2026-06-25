/** Direct process.env access — required so Next.js inlines NEXT_PUBLIC_* on the client. */
function trimOrUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

// NEXT_PUBLIC_* are inlined by Next for the embedded /studio route. A standalone
// `sanity deploy` (Vite) only exposes SANITY_STUDIO_*-prefixed vars, so each value
// falls back to its SANITY_STUDIO_ counterpart for the hosted Studio build.
export const apiVersion =
  trimOrUndefined(process.env.NEXT_PUBLIC_SANITY_API_VERSION) ??
  trimOrUndefined(process.env.SANITY_STUDIO_API_VERSION) ??
  '2025-01-01';

export const dataset =
  trimOrUndefined(process.env.NEXT_PUBLIC_SANITY_DATASET) ??
  trimOrUndefined(process.env.SANITY_STUDIO_DATASET) ??
  'production';

export const projectId =
  trimOrUndefined(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) ??
  trimOrUndefined(process.env.SANITY_STUDIO_PROJECT_ID);

export const isSanityConfigured = Boolean(projectId);
