import type { GenericNode } from 'myst-common';
import type React from 'react';

export type NodeRenderer<T = any> = React.FC<{ node: GenericNode & T }>;
