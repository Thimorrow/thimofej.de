import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import NotFoundExperience from './not-found-experience';
import styles from './not-found.module.css';

const copy = {
  en: {
    label: 'Page not found.',
    firstLine: 'A little',
    secondLine: 'off course.',
    home: 'Back home',
    homeHref: '/',
    title: 'Page not found | Thimofej Zapko',
  },
  de: {
    label: 'Seite nicht gefunden.',
    firstLine: 'Kurz aus',
    secondLine: 'der Umlaufbahn.',
    home: 'Zur Startseite',
    homeHref: '/de',
    title: 'Seite nicht gefunden | Thimofej Zapko',
  },
} as const;

async function getCopy() {
  const locale = (await headers()).get('x-site-locale') === 'de' ? 'de' : 'en';
  return { locale, text: copy[locale] };
}

export async function generateMetadata(): Promise<Metadata> {
  const { text } = await getCopy();
  return { title: text.title, description: text.label, robots: { index: false, follow: true } };
}

export default async function NotFound() {
  const { locale, text } = await getCopy();

  return (
    <div className={styles.page} lang={locale}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href={text.homeHref} aria-label={`Thimofej, ${text.home}`}>
          thimofej.
        </Link>
      </header>
      <NotFoundExperience text={text} />
    </div>
  );
}
