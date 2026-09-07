import type { Exercise } from '../../types';
import type { Response } from '../../utils/grade';
import { McqExercise } from './McqExercise';
import { TypeAnswerExercise } from './TypeAnswerExercise';
import { VocabExercise } from './VocabExercise';
import { OrderStepsExercise } from './OrderStepsExercise';
import { WriteAlgorithmExercise } from './WriteAlgorithmExercise';
import { FlowchartBuild } from './FlowchartBuild';

interface Props {
  exercise: Exercise;
  revealed: boolean;
  /** Called once, when the user commits their answer. */
  onCommit: (response: Response) => void;
}

// Dispatches on exercise.type. Each sub-component owns its own input state and is
// remounted per exercise (key on the caller), so the session page stays generic.
export function ExerciseCard({ exercise, revealed, onCommit }: Props) {
  switch (exercise.type) {
    case 'mcq':
      return <McqExercise exercise={exercise} revealed={revealed} onCommit={onCommit} />;
    case 'type_answer':
      return <TypeAnswerExercise exercise={exercise} revealed={revealed} onCommit={onCommit} />;
    case 'vocab':
      return <VocabExercise exercise={exercise} revealed={revealed} onCommit={onCommit} />;
    case 'order_steps':
      return <OrderStepsExercise exercise={exercise} revealed={revealed} onCommit={onCommit} />;
    case 'write_algorithm':
      return <WriteAlgorithmExercise exercise={exercise} revealed={revealed} onCommit={onCommit} />;
    case 'flowchart_build':
      return <FlowchartBuild exercise={exercise} revealed={revealed} onCommit={onCommit} />;
  }
}
