import type { Image as ImageNodeSpec } from 'myst-spec';
import type { NodeRenderer } from '@myst-theme/providers';

type Alignment = 'left' | 'center' | 'right';

type ImageNode = ImageNodeSpec & { height?: string };

function getStyleValue(width?: number | string): string | number | undefined {
  if (typeof width === 'number' && Number.isNaN(width)) {
    // If it is nan, return undefined.
    return undefined;
  }
  if (typeof width === 'string') {
    if (width.endsWith('%')) {
      return width;
    } else if (width.endsWith('px')) {
      return Number(width.replace('px', ''));
    } else if (!Number.isNaN(Number(width))) {
      return Number(width);
    }
    console.log(`Unknown width ${width} in getImageWidth`);
    return undefined;
  }
  return width;
}

function alignToMargin(align: string) {
  switch (align) {
    case 'left':
      return { marginRight: 'auto' };
    case 'right':
      return { marginLeft: 'auto' };
    case 'center':
      return { margin: '0 auto' };
    default:
      return {};
  }
}

function Video({
  className,
  id,
  src,
  urlSource,
  align = 'center',
  width,
  height,
}: {
  className?: string;
  id?: string;
  src: string;
  urlSource?: string;
  width?: string;
  height?: string;
  align?: Alignment;
}) {
  return (
    <video
      // className={className}
      id={id}
      style={{
        width: getStyleValue(width),
        height: getStyleValue(height),
        ...alignToMargin(align),
      }}
      src={src}
      data-canonical-url={urlSource}
      autoPlay
      // For autoplay, the element needs to be muted to actually start!
      muted
      webkit-playsinline="true"
      playsInline
      loop
    />
  );
}

function Picture({
  className,
  id,
  src,
  srcOptimized,
  urlSource,
  align = 'center',
  alt,
  width,
  height,
}: {
  className?: string;
  id?: string;
  src: string;
  srcOptimized?: string;
  urlSource?: string;
  alt?: string;
  width?: string;
  height?: string;
  align?: Alignment;
}) {
  if (src.endsWith('.mp4') || urlSource?.endsWith('.mp4')) {
    return (
      <Video
        className={className}
        id={id}
        width={width}
        height={height}
        align={align}
        src={src}
        urlSource={urlSource}
      />
    );
  }
  const image = (
    <img
      id={id}
      style={{
        width: getStyleValue(width),
        height: getStyleValue(height),
        ...alignToMargin(align),
      }}
      src={src}
      alt={alt}
      data-canonical-url={urlSource}
    />
  );
  if (!srcOptimized) return image;
  return (
    <picture className={className}>
      <source srcSet={srcOptimized} type="image/webp" />
      {image}
    </picture>
  );
}

export const Image: NodeRenderer<ImageNode> = ({ node }) => {
  return (
    <Picture
      className={node.class}
      id={node.html_id || node.identifier || node.key}
      src={node.url}
      srcOptimized={(node as any).urlOptimized}
      alt={node.alt || node.title}
      width={node.width || undefined}
      height={node.height || undefined}
      align={node.align}
      // Note that sourceUrl is for backwards compatibility
      urlSource={(node as any).urlSource || (node as any).sourceUrl}
    />
  );
};

const IMAGE_RENDERERS = {
  image: Image,
};

export default IMAGE_RENDERERS;
