import type { Metadata } from 'next';
import { HomeContent } from '@/components/orbit-preview/HomeContent';

export const metadata: Metadata = {
  description: 'Thimofej Zapko, also known as Thimorrow. I build frontends and work with the yesterday team on Academy.',
  alternates: { canonical: '/', languages: { de: '/de', en: '/', 'x-default': '/' } },
  openGraph: { type: 'website', siteName: 'Thimofej Zapko', locale: 'en_US', url: '/' },
};

export default function EnglishHome() {
  return <HomeContent locale="en" />;
}
