import { getEnv } from '@utils/env';
import DefaultSEOImage from '@resources/seo-images/default.png';
import { getLocalImageSrc } from '@utils/image-cdn';

const optimizedDefaultSEOImage = getLocalImageSrc(DefaultSEOImage);
const appName = getEnv('APP_NAME', process.env.APP_NAME || 'Example App');
const appDescription = getEnv('APP_DESCRIPTION', process.env.APP_DESCRIPTION || 'Example APP Description');
const appKeywords = (
  getEnv('APP_KEYWORDS', process.env.APP_KEYWORDS || '')).split(',').map((k: string) => k.trim(),
);

export default {
  title: appName,
  description: appDescription,
  keywords: appKeywords,
  image: optimizedDefaultSEOImage,
  site_name: appName,
  type: 'article', // article/product/music/video
};
