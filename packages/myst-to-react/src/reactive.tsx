import type { NodeRenderer } from '@myst-theme/providers';
import { createElement as e } from 'react';

export const RVar: NodeRenderer = ({ node }) => {
  return e('r-var', {
    name: node.name,
    value: node.value,
    ':value': node.valueFunction,
    format: node.format,
  });
};

export const RDisplay: NodeRenderer = ({ node }) => {
  return e('r-display', {
    name: node.name,
    value: node.value,
    ':value': node.valueFunction,
    format: node.format,
  });
};

export const RDynamic: NodeRenderer = ({ node }) => {
  return e('r-dynamic', {
    name: node.name,
    value: node.value,
    ':value': node.valueFunction,
    max: node.max,
    ':max': node.maxFunction,
    min: node.min,
    ':min': node.minFunction,
    step: node.step,
    ':step': node.stepFunction,
    ':change': node.changeFunction,
    format: node.format,
  });
};

export const RRange: NodeRenderer = ({ node }) => {
  return e('r-range', {
    name: node.name,
    value: node.value,
    ':value': node.valueFunction,
    max: node.max,
    ':max': node.maxFunction,
    min: node.min,
    ':min': node.minFunction,
    step: node.step,
    ':step': node.stepFunction,
    ':change': node.changeFunction,
  });
};

const REACTIVE_RENDERERS = {
  'r:var': RVar,
  'r:display': RDisplay,
  'r:dynamic': RDynamic,
  'r:range': RRange,
};

export default REACTIVE_RENDERERS;
