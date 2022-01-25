import { useEffect, useState } from 'react';
import {
  getImgWithWidth,
  getNextWidth,
  isMaxDeviceWidth,
  Image,
} from '@utils/image-cdn';

type ResponsiveImageType = string | Image;

function useResponsiveImages(images: ResponsiveImageType[]) {
  const [imgs, setImgs] = useState(images.map(i => getImgWithWidth(i, 10)));
  useEffect(
    () => {
      let currentSize = 0;
      const monitorWindowResize = () => {
        const windowWidth = window.innerWidth;
        const nextSize = getNextWidth(windowWidth);
        if (nextSize > currentSize) {
          setImgs(images.map(i => getImgWithWidth(i, nextSize)));
          currentSize = nextSize;
          if (isMaxDeviceWidth(currentSize)) {
            window.removeEventListener('resize', monitorWindowResize);
          }
        }
      };
      window.addEventListener('resize', monitorWindowResize, { passive: true });
      monitorWindowResize();
      return () => {
        window.removeEventListener('resize', monitorWindowResize);
      };
    },
    [],
  );
  return imgs;
}

export { useResponsiveImages };
