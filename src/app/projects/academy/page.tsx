import type { Metadata } from 'next';
import AcademyProject from '@/app/projects/academy/AcademyProject';

export const metadata: Metadata = {
  title: 'yesterday Academy | Thimofej Zapko',
  description: 'My frontend contribution to yesterday Academy, from the mission catalog and chat to the final document. A team project with an automatic product demo.',
  alternates: { canonical: '/projects/academy', languages: { de: '/de/projects/academy', en: '/projects/academy', 'x-default': '/projects/academy' } },
  openGraph: { locale: 'en_US', url: '/projects/academy' },
};

export default function EnglishAcademyProject() {
  return <AcademyProject locale="en" />;
}
