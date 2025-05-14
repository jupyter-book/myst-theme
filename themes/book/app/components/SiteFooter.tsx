import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import { MyST } from 'myst-to-react';


export function SiteFooter({ tight, content }: { tight?: boolean, content: GenericParent }) {
  return (
    <section className={classNames('col-screen article-grid', { 'mt-10': !tight, 'mt-0': tight })}>
      <MyST ast={content}/>
    </section>
  );
}
