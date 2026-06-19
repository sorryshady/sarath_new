import { Anton, Cormorant_Garamond } from 'next/font/google';

/**
 * Site typography — matches reference files/design-tokens.css
 *
 * --font-display:   Anton (hero/contact display only)
 * --font-editorial: Cormorant Garamond (headings, editorial copy, preloader counter)
 * --font-data:      Courier New (system monospace — no import needed, set in tokens.css)
 */
export const anton = Anton({
  variable: '--font-anton',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const fontVariables = `${anton.variable} ${cormorant.variable}`;
