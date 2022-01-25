import { getEnv } from './env';

const GTM_ID = getEnv('GTM_ID', process.env?.GTM_ID ?? '');

const trackGAPageView = () => {
  if (GTM_ID) {
    window?.dataLayer?.push?.({ 'event': 'virtualPageView', pageLocation: window.location.href });
  }
};

export const trackPageView = () => {
  trackGAPageView();
};
