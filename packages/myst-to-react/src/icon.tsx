import React from 'react';
import type { NodeRenderer } from '@myst-theme/providers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import * as oct from '@primer/octicons-react';
import * as mui from '@mui/icons-material';

// Workaround to problem with icons being huge first load prior to resizing
// This ensures that the icon CSS is loaded immediately before attempting to render icons
// See https://github.com/FortAwesome/react-fontawesome/issues/134
import { library, config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';

// Prevent fontawesome from dynamically adding its css since we did it manually above
fontAwesomeConfig.autoAddCss = false;
fontAwesomeConfig.autoReplaceSvg = false;

library.add(fab, fas, far);

function titleCaseToHyphenated(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const ICON_RENDERER_IMPLS = new Map(
  [
    // Font Awesome
    ...[...Object.values(fas), ...Object.values(far), ...Object.values(fab)].map((icon) => [
      `${icon.prefix}-${icon.iconName}`,
      () => <FontAwesomeIcon icon={icon} />,
    ]),
    // Octicons
    ...Object.entries(oct).map(([name, icon]) => {
      const iconName = titleCaseToHyphenated(name.replace(/Icon$/, ''));

      return [`oct-${iconName}`, () => React.createElement(icon, {})];
    }),
    // Material
    ...Object.entries(mui).map(([name, icon]) => {
      if (name === 'default') {
        return undefined;
      }
      const [_, nameTitled, styleTitled] = name.match(/^(.*?)(TwoTone|Outlined|Rounded|Sharp)?$/)!;
      const iconStyle = styleTitled ? titleCaseToHyphenated(styleTitled) : undefined;
      let iconFamily: string;
      switch (iconStyle) {
        case undefined:
          iconFamily = 'mrg';
          break;
        case 'sharp':
          iconFamily = 'msp';
          break;
        case 'two-tone':
          iconFamily = 'mtt';
          break;
        case 'rounded':
          iconFamily = 'mrd';
          break;
        case 'outlined':
          iconFamily = 'mol';
          break;
        default:
          throw new Error(iconStyle);
      }
      const iconName = titleCaseToHyphenated(nameTitled);
      return [`${iconFamily}-${iconName}`, () => React.createElement(icon as any, {})];
    }),
  ].filter((x) => x) as [string, any][],
);

type IconSpec = {
  type: 'icon';
  kind: 'fas' | 'far' | 'fab' | 'oct' | 'mtt' | 'mol' | 'mrg' | 'msp' | 'mrd';
  name: string;
};
//console.log(mui, Object.keys(mui));
export const IconRenderer: NodeRenderer<IconSpec> = ({ node }) => {
  const icon =
    ICON_RENDERER_IMPLS.get(`${node.kind}-${node.name}`) ??
    (() => <FontAwesomeIcon icon={fas.faCircleExclamation} />);
  return icon();
};

const ICON_RENDERERS = {
  icon: IconRenderer,
};

export default ICON_RENDERERS;
