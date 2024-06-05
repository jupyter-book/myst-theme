import type { NodeRenderer } from '@myst-theme/providers';
import BASIC_RENDERERS from './basic.js';
import ADMONITION_RENDERERS from './admonitions.js';
import DROPDOWN_RENDERERS from './dropdown.js';
import CARD_RENDERERS from './card.js';
import GRID_RENDERERS from './grid.js';
import CITE_RENDERERS from './cite.js';
import FOOTNOTE_RENDERERS from './footnotes.js';
import CODE_RENDERERS from './code.js';
import MATH_RENDERERS from './math.js';
import REACTIVE_RENDERERS from './reactive.js';
import IFRAME_RENDERERS from './iframe.js';
import IMAGE_RENDERERS from './image.js';
import LINK_RENDERERS from './links/index.js';
import HEADING_RENDERERS from './heading.js';
import CROSS_REFERENCE_RENDERERS from './crossReference.js';
import TAB_RENDERERS from './tabs.js';
import EXT_RENDERERS from './extensions/index.js';
import INLINE_EXPRESSION_RENDERERS from './inlineExpression.js';
import PROOF_RENDERERS from './proof.js';
import EXERCISE_RENDERERS from './exercise.js';
import ASIDE_RENDERERS from './aside.js';
import UNKNOWN_MYST_RENDERERS from './unknown.js';

export { CopyIcon, HoverPopover, Tooltip, LinkCard } from './components/index.js';
export { CodeBlock } from './code.js';
export { HashLink, scrollToElement } from './hashLink.js';
export { Admonition, AdmonitionKind } from './admonitions.js';
export { Details } from './dropdown.js';
export { TabSet, TabItem } from './tabs.js';
export { useFetchMdast } from './crossReference.js';

export const DEFAULT_RENDERERS: Record<string, NodeRenderer> = {
  ...BASIC_RENDERERS,
  ...UNKNOWN_MYST_RENDERERS,
  ...IMAGE_RENDERERS,
  ...LINK_RENDERERS,
  ...CODE_RENDERERS,
  ...MATH_RENDERERS,
  ...CITE_RENDERERS,
  ...TAB_RENDERERS,
  ...IFRAME_RENDERERS,
  ...FOOTNOTE_RENDERERS,
  ...ADMONITION_RENDERERS,
  ...REACTIVE_RENDERERS,
  ...HEADING_RENDERERS,
  ...CROSS_REFERENCE_RENDERERS,
  ...DROPDOWN_RENDERERS,
  ...CARD_RENDERERS,
  ...GRID_RENDERERS,
  ...INLINE_EXPRESSION_RENDERERS,
  ...EXT_RENDERERS,
  ...PROOF_RENDERERS,
  ...EXERCISE_RENDERERS,
  ...ASIDE_RENDERERS,
};

export { MyST } from './MyST.js';
