import { describe, it, expect } from 'vitest';
import { classifyLinkNode } from './index.js';

describe('classifyLinkNode', () => {
  it('classifies static links correctly', () => {
    expect(classifyLinkNode({ url: '/build/file.pdf', static: true })).toBe('static');
    expect(classifyLinkNode({ url: 'https://example.com/file.pdf', static: true })).toBe('static');
  });

  it('classifies internal links correctly', () => {
    expect(classifyLinkNode({ url: '/page' })).toBe('internal');
    expect(classifyLinkNode({ url: '/page', internal: true })).toBe('internal');
    expect(classifyLinkNode({ url: 'intro.md' })).toBe('internal');
    expect(classifyLinkNode({ url: './intro.md' })).toBe('internal');
    expect(classifyLinkNode({ url: './assets/logo.svg' })).toBe('internal');
  });

  it('classifies external links correctly', () => {
    expect(classifyLinkNode({ url: 'https://example.com' })).toBe('external');
    expect(classifyLinkNode({ url: 'http://example.com' })).toBe('external');
    expect(classifyLinkNode({ url: 'mailto:foo@example.com' })).toBe('external');
    expect(classifyLinkNode({ url: '/page', internal: false })).toBe('external');
  });
});
