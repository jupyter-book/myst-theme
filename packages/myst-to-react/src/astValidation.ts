import type { GenericNode } from 'myst-common';

/**
 * Validation result for AST nodes
 */
export interface ASTValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  nodeInfo?: {
    type?: string;
    hasChildren: boolean;
    hasValue: boolean;
    childrenCount?: number;
    source?: any;
  };
}

/**
 * Validates a single AST node for common issues
 */
export function validateASTNode(node: any): ASTValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic existence check
  if (!node) {
    return {
      isValid: false,
      errors: ['Node is null or undefined'],
      warnings: [],
    };
  }

  // Type check
  if (typeof node !== 'object') {
    return {
      isValid: false,
      errors: [`Node is not an object (got ${typeof node})`],
      warnings: [],
    };
  }

  // Required type property
  if (!node.type || typeof node.type !== 'string') {
    errors.push('Node is missing required "type" property or type is not a string');
  }

  // Check for common problematic patterns
  if (node.children === null) {
    warnings.push('Node has null children (should be undefined or array)');
  }

  if (Array.isArray(node.children) && node.children.some((child: any) => !child)) {
    warnings.push('Children array contains null/undefined values');
  }

  const nodeInfo = {
    type: node.type,
    hasChildren: Boolean(node.children),
    hasValue: Boolean(node.value),
    childrenCount: Array.isArray(node.children) ? node.children.length : undefined,
    source: node.source,
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    nodeInfo,
  };
}

/**
 * Validates an array of AST nodes
 */
export function validateASTArray(nodes: any[]): ASTValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!Array.isArray(nodes)) {
    return {
      isValid: false,
      errors: ['Expected array but got ' + typeof nodes],
      warnings: [],
    };
  }

  nodes.forEach((node, index) => {
    const result = validateASTNode(node);

    result.errors.forEach((error) => {
      allErrors.push(`Node ${index}: ${error}`);
    });

    result.warnings.forEach((warning) => {
      allWarnings.push(`Node ${index}: ${warning}`);
    });
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    nodeInfo: {
      type: 'array',
      hasChildren: nodes.length > 0,
      hasValue: false,
      childrenCount: nodes.length,
    },
  };
}

/**
 * Gets debugging information for an AST node
 */
export function getASTDebugInfo(node: GenericNode): string[] {
  const info: string[] = [];

  if (!node) {
    info.push('Node is null or undefined');
    return info;
  }

  info.push(`Node type: ${node.type || 'undefined'}`);
  info.push(
    `Has children: ${Boolean(node.children)} ${node.children ? `(${node.children.length})` : ''}`,
  );
  info.push(`Has value: ${Boolean(node.value)}`);
  info.push(`Has key: ${Boolean(node.key)}`);

  if (node.position) {
    info.push(`Position: Line ${node.position.start?.line || 'unknown'}`);
  }

  if (node.source) {
    info.push(`Source label: ${node.source.label || 'none'}`);
    info.push(`Source URL: ${node.source.url || 'none'}`);

    if (node.source.remoteBaseUrl) {
      info.push(`Remote base URL: ${node.source.remoteBaseUrl}`);
    }
  }

  return info;
}

/**
 * Generates debugging hints based on node characteristics
 */
export function generateDebuggingHints(node: GenericNode): string[] {
  const hints: string[] = [];

  if (!node) return ['Node is null or undefined - check AST generation'];

  if (!node.type) {
    hints.push('Node is missing type property - may be corrupted AST data');
  }

  if (node.type === 'embed') {
    if (!node.children && node.source?.label?.startsWith('xref:local')) {
      hints.push('Local cross-reference failed - check if content server is running');
      hints.push('Verify CONTENT_CDN_PORT environment variable is set correctly');
    }

    if (!node.children && node.source?.label?.startsWith('xref:')) {
      hints.push('External cross-reference failed - check network connectivity');
      hints.push('Verify the target content exists and is accessible');
    }

    if (!node.children && !node.source) {
      hints.push('Embed has no source or content - check MyST directive syntax');
    }
  }

  if (node.children === null) {
    hints.push('Children is explicitly null - should be undefined or an array');
  }

  if (Array.isArray(node.children) && node.children.length === 0 && node.type !== 'paragraph') {
    hints.push('Node has empty children array - may be intentional or indicate missing content');
  }

  return hints;
}
