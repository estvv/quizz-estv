export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  /** Counts exercises. Name kept for the components that already read it. */
  question_count: number;
  flashcard_count: number;
  /** The body is fetched separately  a lesson is too long to ride in the list. */
  has_lesson: boolean;
}

export type ExerciseType =
  | 'mcq'
  | 'type_answer'
  | 'vocab'
  | 'order_steps'
  | 'write_algorithm'
  | 'flowchart_build'
  | 'er_build';

export interface McqPayload {
  choices: string[];
  correct: number;
  hint?: string;
}

export interface TypeAnswerPayload {
  accept: string[];
  placeholder?: string;
  hint?: string;
  normalize?: 'loose' | 'romaja';
}

export interface VocabPayload {
  ko: string;
  rr: string;
  rr_accept?: string[];
  fr: string[];
  hint: string[];
}

export interface OrderStepsPayload {
  items: string[];
  solution: number[];
}

export interface WriteAlgorithmPayload {
  steps: string[][];
  hint?: string;
}

export type FlowchartKind = 'start' | 'end' | 'io' | 'process' | 'decision';

export interface FlowchartNode {
  id: string;
  kind: FlowchartKind;
  label: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  branch?: 'yes' | 'no';
}

export interface FlowchartGraph {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface FlowchartBuildPayload {
  target: FlowchartGraph;
  hint?: string;
}

// E-R diagrams have their own legend: rectangles for entities, diamonds for
// relationships, ovals for attributes  doubled or dashed for the weak /
// multi-valued / derived variants. Nothing to do with the flowchart shapes.
export type ErKind =
  | 'entity'
  | 'weak_entity'
  | 'associative_entity'
  | 'relationship'
  | 'identifying_relationship'
  | 'attribute'
  | 'key_attribute'
  | 'multi_attribute'
  | 'derived_attribute';

export interface ErNode {
  id: string;
  kind: ErKind;
  label: string;
}

/** E-R lines carry no direction  `from`/`to` are compared unordered. `card` is
 *  the cardinality written on the line ("1", "N", "M"). */
export interface ErEdge {
  from: string;
  to: string;
  card?: string;
}

export interface ErGraph {
  nodes: ErNode[];
  edges: ErEdge[];
}

export interface ErBuildPayload {
  target: ErGraph;
  hint?: string;
}

export interface McqExercise {
  id: number;
  category_id: number;
  type: 'mcq';
  prompt: string;
  payload: McqPayload;
  explanation: string | null;
  diagram_svg: string | null;
  position: number;
}

export interface TypeAnswerExercise {
  id: number;
  category_id: number;
  type: 'type_answer';
  prompt: string;
  payload: TypeAnswerPayload;
  explanation: string | null;
  diagram_svg: string | null;
  position: number;
}

interface BaseExercise {
  id: number;
  category_id: number;
  prompt: string;
  explanation: string | null;
  diagram_svg: string | null;
  position: number;
}

export interface VocabExercise extends BaseExercise {
  type: 'vocab';
  payload: VocabPayload;
}

export interface OrderStepsExercise extends BaseExercise {
  type: 'order_steps';
  payload: OrderStepsPayload;
}

export interface WriteAlgorithmExercise extends BaseExercise {
  type: 'write_algorithm';
  payload: WriteAlgorithmPayload;
}

export interface FlowchartBuildExercise extends BaseExercise {
  type: 'flowchart_build';
  payload: FlowchartBuildPayload;
}

export interface ErBuildExercise extends BaseExercise {
  type: 'er_build';
  payload: ErBuildPayload;
}

export type Exercise =
  | McqExercise
  | TypeAnswerExercise
  | VocabExercise
  | OrderStepsExercise
  | WriteAlgorithmExercise
  | FlowchartBuildExercise
  | ErBuildExercise;

export interface ExerciseBrief {
  id: number;
  category_id: number;
  type: ExerciseType;
  prompt: string;
}

export interface Flashcard {
  id: number;
  category_id: number;
  front: string;
  back: string;
  position: number;
  created_at: string;
  updated_at: string;
}

/** A flashcard as shown in a session, whichever source it came from. */
export interface StudyCard {
  key: string;
  front: string;
  back: string;
}
