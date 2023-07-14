import type * as spec from 'myst-spec';
import { HashLink } from './heading';
import type { NodeRenderer } from '@myst-theme/providers';
import classNames from 'classnames';
import { Tooltip } from './components';
import { MySTChildren } from './convertToReact';

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

type BasicNodeRenderers = {
  strong: NodeRenderer<spec.Strong>;
  emphasis: NodeRenderer<spec.Emphasis>;
  link: NodeRenderer<spec.Link>;
  paragraph: NodeRenderer<spec.Paragraph>;
  break: NodeRenderer<spec.Break>;
  inlineMath: NodeRenderer<spec.InlineMath>;
  math: NodeRenderer<spec.Math>;
  list: NodeRenderer<spec.List>;
  listItem: NodeRenderer<spec.ListItem & { checked?: boolean }>;
  container: NodeRenderer<spec.Container>;
  caption: NodeRenderer<spec.Caption>;
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
  smallcaps: NodeRenderer<SmallCaps>;
  // definitions
  definitionList: NodeRenderer<DefinitionList>;
  definitionTerm: NodeRenderer<DefinitionTerm>;
  definitionDescription: NodeRenderer<DefinitionDescription>;
};

const BASIC_RENDERERS: BasicNodeRenderers = {
  delete({ node }) {
    return (
      <del>
        <MySTChildren nodes={node.children} />
      </del>
    );
  },
  strong({ node }) {
    return (
      <strong>
        <MySTChildren nodes={node.children} />
      </strong>
    );
  },
  emphasis({ node }) {
    return (
      <em>
        <MySTChildren nodes={node.children} />
      </em>
    );
  },
  underline({ node }) {
    return (
      <span style={{ textDecoration: 'underline' }}>
        <MySTChildren nodes={node.children} />
      </span>
    );
  },
  smallcaps({ node }) {
    return (
      <span style={{ fontVariant: 'small-caps' }}>
        <MySTChildren nodes={node.children} />
      </span>
    );
  },
  link({ node }) {
    return (
      <a target="_blank" href={node.url} rel="noreferrer">
        <MySTChildren nodes={node.children} />
      </a>
    );
  },
  paragraph({ node }) {
    return (
      <p id={node.html_id}>
        <MySTChildren nodes={node.children} />
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
          <MySTChildren nodes={node.children} />
        </ol>
      );
    }
    return (
      <ul id={node.html_id}>
        <MySTChildren nodes={node.children} />
      </ul>
    );
  },
  listItem({ node }) {
    if (node.checked == null) {
      return (
        <li>
          <MySTChildren nodes={node.children} />
        </li>
      );
    }
    return (
      <li className="task-list-item">
        <input type="checkbox" className="task-list-item-checkbox" defaultChecked={node.checked} />
        <MySTChildren nodes={node.children} />
      </li>
    );
  },
  container({ node }) {
    return (
      <figure
        id={node.html_id || node.identifier || node.key}
        className={classNames(node.kind, node.class)}
      >
        <MySTChildren nodes={node.children} />
      </figure>
    );
  },
  caption({ node }) {
    return (
      <figcaption className="group">
        <MySTChildren nodes={node.children} />
      </figcaption>
    );
  },
  blockquote({ node }) {
    return (
      <blockquote id={node.html_id}>
        <MySTChildren nodes={node.children} />
      </blockquote>
    );
  },
  thematicBreak() {
    return <hr className="py-2 my-5 translate-y-2" />;
  },
  captionNumber({ node }) {
    // function backwardsCompatibleLabel(value: string, kind?: string) {
    //   const capital = kind?.slice(0, 1).toUpperCase() ?? 'F';
    //   const body = kind?.slice(1) ?? 'igure';
    //   return `${capital}${body}: ${children}`;
    // }
    // const label =
    //   typeof node.children === 'string' ? backwardsCompatibleLabel(node.children, node.kind) : node.children;
    // TODO this isn't quite right!
    const id = node.html_id || node.identifier || node.key;
    return (
      <HashLink
        id={id}
        kind={node.kind}
        className="mr-1 font-semibold text-inherit hover:text-inherit hover:font-semibold"
      >
        <MySTChildren nodes={node.children} />
      </HashLink>
    );
  },
  table({ node }) {
    // TODO: actually render the tbody on the server if it isn't included here.
    return (
      <table>
        <tbody>
          <MySTChildren nodes={node.children} />
        </tbody>
      </table>
    );
  },
  tableRow({ node }) {
    return (
      <tr>
        <MySTChildren nodes={node.children} />
      </tr>
    );
  },
  tableCell({ node }) {
    const ifGreaterThanOne = (num?: number) => (num === 1 ? undefined : num);
    const attrs = {
      rowSpan: ifGreaterThanOne(node.rowspan),
      colSpan: ifGreaterThanOne(node.colspan),
    };
    if (node.header)
      return (
        <th {...attrs}>
          <MySTChildren nodes={node.children} />
        </th>
      );
    return (
      <td {...attrs}>
        <MySTChildren nodes={node.children} />
      </td>
    );
  },
  subscript({ node }) {
    return (
      <sub>
        <MySTChildren nodes={node.children} />
      </sub>
    );
  },
  superscript({ node }) {
    return (
      <sup>
        <MySTChildren nodes={node.children} />
      </sup>
    );
  },
  abbreviation({ node }) {
    return (
      <Tooltip title={node.title}>
        <abbr aria-label={node.title} className="border-b border-dotted cursor-help">
          <MySTChildren nodes={node.children} />
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
        <MySTChildren nodes={node.children} />
      </dl>
    );
  },
  definitionTerm({ node }) {
    // let strongChildren: React.ReactNode = children;
    // if (Array.isArray(children)) {
    //   const allowedStrongTypes = new Set(['emphasis']);
    //   strongChildren = children.map((child, i) => {
    //     if (typeof child === 'string') return <strong key={node.key + i}>{child}</strong>;
    //     if (allowedStrongTypes.has(child?.type)) return <strong key={node.key + i}>{child}</strong>;
    //     return child;
    //   });
    // } else if (typeof children === 'string') {
    //   strongChildren = <strong key={node.key + '0'}>{children}</strong>;
    // }

    // TODO
    return (
      <dt id={node.html_id}>
        <MySTChildren nodes={node.children} />
      </dt>
    );
  },
  definitionDescription({ node }) {
    return (
      <dd>
        <MySTChildren nodes={node.children} />
      </dd>
    );
  },
};

export default BASIC_RENDERERS;
