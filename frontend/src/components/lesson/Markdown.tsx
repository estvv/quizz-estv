import { Suspense, lazy } from 'react';

// react-markdown and its rehype/remark plugins are ~340 kB  more than the rest
// of the app put together  and only the lesson page and the admin's lesson tab
// ever render Markdown. Loading it on demand keeps that weight off the landing,
// category and quiz paths.
const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));

export function Markdown({ children }: { children: string }) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-400">Chargement de la leçon...</p>}>
      <MarkdownRenderer>{children}</MarkdownRenderer>
    </Suspense>
  );
}
