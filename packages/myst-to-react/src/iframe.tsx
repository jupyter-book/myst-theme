import type { NodeRenderer } from '@myst-theme/providers';
import classNames from 'classnames';

/** This is duplicated in image, but a bit different logic */
function getStyleValue(width?: number | string): number | undefined {
  if (typeof width === 'number' && Number.isNaN(width)) {
    // If it is nan, return undefined.
    return undefined;
  }
  if (typeof width === 'string') {
    if (width.endsWith('%')) {
      return getStyleValue(Number(width.replace('%', '')));
    } else if (width.endsWith('px')) {
      const px = getStyleValue(Number(width.replace('px', '')));
      return px ? px / 750 : 70;
    } else if (!Number.isNaN(Number(width))) {
      return Number(width);
    }
    console.log(`Unknown width ${width} in getImageWidth`);
    return undefined;
  }
  return width;
}

export const IFrame: NodeRenderer = ({ node }) => {
  const width = getStyleValue(node.width) || 70;
  return (
    <div
      id={node.label || undefined}
      style={{ textAlign: node.align || 'center' }}
      className={classNames('leading-[0]', node.class)}
    >
      <div
        className="relative inline-block"
        style={{
          paddingBottom: '60%',
          width: `min(max(${width}%, 500px), 100%)`,
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src={node.src}
          allowFullScreen
          allow="autoplay"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            border: 'none',
          }}
        ></iframe>
      </div>
    </div>
  );
};

const IFRAME_RENDERERS = {
  iframe: IFrame,
};

export default IFRAME_RENDERERS;
