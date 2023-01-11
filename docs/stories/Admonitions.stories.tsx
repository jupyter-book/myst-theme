import React from 'react';

import { AdmonitionKind, Admonition } from 'myst-to-react';

export default {
  title: 'Components/Admonition',
  component: Admonition,
};

type AdmonitionProps = {
  title?: string | React.ReactNode;
  kind?: AdmonitionKind;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  dropdown?: boolean;
};
const Template = ({ title, kind, color, dropdown }: AdmonitionProps) => (
  <article className="prose m-auto mt-6 max-w-[80ch]">
    <Admonition title={title} kind={kind} color={color} dropdown={dropdown}>
      Content!
    </Admonition>
  </article>
);

export const Note = Template.bind({});
Note.args = {
  title: 'Note',
  kind: AdmonitionKind.note,
  color: 'blue',
  dropdown: false,
};

export const Warning = Template.bind({});
Warning.args = {
  title: 'Warning',
  kind: AdmonitionKind.warning,
  color: 'yellow',
  dropdown: false,
};

export const Attention = Template.bind({});
Attention.args = {
  title: 'Attention',
  kind: AdmonitionKind.attention,
  color: 'yellow',
  dropdown: false,
};

export const Caution = Template.bind({});
Caution.args = {
  title: 'Caution',
  kind: AdmonitionKind.caution,
  color: 'yellow',
  dropdown: false,
};

export const Danger = Template.bind({});
Danger.args = {
  title: 'Danger',
  kind: AdmonitionKind.danger,
  color: 'red',
  dropdown: false,
};

export const Error = Template.bind({});
Error.args = {
  title: 'Error',
  kind: AdmonitionKind.error,
  color: 'red',
  dropdown: false,
};

export const Important = Template.bind({});
Important.args = {
  title: 'Important',
  kind: AdmonitionKind.important,
  color: 'blue',
  dropdown: false,
};

export const Hint = Template.bind({});
Hint.args = {
  title: 'Hint',
  kind: AdmonitionKind.hint,
  color: 'blue',
  dropdown: false,
};

export const SeeAlso = Template.bind({});
SeeAlso.args = {
  title: 'See Also',
  kind: AdmonitionKind.seealso,
  color: 'green',
  dropdown: false,
};

export const Tip = Template.bind({});
Tip.args = {
  title: 'Tip',
  kind: AdmonitionKind.tip,
  color: 'green',
  dropdown: false,
};
