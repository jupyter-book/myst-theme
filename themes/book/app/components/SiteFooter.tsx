import type { GenericNode, GenericParent } from 'myst-common';
import classNames from 'classnames';
import { MyST } from 'myst-to-react';
import { select, selectAll } from 'unist-util-select';


export function SiteFooter({ tight, content }: { tight?: boolean, content: GenericParent }) {
  const footerBlock = select('block[kind=footer-description]', content) as GenericNode | undefined;
  const footerColumnBlocks = selectAll('block[kind=footer-column]', content) as GenericParent[];

  return (
    <section className={classNames('col-screen article-grid', { 'mt-10': !tight, 'mt-0': tight })}>
      <div
        className={classNames('bg-white dark:bg-slate-950 shadow-2xl col-screen article-grid', {
          'shadow-orange-400 dark:shadow-orange-600 mt-5 md:mt-12': !tight,
          'border-t border-slate-100 dark:border-slate-800': tight,
        })}
      >
        <div className="my-10 col-page">
          <div className="flex flex-col items-center w-full p-2 my-4 sm:p-5 lg:flex-row lg:flex-wrap">
            <div className="max-w-[200px]">
              { footerBlock && <MyST ast={footerBlock}/> }
            </div>
            <div className="hidden grow lg:block"></div>
            <div className="flex flex-row">
              {footerColumnBlocks.map((blk, i) =>
                <MyST
                  ast={blk.children}
                  key={i}
                  className={classNames(blk.class, "list-none mr-10 leading-loose lg:px-4")}/>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
