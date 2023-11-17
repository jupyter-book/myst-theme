import type { GenericParent } from 'myst-common';
import type { Config, IRenderMimeRegistry, ThebeCore } from 'thebe-core';
import type { IdKeyMap, IdKeyMapTarget } from './types.js';

/**
 * Return executable code/output from block or single figure inside block
 */
export function executableNodesFromBlock(block: GenericParent) {
  if (!block || block.type !== 'block') return;
  let target = block;
  if (block.children && block.children.length === 1 && block.children[0].type === 'container') {
    target = block.children[0] as GenericParent;
  }
  if (target.children && target.children.length >= 2 && target.children[0].type === 'code') {
    return { codeCell: target.children[0], output: target.children[1] };
  }
}

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
 * @param pageSlug - slug identifying the render context used for key decoration
 * @param mdast - the notebook mdast
 * @param idkmap - map of scoped block keys to keys for code and output cells
 * @param rendermime
 * @returns
 */

export function notebookFromMdast(
  core: ThebeCore,
  config: Config,
  pageSlug: string,
  notebookSlug: string,
  mdast: GenericParent,
  idkmap: IdKeyMap,
  rendermime: IRenderMimeRegistry,
) {
  // note the notebooks slug is used as the notebook id, this means accross pages
  // mulitple notebooks with the same slug will be present but scoped to different pages
  // the busyScope mecahnism relies on the notebookSlug as id
  const notebook = new core.ThebeNotebook(notebookSlug, config, rendermime);

  // no metadata included in mdast yet
  //Object.assign(notebook.metadata, ipynb.metadata);

  notebook.cells = (mdast.children as GenericParent[]).map((block: GenericParent) => {
    if (block.type !== 'block') console.warn(`Unexpected block type ${block.type}`);
    const executableNodes = executableNodesFromBlock(block);
    if (executableNodes) {
      const { codeCell, output } = executableNodes;

      // use the block.key to identify the cell but maintain a mapping
      // to allow code or output keys to look up cells and refs and idenifity
      // the cell in the correct notebook
      const target: IdKeyMapTarget = {
        pageSlug,
        notebookSlug,
        cellId: block.key,
      };

      idkmap[block.key] = target; // can reference from block in notebook views
      idkmap[output.id] = target; // can reference from output in article views

      // include identifiers to enable lookup by (normalized) labels
      if (block.identifier) idkmap[block.identifier] = target;
      if (codeCell.identifier) idkmap[codeCell.identifier] = target;
      if (output.identifier) idkmap[output.identifier] = target;

      return new core.ThebeCodeCell(
        target.cellId,
        notebook.id,
        codeCell.value ?? '',
        config,
        block.data ?? {},
        notebook.rendermime,
      );
    } else {
      // assume content - concatenate it
      // TODO inject cell metadata
      const cell = new core.ThebeMarkdownCell(
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
