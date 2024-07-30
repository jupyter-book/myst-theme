import { MyST } from './MyST.js';

type HasValue = {
  value: string;
};

type HasTextChildren = {
  children: HasValue[];
};

type HasChildren = {
  children: any[];
};

const preParentRenderer = ({ node }: { node: HasTextChildren }) => {
  const [child] = node.children;
  return <span className="whitespace-pre">{child.value}</span>;
};

const renderChildren = ({ node }: { node: HasChildren }) => {
  return <MyST ast={node.children} />;
};

const AUTODOC_RENDERERS = {
  descType: preParentRenderer,
  descType_parameter: preParentRenderer,
  descAddname: preParentRenderer,
  descParameterlist({ node }: { node: HasChildren }) {
    const merged: React.ReactNode[] = [];
    node.children.slice(0, -1).forEach((item) => {
      merged.push(<MyST ast={item} />);
      merged.push(<>, </>);
    });
    if (node.children.length > 0) {
      merged.push(<MyST ast={node.children[node.children.length - 1]} />);
    }
    return [<>(</>, ...merged, <>)</>];
  },
  descName({ node }: { node: HasTextChildren }) {
    const [child] = node.children;
    return <span className="whitespace-pre font-bold">{child.value}</span>; //
  },
  fieldList({ node }: { node: HasChildren }) {
    return (
      <dl>
        <MyST ast={node.children} />
      </dl>
    );
  },
  fieldListItem({ node }: { node: HasChildren }) {
    return (
      <p>
        <MyST ast={node.children} />
      </p>
    );
  },
  fieldName({ node }: { node: HasChildren }) {
    return (
      <dt>
        <MyST ast={node.children} />
      </dt>
    );
  },
  fieldDescription({ node }: { node: HasChildren }) {
    return (
      <dd>
        <MyST ast={node.children} />
      </dd>
    );
  },
  desc({ node }: { node: HasChildren }) {
    return (
      <dl>
        <MyST ast={node.children} />
      </dl>
    );
  },
  descSignature({ node }: { node: HasChildren }) {
    return (
      <dt className="font-mono font-light">
        <MyST ast={node.children} />
      </dt>
    );
  },
  descContent({ node }: { node: HasChildren }) {
    return (
      <dd>
        <MyST ast={node.children} />
      </dd>
    );
  },
  descAnnotation: renderChildren,
  descParameter: renderChildren,
  descReturns({ node }: { node: HasChildren }) {
    return (
      <span className="before:content-['_→_']">
        <MyST ast={node.children as any} />
      </span>
    );
  },
  descSigPunctuation: preParentRenderer,
  descSigSpace: preParentRenderer,
  descSigName: renderChildren,
  descSigOperator: preParentRenderer,
  descSigKeyword: preParentRenderer,
  descSigKeywordType: preParentRenderer,
  descSigKeywordLiteralNumber: preParentRenderer,
  descSigKeywordLiteralString: preParentRenderer,
  descSigKeywordLiteralChar: preParentRenderer,
};
export default AUTODOC_RENDERERS;
