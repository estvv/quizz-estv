import type { Figure } from '../../types';
import { BlockDiagram, type BlockSpec } from './BlockDiagram';
import { ErDiagram, type ErDiagramSpec } from './ErDiagram';
import { FlowchartDiagram, type FlowchartSpec } from './FlowchartDiagram';

/** Renders an exercise figure (prompt or feedback) with the matching renderer. */
export function FigureView({ figure }: { figure: Figure }) {
  if (figure.kind === 'er') return <ErDiagram spec={figure.spec as ErDiagramSpec} compact />;
  if (figure.kind === 'flowchart') return <FlowchartDiagram spec={figure.spec as FlowchartSpec} compact />;
  return <BlockDiagram spec={figure.spec as BlockSpec} compact />;
}
