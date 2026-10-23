import type { Metadata } from 'next';
import { OrbitHome } from '@/components/orbit-preview/OrbitHome';

export const metadata: Metadata = {
  title: 'Thimofej Zapko · Seitenvorschau',
  description: 'Eine persönliche Seite von Thimofej Zapko.',
  robots: { index: false, follow: false },
};
export default function HomePreview() {
  return <OrbitHome/>;
}
