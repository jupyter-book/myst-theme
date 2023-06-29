import type { GenericParent } from 'myst-common';
import type { Config, IRenderMimeRegistry, ThebeCore } from 'thebe-core';
import type { IdKeyMap } from './types';

/**
 * Use the mdast to create a ThebeNotebook from the mdast tree of a notebook.
 * This is intended to be used to create an independent ThebeNotebook instance
 * for each notebook in a rendering context.
 *
 * NOTE: there is no need to scope the keys at this point, as the ThebeNotebook
 * instance will be scoped to the render context. All underlying cells will be
 * identified by keys from the mdast - so there may be duplicate ids between different
 * notebook instances, but that is ok as they came from the same mdast which is readonly.
 *
 * @param core
 * @param config
 * @param renderSlug - slug identifying the render context used for key decoration
 * @param mdast - the notebook mdast
 * @param idkMap - map of scoped block keys to keys for code and output cells
 * @param rendermime
 * @returns
 */

export function notebookFromMdast(
  core: ThebeCore,
  config: Config,
  notebookId: string,
  mdast: GenericParent,
  idkMap: IdKeyMap,
  rendermime: IRenderMimeRegistry,
) {
  const notebook = new core.ThebeNotebook(notebookId, config, rendermime);

  // no metadata included in mdast yet
  //Object.assign(notebook.metadata, ipynb.metadata);
  notebook.cells = (mdast.children as GenericParent[]).map((block: GenericParent) => {
    if (block.type !== 'block') console.warn(`Unexpected block type ${block.type}`);
    if (block.children.length == 2 && block.children[0].type === 'code') {
      const [codeCell, output] = block.children;

      // use the block.key to identify the cell but maintain a mapping
      // to allow code or output keys to look up cells and refs
      idkMap[block.key] = block.key;
      idkMap[codeCell.key] = block.key;
      idkMap[output.key] = block.key;
      return new core.ThebeCell(
        block.key,
        notebook.id,
        codeCell.value ?? '',
        config,
        block.data ?? {},
        notebook.rendermime,
      );
    } else {
      // assume content - concatenate it
      // TODO inject cell metadata
      const cell = new core.ThebeNonExecutableCell(
        block.key,
        notebook.id,
        block.children.reduce((acc, child) => acc + '\n' + (child.value ?? ''), ''),
        block.data ?? {},
        notebook.rendermime,
      );
      return cell;
    }
  });

  return notebook;
}
