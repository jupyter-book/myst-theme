// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, it, expect } from 'vitest';
import { isOutputSafe, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES } from './output.js';
import { KnownCellOutputMimeTypes } from 'nbtx';
import type { MinifiedMimeOutput, MinifiedStreamOutput } from 'nbtx';

describe('Output Safety Functions', () => {
  describe('isOutputSafe', () => {
    it('should return true for direct output types', () => {
      const output: MinifiedStreamOutput = {
        output_type: 'stream',
        name: 'stdout',
        text: 'some output',
      };
      expect(isOutputSafe(output, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBe(true);
    });

    it('should return true for safe mime types', () => {
      const output: MinifiedMimeOutput = {
        output_type: 'display_data',
        data: {
          [KnownCellOutputMimeTypes.TextPlain]: {
            content_type: 'text/plain',
            content: 'some text',
          },
          [KnownCellOutputMimeTypes.ImagePng]: {
            content_type: 'image/png',
            content: 'base64data',
          },
        },
        metadata: {},
      };
      expect(isOutputSafe(output, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBe(true);
    });

    it('should return false for unsafe mime types', () => {
      const output: MinifiedMimeOutput = {
        output_type: 'display_data',
        data: {
          'application/javascript': {
            content_type: 'application/javascript',
            content: 'alert("unsafe")',
          },
        },
        metadata: {},
      };
      expect(isOutputSafe(output, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBe(false);
    });

    it('should return false for output without data', () => {
      // technically malformed input, but we'll handle it gracefully
      const output = {
        output_type: 'display_data',
        metadata: {},
      };
      expect(isOutputSafe(output as any, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBe(false);
    });
  });

  // describe('allOutputsAreSafe', () => {
  //   it('should return true for empty outputs', () => {
  //     expect(allOutputsAreSafe([], DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBe(true);
  //   });

  //   it('should return true when all outputs are safe', () => {
  //     const outputs: MinifiedOutput[] = [
  //       {
  //         output_type: 'stream',
  //         name: 'stdout',
  //         text: 'some output',
  //       },
  //       {
  //         output_type: 'display_data',
  //         data: {
  //           [KnownCellOutputMimeTypes.TextPlain]: {
  //             content_type: 'text/plain',
  //             content: 'text',
  //           },
  //           [KnownCellOutputMimeTypes.ImagePng]: {
  //             content_type: 'image/png',
  //             content: 'data',
  //           },
  //         },
  //         metadata: {},
  //       },
  //     ];
  //     expect(allOutputsAreSafe(outputs, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBe(true);
  //   });

  //   it('should return false when any output is unsafe', () => {
  //     const outputs: MinifiedOutput[] = [
  //       {
  //         output_type: 'stream',
  //         name: 'stdout',
  //         text: 'some output',
  //       },
  //       {
  //         output_type: 'display_data',
  //         data: {
  //           'application/javascript': {
  //             content_type: 'application/javascript',
  //             content: 'alert("unsafe")',
  //           },
  //         },
  //         metadata: {},
  //       },
  //     ];
  //     expect(allOutputsAreSafe(outputs, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBe(false);
  //   });

  //   it('should handle mixed safe and unsafe outputs', () => {
  //     const outputs: MinifiedOutput[] = [
  //       {
  //         output_type: 'stream',
  //         name: 'stdout',
  //         text: 'some output',
  //       },
  //       {
  //         output_type: 'display_data',
  //         data: {
  //           [KnownCellOutputMimeTypes.TextPlain]: {
  //             content_type: 'text/plain',
  //             content: 'text',
  //           },
  //         },
  //         metadata: {},
  //       },
  //       {
  //         output_type: 'display_data',
  //         data: {
  //           'application/javascript': {
  //             content_type: 'application/javascript',
  //             content: 'alert("unsafe")',
  //           },
  //         },
  //         metadata: {},
  //       },
  //     ];
  //     expect(allOutputsAreSafe(outputs, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBe(false);
  //   });
  // });
});
