import { MastodonIcon, TwitterIcon, GithubIcon, DiscordIcon } from '@scienceicons/react/24/solid';
import { Link } from '@remix-run/react';
import classNames from 'classnames';
import { extractPart } from 'myst-common';
import { MyST } from 'myst-to-react';
import { select, selectAll, matches } from 'unist-util-select';
import { filter } from 'unist-util-filter';


export function SiteFooter({ tight, content }: { tight?: boolean }) {
  const footerBlock = selectAll('block', content).find((node) => node.kind == 'footer');
  const footerColumnsBlock = selectAll('block', content).find((node) => node.kind == 'footer-columns');
  const footerLists = selectAll('list', footerColumnsBlock);

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
              <MyST ast={footerBlock}/>
            </div>
            <div className="hidden grow lg:block"></div>
            <div className="flex flex-row">
              {footerLists.map((lst, i) => <MyST ast={lst} key={i} className="list-none mr-10 leading-loose lg:px-4"/>)}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
