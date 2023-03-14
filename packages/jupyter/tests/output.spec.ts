import type { MinifiedOutput } from 'nbtx';
import { allOutputsAreSafe, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES } from '../src/output';

function makeMimeOutput(output_type: string, content_type: string, content: string) {
  return {
    output_type: 'execute_result',
    metadata: {},
    data: { [content_type]: { content_type, content } },
  } as MinifiedOutput;
}

describe('outputs', () => {
  test.each([
    ['stream', [{ output_type: 'stream' } as MinifiedOutput]],
    ['error', [{ output_type: 'error' } as MinifiedOutput]],
    ['exec result text/plain', [makeMimeOutput('execute_result', 'text/plain', 'plain text')]],
    [
      'exec result image/png',
      [makeMimeOutput('execute_result', 'image/png', 'base64encodedstring')],
    ],
    ['display data text/plain', [makeMimeOutput('display_data', 'text/plain', 'plain text')]],
    [
      'display data image/png',
      [makeMimeOutput('display_data', 'image/png', 'base64encodedstring')],
    ],
    [
      'mulitple safe',
      [
        { output_type: 'stream' } as MinifiedOutput,
        makeMimeOutput('execute_result', 'image/png', 'base64encodedstring'),
        { output_type: 'error' } as MinifiedOutput,
      ],
    ],
  ])('all safe - %s', (s, outputs: MinifiedOutput[]) => {
    expect(allOutputsAreSafe(outputs, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBeTruthy();
  });
  test.each([
    ['exec result text/html', [makeMimeOutput('execute_result', 'text/html', '<div />')]],
    ['display data text/html', [makeMimeOutput('display_data', 'text/html', '<div />')]],
    [
      'stream followed by text/html',
      [
        { output_type: 'stream' } as MinifiedOutput,
        makeMimeOutput('display_data', 'text/html', '<div />'),
      ],
    ],
    [
      'text/html followed by stream',
      [
        makeMimeOutput('display_data', 'text/html', '<div />'),
        { output_type: 'stream' } as MinifiedOutput,
      ],
    ],
  ])('unsafe - %s', (s, outputs: MinifiedOutput[]) => {
    expect(allOutputsAreSafe(outputs, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES)).toBeFalsy();
  });
});
