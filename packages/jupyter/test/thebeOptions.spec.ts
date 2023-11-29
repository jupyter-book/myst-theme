import { describe, expect, test } from 'vitest';
import type { BinderProviders, ExpandedThebeFrontmatter } from 'myst-frontmatter';
import type { ExtendedCoreOptions } from '../src/utils';
import { thebeFrontmatterToOptions } from '../src/utils';

describe('transforming thebe frontmatter', () => {
  test.each([
    ['thebe: undefined', undefined, undefined],
    [
      'thebe.binder: defined',
      { binder: { repo: 'some/repo' } },
      { useBinder: true, binderOptions: { repo: 'some/repo' } },
    ],
    ['thebe.lite: true; jupyter lite', { lite: true }, { useJupyterLite: true }],
  ])('shortcut cases %s', (s, thebe, result) => {
    expect(thebeFrontmatterToOptions(thebe as any)).toEqual(result);
  });
  test.each([
    [
      'thebe.binder.*',
      {
        binder: {
          repo: 'executablebooks/thebe-binder-base',
          url: 'https://another.binder.org/services/binder/',
          ref: 'branch',
          provider: 'gitlab' as BinderProviders,
        },
      },
      {
        useBinder: true,
        binderOptions: {
          repo: 'executablebooks/thebe-binder-base',
          binderUrl: 'https://another.binder.org/services/binder/',
          ref: 'branch',
          repoProvider: 'gitlab' as BinderProviders,
        },
      },
    ],
    [
      'thebe.server.*',
      {
        server: {
          url: 'http://localhost:1234',
          token: 'qwerty123456',
        },
      },
      {
        serverSettings: {
          baseUrl: 'http://localhost:1234',
          token: 'qwerty123456',
        },
      },
    ],
  ])('explicit options %s', (s, thebe: ExpandedThebeFrontmatter, result) => {
    expect(thebeFrontmatterToOptions(thebe)).toEqual(result);
  });
  test.each([
    [
      'disableSessionSaving',
      {
        disableSessionSaving: true,
      },
      {
        savedSessionOptions: {
          enabled: false,
        },
      },
    ],
    [
      'kernelName',
      {
        kernelName: 'myQuirkyKernel',
      },
      {
        kernelOptions: {
          kernelName: 'myQuirkyKernel',
        },
      },
    ],
    [
      'mathjax',
      {
        mathjaxUrl: 'someUnverifiedUrl',
        mathjaxConfig: 'someConfigString',
      },
      {
        mathjaxUrl: 'someUnverifiedUrl',
        mathjaxConfig: 'someConfigString',
      },
    ],
  ])('additional options %s', (s, thebe: ExpandedThebeFrontmatter, result: ExtendedCoreOptions) => {
    expect(thebeFrontmatterToOptions(thebe)).toEqual(result);
  });
});
