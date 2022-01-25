import { useEffect, useState } from 'react';
import {
  getImgWithWidth,
  getNextWidth,
  isMaxDeviceWidth,
  Image,
} from '@utils/image-cdn';

function useResponsiveImage(image: string | Image) {
  const [img, setImg] = useState(getImgWithWidth(image, 10));
  useEffect(
    () => {
      let currentSize = 0;
      const monitorWindowResize = () => {
        const windowWidth = window.innerWidth;
        const nextSize = getNextWidth(windowWidth);
        if (nextSize > currentSize) {
          setImg(getImgWithWidth(image, nextSize));
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
  return img;
}

export { useResponsiveImage };
