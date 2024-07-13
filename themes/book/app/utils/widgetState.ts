import { copyNode, type GenericParent } from 'myst-common';
import type {  Widgets } from '@myst-theme/common';

export function addWidgetStateToTree(tree: GenericParent, widgets: Widgets | undefined): GenericParent {
    if (!widgets) {
      return tree;
    }
  
    const states = widgets["application/vnd.jupyter.widget-state+json"].state;
  
    const processOutput = (output: any) => {
      if (output.type === "output") {
        const content = output.data[0]?.data["application/vnd.jupyter.widget-view+json"]?.content;
        if (content) {
          const { model_id } = JSON.parse(content);
          if (states[model_id]) {
            output.widgetState = states[model_id];
          }
        }
      }
    };
  
    const processCodeBlock = (codeBlock: any) => {
      if (codeBlock.children) {
        codeBlock.children.forEach(processOutput);
      }
    };
  
    const processNode = (node: any) => {
      if (node.kind === "notebook-code") {
        processCodeBlock(node);
      }
      if (node.children) {
        node.children.forEach(processNode);
      }
    };
  
    processNode(tree);
    return tree;
  }

  
