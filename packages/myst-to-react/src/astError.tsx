import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import type { GenericNode } from 'myst-common';
import {
  validateASTNode,
  generateDebuggingHints,
  type ASTValidationResult,
} from './astValidation.js';

interface ASTErrorProps {
  node: GenericNode;
  title: string;
  message?: string;
  className?: string;
  showNodeInfo?: boolean;
  debugHints?: string[];
}

function SourceInformation({ sourceInfo }: { sourceInfo: any }) {
  const hasSourceInfo = sourceInfo.label || sourceInfo.url || sourceInfo.title;

  if (!hasSourceInfo) return null;

  return (
    <div className="p-3 bg-red-100 rounded border border-red-200 dark:bg-red-900/30 dark:border-red-700">
      <h5 className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
        Source Information
      </h5>
      <div className="grid grid-cols-1 gap-1 text-sm">
        {sourceInfo.label && (
          <div>
            <span className="font-medium text-red-700 dark:text-red-300">Label:</span>{' '}
            <code className="px-1 text-red-800 bg-red-200 rounded dark:text-red-200 dark:bg-red-800/30">
              {sourceInfo.label}
            </code>
          </div>
        )}
        {sourceInfo.url && (
          <div>
            <span className="font-medium text-red-700 dark:text-red-300">URL:</span>{' '}
            <code className="px-1 text-red-800 bg-red-200 rounded dark:text-red-200 dark:bg-red-800/30">
              {sourceInfo.url}
            </code>
          </div>
        )}
        {sourceInfo.title && (
          <div>
            <span className="font-medium text-red-700 dark:text-red-300">Title:</span>{' '}
            <span className="dark:text-red-200">{sourceInfo.title}</span>
          </div>
        )}
        {sourceInfo.remoteBaseUrl && (
          <div>
            <span className="font-medium text-red-700 dark:text-red-300">Remote Base:</span>{' '}
            <code className="px-1 text-red-800 bg-red-200 rounded dark:text-red-200 dark:bg-red-800/30">
              {sourceInfo.remoteBaseUrl}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

function ASTNodeInformation({ node }: { node: GenericNode }) {
  return (
    <div className="p-3 bg-gray-100 rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-600">
      <h5 className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
        AST Node Information
      </h5>
      <div className="grid grid-cols-1 gap-1 text-sm">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>{' '}
          <code className="px-1 text-gray-800 bg-gray-200 rounded dark:text-gray-200 dark:bg-gray-700">
            {node.type}
          </code>
        </div>
        {node.key && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Key:</span>{' '}
            <code className="px-1 text-gray-800 bg-gray-200 rounded dark:text-gray-200 dark:bg-gray-700">
              {node.key}
            </code>
          </div>
        )}
        {node.position && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Position:</span>{' '}
            <span className="dark:text-gray-200">
              Line {node.position.start?.line || 'unknown'}
            </span>
          </div>
        )}
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Has Children:</span>{' '}
          <span className="dark:text-gray-200">
            {node.children ? `Yes (${node.children.length})` : 'No'}
          </span>
        </div>
        {node.value && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Value:</span>{' '}
            <code className="px-1 text-xs text-gray-800 bg-gray-200 rounded dark:text-gray-200 dark:bg-gray-700">
              {typeof node.value === 'string'
                ? node.value.length > 50
                  ? node.value.substring(0, 50) + '...'
                  : node.value
                : JSON.stringify(node.value)}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

function ValidationResults({ validationResult }: { validationResult: ASTValidationResult }) {
  if (validationResult.errors.length === 0 && validationResult.warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {validationResult.errors.length > 0 && (
        <div className="p-3 bg-red-100 rounded border border-red-300 dark:bg-red-900/30 dark:border-red-700">
          <h5 className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
            Validation Errors
          </h5>
          <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
            {validationResult.errors.map((error, index) => (
              <li key={index} className="flex gap-1 items-start">
                <span className="flex-shrink-0 text-red-500 dark:text-red-400">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationResult.warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 rounded border border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-600">
          <h5 className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Validation Warnings
          </h5>
          <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            {validationResult.warnings.map((warning, index) => (
              <li key={index} className="flex gap-1 items-start">
                <span className="flex-shrink-0 text-yellow-500 dark:text-yellow-400">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DebuggingHints({ hints }: { hints: string[] }) {
  if (hints.length === 0) return null;

  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
      <div className="flex gap-2 items-center mb-2">
        <InformationCircleIcon className="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">Debugging Hints</h5>
      </div>
      <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
        {hints.map((hint, index) => (
          <li key={index} className="flex gap-1 items-start">
            <span className="flex-shrink-0 text-blue-500 dark:text-blue-400">•</span>
            <span>{hint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RawASTData({ node }: { node: GenericNode }) {
  return (
    <div className="rounded border border-gray-300 dark:border-gray-600">
      <div className="p-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-t cursor-pointer dark:text-gray-300 dark:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100">
        Raw AST Node Data
      </div>
      <pre className="overflow-x-auto p-3 mt-0 text-xs text-gray-900 bg-gray-100 rounded-b border-t border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600">
        {JSON.stringify(node, null, 2)}
      </pre>
    </div>
  );
}

export function ASTError({
  node,
  title,
  message,
  className,
  showNodeInfo = true,
  debugHints = [],
}: ASTErrorProps) {
  const sourceInfo = node?.source || {};
  const hasSourceInfo = sourceInfo.label || sourceInfo.url || sourceInfo.title;

  // Perform validation and get automatic hints
  const validationResult = validateASTNode(node);
  const autoHints = generateDebuggingHints(node);
  const allHints = [...debugHints, ...autoHints];

  return (
    <div
      className={classNames(
        'p-4 my-4 bg-red-50 rounded border border-red-300 dark:bg-red-900/20 dark:border-red-700',
        className,
      )}
      role="alert"
    >
      {/* Header with Icon and Title */}
      <div className="flex gap-2 items-start mb-2">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-base font-semibold text-red-800 dark:text-red-200">{title}</div>
      </div>
      <div className="flex gap-2 items-start mb-2">
        {message && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>}
      </div>

      {/* Compact Source Information */}
      {hasSourceInfo && sourceInfo.label && (
        <div className="mb-3">
          <span className="text-sm font-medium text-red-800 dark:text-red-200">Source: </span>
          <code className="px-2 py-1 text-sm text-red-800 bg-red-200 rounded dark:text-red-200 dark:bg-red-800/30">
            {sourceInfo.label}
          </code>
        </div>
      )}

      {/* Expandable Details */}
      <details className="mt-3">
        <summary className="flex gap-1 items-center text-sm font-medium text-red-700 cursor-pointer dark:text-red-300 hover:text-red-800 dark:hover:text-red-200">
          <span>Show debugging information</span>
          <span className="text-xs text-red-500 dark:text-red-400">▼</span>
        </summary>

        <div className="mt-3 space-y-3">
          <SourceInformation sourceInfo={sourceInfo} />

          {showNodeInfo && <ASTNodeInformation node={node} />}

          <ValidationResults validationResult={validationResult} />

          <DebuggingHints hints={allHints} />

          <RawASTData node={node} />
        </div>
      </details>
    </div>
  );
}
