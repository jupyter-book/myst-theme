import React from 'react';

import { CodeBlock } from 'myst-to-react';

export default {
  title: 'Components/CodeBlock',
  component: CodeBlock,
};

type Props = {
  value: string;
  lang?: string;
  showCopy?: boolean;
  showLineNumbers?: boolean;
  startingLineNumber?: number;
  emphasizeLines?: number[];
  filename?: string;
  border?: boolean;
};
const Template = ({
  value,
  lang,
  emphasizeLines,
  showLineNumbers,
  startingLineNumber,
  border,
  showCopy,
}: Props) => (
  <article className="prose m-auto mt-6 max-w-[80ch]">
    <CodeBlock
      value={value}
      lang={lang}
      emphasizeLines={emphasizeLines}
      showLineNumbers={showLineNumbers}
      startingLineNumber={startingLineNumber}
      border={border}
      showCopy={showCopy}
    />
  </article>
);

export const SimplePython = Template.bind({});
SimplePython.args = {
  value: 'def square(x):\n  return x * x',
  lang: 'python',
  border: true,
};

export const Javascript = Template.bind({});
Javascript.args = {
  value: 'function square(x) {\n  return x * x;\n}',
  lang: 'javascript',
  border: true,
};

export const LineNumbers = Template.bind({});
LineNumbers.args = {
  value: 'function square(x) {\n  return x * x;\n}',
  lang: 'javascript',
  showLineNumbers: true,
  border: true,
};

export const EmphasizeLines = Template.bind({});
EmphasizeLines.args = {
  value: 'function square(x) {\n  return x * x;\n}',
  lang: 'javascript',
  showLineNumbers: true,
  emphasizeLines: [2],
  border: true,
};

export const StartingLineNumber = Template.bind({});
StartingLineNumber.args = {
  value: 'function square(x) {\n  return x * x;\n}',
  lang: 'javascript',
  startingLineNumber: 2,
  showLineNumbers: true,
  emphasizeLines: [3],
  border: true,
};

export const NoCopyButton = Template.bind({});
NoCopyButton.args = {
  value: 'function square(x) {\n  return x * x;\n}',
  lang: 'javascript',
  showCopy: false,
  border: true,
};

export const NoBorder = Template.bind({});
NoBorder.args = {
  value: 'function square(x) {\n  return x * x;\n}',
  lang: 'javascript',
};
