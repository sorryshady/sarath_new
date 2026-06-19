export type PoetryTeaser = {
  excerptLines?: string[] | null;
  title?: string | null;
  year?: string | null;
  /** Linked poem body — used to derive excerpt lines when none are set. */
  bodyFallback?: string | null;
};
