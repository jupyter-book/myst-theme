import React, { useCallback } from 'react';
import type { IdOrKey } from './provider';
import { ExecuteScopeContext } from './provider';

export function useExecuteScope() {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  const { dispatch } = context;

  const start = useCallback((slug: string) => {
    console;
    dispatch({
      type: 'REQUEST_BUILD',
      payload: {
        slug,
      },
    });
  }, []);

  const restart = useCallback((slug: string) => {
    // directly interact with the session
    console.error('restart not implemented', slug);
  }, []);

  return { ...context, start, restart };
}

export function useCellExecuteScope(id: IdOrKey) {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  return {};
}
