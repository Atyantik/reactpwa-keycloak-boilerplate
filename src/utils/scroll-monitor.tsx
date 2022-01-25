import { getTabHistory } from '@utils/storage';

const paths: { url: string; scrollPosition: number; } [] = [];

export const ignoredPaths = [
  '/search',
];

export const getScrolledPaths = () => paths.map(p => ({
  url: p.url.split(window.location.hostname).pop(),
  scrollPosition: p.scrollPosition,
}));

const scrollMonitor = () => {
  const { scrollY } = window;
  const parsedUrl = new URL(window.location.href);
  if (!parsedUrl.pathname.endsWith('/')) {
    parsedUrl.pathname += '/';
  }
  const href = parsedUrl.toString();
  let previousPath = paths.find(p => p.url === href);
  if (!previousPath) {
    previousPath = {
      url: href,
      scrollPosition: scrollY,
    };
    // Make sure while pushing code that, there is no more than 30 urls managed in memory
    paths.push(previousPath);
    if (paths.length > 30) {
      paths.splice(0, paths.length - 30);
    }
  } else {
    previousPath.scrollPosition = scrollY;
  }
};
const debouncedScrollMonitor = scrollMonitor;

export const removeListener = () => {
  document.removeEventListener('wheel', debouncedScrollMonitor);
  document.removeEventListener('scroll', debouncedScrollMonitor);
  document.removeEventListener('touchstart', debouncedScrollMonitor);
  document.removeEventListener('touchmove', debouncedScrollMonitor);
  document.removeEventListener('touchend', debouncedScrollMonitor);
};

export const listenScroll = () => {
  removeListener();
  document.addEventListener('wheel', debouncedScrollMonitor, { capture: true, passive: true });
  document.addEventListener('scroll', debouncedScrollMonitor, { capture: true, passive: true });
  document.addEventListener('touchstart', debouncedScrollMonitor, { capture: true, passive: true });
  document.addEventListener('touchmove', debouncedScrollMonitor, { capture: true, passive: true });
  document.addEventListener('touchend', debouncedScrollMonitor, { capture: true, passive: true });
  return removeListener;
};

export const getLocationScrollPosition = async (location: (Location & { scrolledPos: number })) => {
  let { scrolledPos } = location;
  if (!scrolledPos) {
    const scrolledPaths = getScrolledPaths();
    const scrolledPath = scrolledPaths.find(sp => (
      sp.url === `${location.pathname}${location.search}${location.hash}`
    ));
    if (scrolledPath && scrolledPath.scrollPosition) {
      scrolledPos = scrolledPath.scrollPosition;
    }
  }
  if (!scrolledPos) {
    const peddlerHistory = await getTabHistory();
    const peddlerLocation = peddlerHistory.find(ph => (
      `${ph.pathname}${ph.search}${ph.hash}` === `${location.pathname}${location.search}${location.hash}`
    ));
    if (peddlerLocation && peddlerLocation.scrolledPos) {
      scrolledPos = peddlerLocation.scrolledPos;
    }
  }
  return scrolledPos;
};
