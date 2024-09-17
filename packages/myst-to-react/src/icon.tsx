import type { NodeRenderer } from '@myst-theme/providers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Workaround to problem with icons being huge huge first load prior to resizing
// This ensures that the icon CSS is loaded immediately before attempting to render icons
// See https://github.com/FortAwesome/react-fontawesome/issues/134
import { library, config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';

// Prevent fontawesome from dynamically adding its css since we did it manually above
fontAwesomeConfig.autoAddCss = false;
fontAwesomeConfig.autoReplaceSvg = false;

library.add(fab, fas, far);

const icons = new Map(
  [...Object.values(fas), ...Object.values(far), ...Object.values(fab)].map((icon) => [
    `${icon.prefix}-${icon.iconName}`,
    icon,
  ]),
);

type IconSpec = {
  type: 'icon';
  kind: 'fas' | 'far' | 'fab';
  name: string;
};

export const IconRenderer: NodeRenderer<IconSpec> = ({ node }) => {
  switch (node.kind) {
    case 'fas':
    case 'far':
    case 'fab': {
      const icon = icons.get(`${node.kind}-${node.name}`) ?? fas.faCircleExclamation;
      console.log(`${node.kind}-${node.name}`);

      return <FontAwesomeIcon icon={icon} />;
    }
    default:
      return <FontAwesomeIcon icon={fas.faCircleExclamation} />;
  }
};

const ICON_RENDERERS = {
  icon: IconRenderer,
};

export default ICON_RENDERERS;
