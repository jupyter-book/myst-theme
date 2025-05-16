import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import { MyST } from 'myst-to-react';

export function Footer({ content }: { content: GenericParent }) {
  return (
    <footer className={classNames('col-screen article-grid mt-10')}>
      <div className="bg-white dark:bg-slate-950 shadow-2xl col-screen article-grid shadow mt-5">
        <div className="my-10 article-grid col-page py-4">
          <MyST ast={content} />
        </div>
      </div>
    </footer>
  );
}
