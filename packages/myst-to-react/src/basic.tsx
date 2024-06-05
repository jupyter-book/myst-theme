import React from 'react';
import type * as spec from 'myst-spec';
import { HashLink } from './hashLink.js';
import type { NodeRenderer } from '@myst-theme/providers';
import classNames from 'classnames';
import { Tooltip } from './components/index.js';
import { MyST } from './MyST.js';
import type { GenericNode } from 'myst-common';

type TableExts = {
  rowspan?: number;
  colspan?: number;
};

type Delete = {
  type: 'delete';
};

type Underline = {
  type: 'underline';
};

type SmallCaps = {
  type: 'smallcaps';
};

type DefinitionList = {
  type: 'definitionList';
};

type DefinitionTerm = {
  type: 'definitionTerm';
};

type DefinitionDescription = {
  type: 'definitionDescription';
};

type CaptionNumber = {
  type: 'captionNumber';
  kind: string;
  identifier: string;
};

type Keyboard = {
  type: 'keyboard';
};

type Include = {
  type: 'include';
};

type BasicNodeRenderers = {
  text: NodeRenderer<spec.Text>;
  span: NodeRenderer<GenericNode>;
  div: NodeRenderer<GenericNode>;
  strong: NodeRenderer<spec.Strong>;
  emphasis: NodeRenderer<spec.Emphasis>;
  link: NodeRenderer<spec.Link>;
  paragraph: NodeRenderer<spec.Paragraph>;
  algorithmLine: NodeRenderer<GenericNode>;
  break: NodeRenderer<spec.Break>;
  inlineMath: NodeRenderer<spec.InlineMath>;
  math: NodeRenderer<spec.Math>;
  list: NodeRenderer<spec.List>;
  listItem: NodeRenderer<spec.ListItem & { checked?: boolean }>;
  container: NodeRenderer<spec.Container>;
  caption: NodeRenderer<spec.Caption>;
  legend: NodeRenderer<spec.Legend>;
  blockquote: NodeRenderer<spec.Blockquote>;
  thematicBreak: NodeRenderer<spec.ThematicBreak>;
  subscript: NodeRenderer<spec.Subscript>;
  superscript: NodeRenderer<spec.Superscript>;
  abbreviation: NodeRenderer<spec.Abbreviation>;
  // Tables
  table: NodeRenderer<spec.Table>;
  tableRow: NodeRenderer<spec.TableRow>;
  tableCell: NodeRenderer<spec.TableCell & TableExts>;
  // Comment
  comment: NodeRenderer<spec.Comment>;
  mystComment: NodeRenderer<spec.Comment>;
  // Our additions
  captionNumber: NodeRenderer<CaptionNumber>;
  delete: NodeRenderer<Delete>;
  underline: NodeRenderer<Underline>;
  keyboard: NodeRenderer<Keyboard>;
  smallcaps: NodeRenderer<SmallCaps>;
  // definitions
  definitionList: NodeRenderer<DefinitionList>;
  definitionTerm: NodeRenderer<DefinitionTerm>;
  definitionDescription: NodeRenderer<DefinitionDescription>;
  include: NodeRenderer<Include>;
};

const BASIC_RENDERERS: BasicNodeRenderers = {
  text({ node }) {
    // Change zero-width space into `<wbr>` which is better for copying
    // These are used in links, and potentially other long words
    if (!node.value?.includes('​')) {
      return <>{node.value}</>;
    }
    const text = node.value.split('​');
    return (
      <>
        {text.map((v, i) => (
          <React.Fragment key={i}>
            {v}
            {i < text.length - 1 && <wbr />}
          </React.Fragment>
        ))}
      </>
    );
  },
  span({ node }) {
    return (
      <span className={node.class} style={node.style}>
        <MyST ast={node.children} />
      </span>
    );
  },
  div({ node }) {
    return (
      <div className={node.class} style={node.style}>
        <MyST ast={node.children} />
      </div>
    );
  },
  delete({ node }) {
    return (
      <del>
        <MyST ast={node.children} />
      </del>
    );
  },
  strong({ node }) {
    return (
      <strong>
        <MyST ast={node.children} />
      </strong>
    );
  },
  emphasis({ node }) {
    return (
      <em>
        <MyST ast={node.children} />
      </em>
    );
  },
  underline({ node }) {
    return (
      <span style={{ textDecoration: 'underline' }}>
        <MyST ast={node.children} />
      </span>
    );
  },
  smallcaps({ node }) {
    return (
      <span style={{ fontVariant: 'small-caps' }}>
        <MyST ast={node.children} />
      </span>
    );
  },
  link({ node }) {
    return (
      <a target="_blank" href={node.url} rel="noreferrer">
        <MyST ast={node.children} />
      </a>
    );
  },
  paragraph({ node }) {
    return (
      <p id={node.html_id}>
        <MyST ast={node.children} />
      </p>
    );
  },
  algorithmLine({ node }) {
    // Used in algorithms
    const style = {
      paddingLeft: `${(node.indent ?? 0) + 2}rem`,
    };
    return (
      <p className="line" style={style} data-line-number={node.enumerator}>
        <MyST ast={node.children} />
      </p>
    );
  },
  break() {
    return <br />;
  },
  inlineMath({ node }) {
    return <code>{node.value}</code>;
  },
  math({ node }) {
    return <code>{node.value}</code>;
  },
  list({ node }) {
    if (node.ordered) {
      return (
        <ol start={node.start || undefined} id={node.html_id}>
          <MyST ast={node.children} />
        </ol>
      );
    }
    return (
      <ul id={node.html_id}>
        <MyST ast={node.children} />
      </ul>
    );
  },
  listItem({ node }) {
    if (node.checked == null) {
      return (
        <li>
          <MyST ast={node.children} />
        </li>
      );
    }
    return (
      <li className="task-list-item">
        <input type="checkbox" className="task-list-item-checkbox" defaultChecked={node.checked} />
        <MyST ast={node.children} />
      </li>
    );
  },
  container({ node }) {
    const figureName = `fig-${node.kind}`;
    return (
      <figure
        id={node.html_id || node.identifier || node.key}
        className={classNames(
          { [figureName]: !!node.kind, subcontainer: node.subcontainer },
          node.class,
        )}
      >
        <MyST ast={node.children} />
      </figure>
    );
  },
  caption({ node }) {
    return (
      <figcaption className="group">
        <MyST ast={node.children} />
      </figcaption>
    );
  },
  legend({ node }) {
    return (
      <figcaption className="text-sm">
        <MyST ast={node.children} />
      </figcaption>
    );
  },
  blockquote({ node }) {
    return (
      <blockquote id={node.html_id}>
        <MyST ast={node.children} />
      </blockquote>
    );
  },
  thematicBreak() {
    return <hr className="py-2 my-5 translate-y-2" />;
  },
  captionNumber({ node }) {
    const id = node.html_id || node.identifier || node.key;
    return (
      <HashLink
        id={id}
        kind={node.kind}
        className="mr-1 font-semibold text-inherit hover:text-inherit hover:font-semibold"
      >
        <MyST ast={node.children} />
      </HashLink>
    );
  },
  table({ node }) {
    // TODO: actually render the tbody on the server if it isn't included here.
    return (
      <table className={node.class} style={node.style}>
        <tbody>
          <MyST ast={node.children} />
        </tbody>
      </table>
    );
  },
  tableRow({ node }) {
    return (
      <tr className={node.class} style={node.style}>
        <MyST ast={node.children} />
      </tr>
    );
  },
  tableCell({ node }) {
    const ifGreaterThanOne = (num?: number) => (num === 1 ? undefined : num);
    const attrs = {
      rowSpan: ifGreaterThanOne(node.rowspan),
      colSpan: ifGreaterThanOne(node.colspan),
    };
    const align = {
      'text-left': node.align === 'left',
      'text-right': node.align === 'right',
      'text-center': node.align === 'center',
    };
    if (node.header)
      return (
        <th className={classNames(node.class, align)} style={node.style} {...attrs}>
          <MyST ast={node.children} />
        </th>
      );
    return (
      <td className={classNames(node.class, align)} style={node.style} {...attrs}>
        <MyST ast={node.children} />
      </td>
    );
  },
  subscript({ node }) {
    return (
      <sub>
        <MyST ast={node.children} />
      </sub>
    );
  },
  superscript({ node }) {
    return (
      <sup>
        <MyST ast={node.children} />
      </sup>
    );
  },
  abbreviation({ node }) {
    return (
      <Tooltip title={node.title}>
        <abbr aria-label={node.title} className="border-b border-dotted cursor-help">
          <MyST ast={node.children} />
        </abbr>
      </Tooltip>
    );
  },
  mystComment() {
    return null;
  },
  comment() {
    return null;
  },
  definitionList({ node }) {
    return (
      <dl className="my-5" id={node.html_id}>
        <MyST ast={node.children} />
      </dl>
    );
  },
  definitionTerm({ node }) {
    const allowedStrongTypes = new Set(['text', 'emphasis']);
    const makeStrong =
      node.children?.reduce((allowed, n) => allowed && allowedStrongTypes.has(n.type), true) ??
      false;
    return (
      <dt id={node.html_id}>
        {makeStrong ? (
          <strong>
            <MyST ast={node.children} />
          </strong>
        ) : (
          <MyST ast={node.children} />
        )}
      </dt>
    );
  },
  definitionDescription({ node }) {
    return (
      <dd>
        <MyST ast={node.children} />
      </dd>
    );
  },
  keyboard({ node }) {
    return (
      <kbd>
        <MyST ast={node.children} />
      </kbd>
    );
  },
  include({ node }) {
    // TODO, provider could give context about the filename
    return <MyST ast={node.children} />;
  },
};

export default BASIC_RENDERERS;
