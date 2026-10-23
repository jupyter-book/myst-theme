// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, it, expect, vi } from 'vitest';
import { MystAnyModel } from './models.js';

describe('MystAnyModel', () => {
  // Test the core widget data flow set/get state and fire on changes.
  it('updates state and fires change event', () => {
    const model = new MystAnyModel({ a: 0, b: 0 });
    // This function changes *b* as a callback when *a* changes
    const cb = vi.fn(() => model.set('b', 10));
    model.on('change:a', cb);

    // Set a value, which should trigger the callback above
    model.set('a', 5);

    expect(model.get('a')).toBe(5);
    expect(model.get('b')).toBe(10);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
