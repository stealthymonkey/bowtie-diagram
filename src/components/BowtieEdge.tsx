import { memo } from 'react';
import {
  BaseEdge,
  type EdgeProps,
  getBezierPath,
} from '@xyflow/react';

export const BowtieEdge = memo((props: EdgeProps) => {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <BaseEdge
      id={props.id}
      path={path}
      label={props.label}
      markerEnd={props.markerEnd}
      style={props.style}
    />
  );
});

BowtieEdge.displayName = 'BowtieEdge';
