import { Suspense, lazy } from 'react';
import type { ErBuildExercise } from '../../types';
import type { Response } from '../../utils/grade';

// Same react-flow chunk as the flowchart builder: only these two need it.
const ErBuildInner = lazy(() => import('./ErBuildInner'));

interface Props {
  exercise: ErBuildExercise;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

export function ErBuild(props: Props) {
  return (
    <Suspense
      fallback={<p className="text-sm text-neutral-400">Chargement de l'éditeur…</p>}
    >
      <ErBuildInner {...props} />
    </Suspense>
  );
}
