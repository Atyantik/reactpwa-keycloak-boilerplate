import {
  IMAGE_CDN_URL,
  Image,
} from './image-cdn';

export const getVideoSrc = (video: Image): string => {
  if (!video) return '';
  let src = IMAGE_CDN_URL;
  if (video.filepath) {
    if (video.filepath.startsWith('/')) {
      src += video.filepath;
    } else {
      src = `/${src}${video.filepath}`;
    }
  }
  return src;
};
