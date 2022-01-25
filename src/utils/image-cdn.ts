import { getAppUrl, getEnv } from '@utils/env';

export let IMAGE_CDN_URL = getEnv(
  'IMAGE_CDN_URL',
  process.env.IMAGE_CDN_URL || 'https://cdn.example.com/',
);
if (!IMAGE_CDN_URL.endsWith('/')) {
  IMAGE_CDN_URL += '/';
}
const CF_PREFIX = getEnv('CF_PREFIX', process.env.CF_PREFIX || 'cdn-cgi/image');
const deviceWidths: number[] = [
  320,
  640,
  960,
  1280,
  1440,
];

type ImageOptions = {
  fit?: string;
  width?: number;
  quality?: number;
  height?: number;
  format?: string;
  deviceWidths?: number[],
};

export type Image = {
  tags?: string[];
  attributes?: {
    [key: string]: any,
  };
  filepath?: string;
};

const defaultImageOptions = {
  fit: 'contain',
  format: 'auto',
  height: 0,
  quality: 85,
  width: 0,
};

export const getImageSrc = (img: Image, options: ImageOptions = {}): string => {
  if (!img) return '';
  const imageOptions = { ...defaultImageOptions, ...options };
  let src = IMAGE_CDN_URL;
  let imageWidth = deviceWidths[deviceWidths.length - 1];
  if (imageOptions.width) {
    imageWidth = imageOptions.width;
  }
  const cfOptions: string[] = [];
  if (imageWidth) {
    cfOptions.push(`width=${imageWidth}`);
  }
  if (imageOptions.fit) {
    cfOptions.push(`fit=${imageOptions.fit}`);
  }
  if (imageOptions.height) {
    cfOptions.push(`height=${imageOptions.height}`);
  }
  if (imageOptions.quality) {
    cfOptions.push(`quality=${imageOptions.quality}`);
  }
  if (imageOptions.format) {
    cfOptions.push(`format=${imageOptions.format}`);
  }
  if (cfOptions.length) {
    src += `${CF_PREFIX}/${cfOptions.join(',')}`;
  }
  if (img.filepath) {
    if (img.filepath.startsWith('/')) {
      src += img.filepath;
    } else {
      src = `/${src}${img.filepath}`;
    }
  }
  return src;
};

export const getImageSrcset = (img: Image, options: ImageOptions = {}) => {
  const imageOptions = { ...defaultImageOptions, ...options };
  let imageWidth = deviceWidths[deviceWidths.length - 1];
  if (imageOptions.width) {
    imageWidth = imageOptions.width;
  }
  const src = getImageSrc(img, { ...options, ...{ width: imageWidth } });
  const srcset: string[] = [];
  const sizes: string[] = [];
  // If we already have image size greater than requested width
  // then provide a 2x size of image for better pixel density
  if (imageOptions.width) {
    const highQualitySrc = getImageSrc(
      img,
      {
        ...options,
        ...{
          width: imageOptions.width * 2,
        },
      },
    );
    srcset.push(`${highQualitySrc} 2x`);
  } else if (!imageOptions.width) {
    const widths = options.deviceWidths ?? deviceWidths;
    // Add srcset for of appropriate size
    widths.forEach((width: number) => {
      const url = getImageSrc(
        img,
        {
          ...options,
          ...{
            width,
          },
        },
      );
      srcset.push(`${url} ${width}w`);
    });
    sizes.push('100vw');
  }

  return {
    src,
    srcset,
    sizes,
  };
};

export const getLocalImageSrc = (img: string, options: ImageOptions = {}): string => {
  if (!img) return '';
  const appUrl = getAppUrl();
  if (appUrl.indexOf('localhost') !== -1 || appUrl.indexOf('local.') !== -1) {
    return img;
  }
  let src = '';
  const imageOptions = { ...defaultImageOptions, ...options };
  let imageWidth = deviceWidths[deviceWidths.length - 1];
  if (imageOptions.width) {
    imageWidth = imageOptions.width;
  }
  const cfOptions: string[] = [];
  if (imageWidth) {
    cfOptions.push(`width=${imageWidth}`);
  }
  if (imageOptions.fit) {
    cfOptions.push(`fit=${imageOptions.fit}`);
  }
  if (imageOptions.height) {
    cfOptions.push(`height=${imageOptions.height}`);
  }
  if (imageOptions.quality) {
    cfOptions.push(`quality=${imageOptions.quality}`);
  }
  if (imageOptions.format && img.indexOf('.gif') === -1) {
    cfOptions.push(`format=${imageOptions.format}`);
  }
  if (cfOptions.length) {
    src += `${CF_PREFIX}/${cfOptions.join(',')}`;
  }
  src += img;
  return src.startsWith('/') ? src : `/${src}`;
};

export const getLocalImageSrcset = (img: string, options: ImageOptions = {}) => {
  if (!img) {
    throw new Error('Invalid Image provided');
  }
  const srcset: string[] = [];
  const sizes: string[] = [];
  const imageOptions = { ...defaultImageOptions, ...options };
  let imageWidth = deviceWidths[deviceWidths.length - 1];
  if (imageOptions.width) {
    imageWidth = imageOptions.width;
  }
  const src = getLocalImageSrc(img, { ...options, ...{ width: imageWidth } });
  // If we already have image size greater than requested width
  // then provide a 2x size of image for better pixel density
  const widths = options.deviceWidths ?? deviceWidths;
  // Add srcset for of appropriate size
  widths.forEach((width: number) => {
    const url = getLocalImageSrc(
      img,
      {
        ...options,
        ...{
          width,
        },
      },
    );
    srcset.push(`${url} ${width}w`);
  });
  sizes.push('100vw');

  return {
    src,
    srcset,
    sizes,
  };
};


export const getImgWithWidth = (image: Image | string, maxWidth?: number) => {
  let img: ReturnType<typeof getImageSrcset>;
  if (typeof image === 'string' && !image.startsWith('http')) {
    img = getLocalImageSrcset(image, { width: maxWidth });
  } else if (typeof image === 'string' && image.startsWith('http')) {
    img = {
      src: image,
      srcset: [],
      sizes: [],
    };
  } else {
    img = getImageSrcset(image as Image, { width: maxWidth });
  }
  return img;
};


export const getNextWidth = (width = 0) => {
  if (width >= deviceWidths[deviceWidths.length - 1]) {
    return deviceWidths[deviceWidths.length - 1];
  }
  const nextWidth = deviceWidths.find(w => {
    if (w >= width) {
      return w;
    }
  });
  if (!nextWidth) {
    return deviceWidths[deviceWidths.length - 1];
  }
  return nextWidth;
};

export const isMaxDeviceWidth = (width = 0) => (width >= deviceWidths[deviceWidths.length - 1]);
