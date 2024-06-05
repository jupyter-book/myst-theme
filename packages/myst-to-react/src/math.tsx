import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { InlineMath, Math } from 'myst-spec';
import { InlineError } from './inlineError.js';
import { HashLink } from './hashLink.js';
import type { NodeRenderer } from '@myst-theme/providers';

// function Math({ value, html }: { value: string; html: string }) {
//   const [loaded, setLoaded] = useState(false);
//   const ref = useRef<HTMLDivElement | null>(null);
//   useEffect(() => {
//     import('katex').then(() => {
//       setLoaded(true);
//     });
//   }, []);
//   useEffect(() => {
//     if (!loaded) return;
//     import('katex').then(({ default: katex }) => {
//       if (!ref.current) return;
//       katex.render(value, ref.current, { displayMode: true });
//     });
//   }, [loaded, ref]);
//   return (
//     <>
//       {(typeof document === 'undefined' || !loaded) && (
//         <div dangerouslySetInnerHTML={{ __html: html }} />
//       )}
//       {loaded && <div ref={ref} />}
//     </>
//   );
// }

type MathLike = (InlineMath | Math) & {
  error?: boolean;
  message?: string;
  html?: string;
};

const mathRenderer: NodeRenderer<MathLike> = ({ node }) => {
  if (node.type === 'math') {
    if (node.error || !node.html) {
      return (
        <pre title={node.message}>
          <span className="text-red-500">
            <ExclamationCircleIcon width="1rem" height="1rem" className="inline mr-1" />
            {node.message}
            {'\n\n'}
          </span>
          {node.value}
        </pre>
      );
    }
    const id = node.html_id || node.identifier || node.key;
    return (
      <div id={id} className="flex my-5 group">
        <div
          dangerouslySetInnerHTML={{ __html: node.html }}
          className="flex-grow overflow-x-auto overflow-y-hidden"
        />
        {node.enumerator && (
          <div className="relative self-center flex-none pl-2 m-0 text-right select-none">
            <HashLink id={id} kind="Equation" className="text-inherit hover:text-inherit">
              ({node.enumerator})
            </HashLink>
          </div>
        )}
      </div>
    );
  }
  if (node.error || !node.html) {
    return <InlineError value={node.value} message={node.message} />;
  }
  return <span dangerouslySetInnerHTML={{ __html: node.html }} />;
  // return <Math html={node.html} value={node.value as string} />;
};

const MATH_RENDERERS = {
  math: mathRenderer,
  inlineMath: mathRenderer,
};

export default MATH_RENDERERS;
