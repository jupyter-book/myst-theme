import type { MinifiedMimeBundle, MinifiedOutput } from 'nbtx';

async function requestImageAsBase64String(src: string) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';

  const base64String = new Promise<string>((resolve, reject) => {
    img.onload = function ol() {
      const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // eslint-disable-next-line no-console
        console.error('Could not get canvas context');
        return reject();
      }
      canvas.height = (img as HTMLImageElement).naturalHeight;
      canvas.width = (img as HTMLImageElement).naturalWidth;
      ctx.drawImage(img as HTMLImageElement, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      const [, base64] = dataURL.split(';base64,');
      resolve(base64);
    };
    // trigger the load
    img.src = src;
  });

  return base64String;
}

export async function fetchAndEncodeOutputImages(
  outputs: MinifiedOutput[],
): Promise<MinifiedOutput[]> {
  return Promise.all(
    outputs.map(async (output) => {
      if (!('data' in output)) return output;

      const imageMimetypes = Object.keys(output.data as MinifiedMimeBundle).filter(
        (mimetype) => mimetype !== 'image/svg' && mimetype.startsWith('image/'),
      );
      if (imageMimetypes.length === 0) return output;
      // this is an async fetch, so we need to await the result
      const images = await Promise.all(
        imageMimetypes.map(async (mimetype) => {
          /*
            image/* types can be either raw svg, base64 encoded or a URL.
            base64 encoded images can include data:image/*;base64, or be naked
            svgs can also be base64 encoded, or plain '<svg ...></svg>'.
            URLs can be relative or absolute
          */
          const data = (output.data as MinifiedMimeBundle)[mimetype];
          if (data.path) {
            const base64 = await requestImageAsBase64String(data.path);
            return { ...data, content: base64 };
          }
          return data;
        }),
      );

      imageMimetypes.forEach((mimetype, i) => {
        // eslint-disable-next-line no-param-reassign
        (output.data as MinifiedMimeBundle)[mimetype] = images[i];
      });

      return output;
    }),
  );
}
