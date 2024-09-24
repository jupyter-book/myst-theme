import type React from 'react';
import type { GenericNode } from 'myst-common';

export type NodeRenderer<T = any> = React.FC<{ node: GenericNode & T }>;
export type NodeRenderers = Record<string, NodeRenderer | Record<'base' | string, NodeRenderer>>;
export type NodeRenderersValidated = Record<
  string,
  { base: NodeRenderer } & Record<string, NodeRenderer>
>;

export function validateRenderers(renderers?: NodeRenderers): NodeRenderersValidated {
  if (!renderers) return {};
  const validatedRenderers: NodeRenderersValidated = {};

  for (const key in renderers) {
    const renderer = renderers[key];

    if (typeof renderer === 'function') {
      // If the renderer is a function, it's treated as the base renderer
      validatedRenderers[key] = { base: renderer };
    } else if (typeof renderer === 'object' && 'base' in renderer) {
      // If it's an object with a base renderer, validate it
      validatedRenderers[key] = renderer as NodeRenderersValidated[''];
    } else {
      throw new Error(
        `Renderer for "${key}" must be either a function or an object containing a "base" renderer.`,
      );
    }
  }

  return validatedRenderers;
}

export function mergeRenderers(renderers: NodeRenderers[], validate: true): NodeRenderersValidated;
export function mergeRenderers(renderers: NodeRenderers[], validate?: false): NodeRenderers;
export function mergeRenderers(renderers: NodeRenderers[], validate?: boolean): NodeRenderers {
  const mergedRenderers: NodeRenderersValidated = {}; // May not actually have base!

  for (const renderersObj of renderers) {
    for (const key in renderersObj) {
      const next =
        typeof renderersObj[key] === 'function' ? { base: renderersObj[key] } : renderersObj[key];
      mergedRenderers[key] = {
        ...(mergedRenderers[key] as any), // Not sure why we need the any here...
        ...next,
      };
    }
  }

  if (validate) return validateRenderers(mergedRenderers);
  return mergedRenderers as NodeRenderers;
}
