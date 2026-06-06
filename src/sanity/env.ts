/** Direct process.env access — required so Next.js inlines NEXT_PUBLIC_* on the client. */
function trimOrUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const apiVersion =
  trimOrUndefined(process.env.NEXT_PUBLIC_SANITY_API_VERSION) ?? '2025-01-01';

export const dataset =
  trimOrUndefined(process.env.NEXT_PUBLIC_SANITY_DATASET) ?? 'production';

export const projectId = trimOrUndefined(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);

export const isSanityConfigured = Boolean(projectId);
