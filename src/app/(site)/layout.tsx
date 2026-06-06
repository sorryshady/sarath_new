import type { Metadata } from 'next';

import { PaperGrain } from '@/components/global/PaperGrain';
import { GSAPProvider } from '@/components/providers/GSAPProvider';
import { LenisProvider } from '@/components/providers/LenisProvider';

import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Sarath Menon',
    template: '%s · Sarath Menon',
  },
  description:
    'Photographer, filmmaker, and poet — visual stories across cinema and stills.',
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="site-root min-h-full flex flex-col">
      <GSAPProvider>
        <LenisProvider>
          {children}
          <PaperGrain />
        </LenisProvider>
      </GSAPProvider>
    </div>
  );
}
