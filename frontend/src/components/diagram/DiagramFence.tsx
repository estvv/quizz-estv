import { useMemo } from 'react';
import { BlockDiagram, type BlockSpec } from './BlockDiagram';
import { ErDiagram, type ErDiagramSpec } from './ErDiagram';

/**
 * A ```er or ```diagram fenced block in a lesson. The seed already refuses a
 * lesson whose fence is not valid JSON, so the error box here only ever shows
 * up while authoring.
 */
export function DiagramFence({ lang, source }: { lang: 'er' | 'diagram'; source: string }) {
  const parsed = useMemo(() => {
    try {
      return { spec: JSON.parse(source) as unknown, error: null };
    } catch (e) {
      return { spec: null, error: (e as Error).message };
    }
  }, [source]);

  if (parsed.error !== null) {
    return (
      <pre className="whitespace-pre-wrap rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700">
        Bloc ```{lang} invalide : {parsed.error}
      </pre>
    );
  }
  return lang === 'er' ? (
    <ErDiagram spec={parsed.spec as ErDiagramSpec} />
  ) : (
    <BlockDiagram spec={parsed.spec as BlockSpec} />
  );
}
