import { memo } from 'react';
import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react';

export const BowtieEdge = memo((props: EdgeProps) => {
  const isVertical = Math.abs(props.sourceX - props.targetX) < 10;
  const path = isVertical
    ? `M ${props.sourceX} ${props.sourceY} L ${props.targetX} ${props.targetY}`
    : getSmoothStepPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        sourcePosition: props.sourcePosition,
        targetX: props.targetX,
        targetY: props.targetY,
        targetPosition: props.targetPosition,
        borderRadius: 0,
        offset: 80,
      })[0];

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
