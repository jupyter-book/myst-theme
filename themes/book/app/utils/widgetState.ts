import { copyNode, type GenericParent } from 'myst-common';
import type {  Widgets } from '@myst-theme/common';

const WIDGET_STATE_PATH = "application/vnd.jupyter.widget-state+json"
export function addWidgetStateToTree(tree: GenericParent, widgets: Widgets | undefined): GenericParent {
    if (!widgets?.[WIDGET_STATE_PATH]?.state) {
      return tree;
    }
  
    const states = widgets[WIDGET_STATE_PATH]?.state;
  
    const processOutput = (output: any) => {
      if (output.type === "output") {
        const content = output.data[0]?.data[WIDGET_STATE_PATH]?.content;
        if (content) {
          const { model_id } = JSON.parse(content);
          
          if (states[model_id] && output.data?.[0]) {
            output.data[0].data['widgetState'] = states[model_id];
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

  
