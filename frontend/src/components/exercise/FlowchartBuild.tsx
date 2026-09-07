import { Suspense, lazy } from 'react';
import type { FlowchartBuildExercise } from '../../types';
import type { Response } from '../../utils/grade';

// react-flow + its d3 deps are heavy and only the flowchart builder needs them.
const FlowchartBuildInner = lazy(() => import('./FlowchartBuildInner'));

interface Props {
  exercise: FlowchartBuildExercise;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

export function FlowchartBuild(props: Props) {
  return (
    <Suspense
      fallback={<p className="text-sm text-neutral-400">Chargement de l'éditeur…</p>}
    >
      <FlowchartBuildInner {...props} />
    </Suspense>
  );
}
