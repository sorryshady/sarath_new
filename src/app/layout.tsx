import type { Metadata } from 'next';

import { fontVariables } from '@/lib/fonts';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL('https://sarathmenonfilms.com'),
};
