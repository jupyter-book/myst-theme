import type React from 'react';

// This is duplicated in myst-to-react
export type NodeRenderer<T = any> = (
  node: T & { type: string; key: string; html_id?: string },
  children?: React.ReactNode,
) => React.ReactNode;
