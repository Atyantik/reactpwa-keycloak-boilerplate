import { getEnv } from '@utils/env';

import Icon640 from '@resources/pwa-icons/iconx640.png';
import Icon512 from '@resources/pwa-icons/iconx512.png';
import Icon192 from '@resources/pwa-icons/iconx192.png';
import Icon152 from '@resources/pwa-icons/iconx152.png';
import Icon144 from '@resources/pwa-icons/iconx144.png';
import Icon128 from '@resources/pwa-icons/iconx128.png';
import Icon96 from '@resources/pwa-icons/iconx96.png';
import Icon72 from '@resources/pwa-icons/iconx72.png';
import Icon48 from '@resources/pwa-icons/iconx48.png';

const appName = getEnv('APP_NAME', process.env.APP_NAME || 'Example APP');
const appShortName = getEnv('APP_SHORT_NAME', process.env.APP_SHORT_NAME || 'Exmp');
const appDescription = getEnv('APP_DESCRIPTION', process.env.APP_DESCRIPTION || 'Example App Description');


export default {
  name: appName,
  short_name: appShortName,

  // Possible values ltr(left to right)/rtl(right to left)
  dir: 'ltr',

  // language: Default en-US
  lang: 'en-US',

  // Orientation of web-app possible:
  // any, natural, landscape, landscape-primary, landscape-secondary,
  // portrait, portrait-primary, portrait-secondary
  orientation: 'any',
  start_url: '/',
  background_color: '#fff',
  theme_color: '#000',
  display: 'standalone',
  description: appDescription,
  icons: [
    {
      src: Icon640,
      sizes: '640x640',
      type: 'image/png',
    },
    {
      sizes: '512x512',
      src: Icon512,
    },
    {
      sizes: '192x192',
      src: Icon192,
    },
    {
      sizes: '152x152',
      src: Icon152,
    },
    {
      sizes: '144x144',
      src: Icon144,
    },
    {
      sizes: '128x128',
      src: Icon128,
    },
    {
      sizes: '96x96',
      src: Icon96,
    },
    {
      sizes: '72x72',
      src: Icon72,
    },
    {
      sizes: '48x48',
      src: Icon48,
    },
  ],
};
