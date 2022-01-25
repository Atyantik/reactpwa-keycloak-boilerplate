import React from 'react';
import express from 'express';
import ServerHandler from '@pawjs/pawjs/src/server/handler';
import MSTServer from '@plugins/mst-plugin/server';
import FetchFactory from '@utils/fetch-factory';
import PWA180Icon from '@resources/pwa-icons/iconx180.png';
import PWA114Icon from '@resources/pwa-icons/iconx114.png';
import App32Favicon from '@resources/pwa-icons/faviconx32.png';
import App16Favicon from '@resources/pwa-icons/faviconx16.png';
import { getEnv } from '@utils/env';

React.useLayoutEffect = React.useEffect;

const authApp = express();
const appEnv = getEnv('APP_ENV', process.env.APP_ENV || 'development');

const getFetchFactory = (req: express.Request, res: express.Response) => {
  if (res.locals.fetchFactory) {
    return res.locals.fetchFactory;
  }
  res.locals.fetchFactory = new FetchFactory();
  res.locals.fetchFactory.setRequest(req);
  res.locals.fetchFactory.setResponse(res);
  return res.locals.fetchFactory;
};

// Create iframe SEO checker
authApp.get('/sso', (_: express.Request, res: express.Response) => {
  return res.send(
    '<html><body><script>parent.postMessage(location.href, location.origin)</script></body></html>',
  );
});

/**
 * Create robots.txt with indexing control on production and
 * non-production sites
 */
authApp.get('/robots.txt', (req: express.Request, res: express.Response) => {
  res.set('Cache-Control', 'no-store');
  res.type('text/plain');
  if (appEnv !== 'production') {
    return res.send(
      `User-agent: *
Disallow: /`,
    );
  }
  return res.send(
    `User-agent: *
Allow: /`,
  );
});

export default class Server {
  serverHandler: ServerHandler | null = null;

  constructor({ addPlugin, addMiddleware }: any) {
    const mstServer = new MSTServer(getFetchFactory);
    addPlugin(mstServer);
    addMiddleware(authApp);
  }

  /**
   * Tell everyone with schema.org/structured data that
   * this is a website owned by organization Peddler B.V.
   */
  addCommonStructuredData() {
    if (!this.serverHandler) return false;
    this.serverHandler.hooks.beforeHtmlRender.tapPromise(
      'AddWebsiteStructuredData',
      async (application) => {
        const { htmlProps: { head } } = application;

        const description = getEnv('APP_DESCRIPTION', process.env.APP_DESCRIPTION);

        const organizationDetails = {
          '@context': 'http://schema.org/',
          '@type': 'Organization',
          name: 'Example Organization',
          legalName: 'Legally Example COM.',
          url: 'https://www.example.com/',
          logo: '',
          sameAs: [
            'https://facebookurl/',
            'https://instagramurl',
            'https://linkedinurl',
            'https://pinterest',
          ],
          location: {
            '@type': 'Place',
            address: [
              {
                '@type': 'PostalAddress',
                addressRegion: '<State/Region>',
                addressCountry: '<Country>',
                postalCode: '<Postal Code>',
                streetAddress: '<Street Address>',
              },
            ],
            name: '<Org name>',
          },
        };

        const websiteDetails = {
          '@context': 'http://schema.org',
          '@type': 'WebSite',
          name: 'Website Name',
          url: '<Website URL>',
          sameAs: [
            'https://facebookurl/',
            'https://instagramurl',
            'https://linkedinurl',
            'https://pinterest',
          ],
          about: {
            description,
            '@type': 'Thing',
          },
          author: organizationDetails,
        };

        // Push Website details
        head.push(
          (
            <script
              key="structured-data-org"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationDetails) }}
            />
          ),
        );
        head.push(
          (
            <script
              key="structured-data-website"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteDetails) }}
            />
          ),
        );
      },
    );
    return true;
  }

  addGoogleTagManager() {
    if (!this.serverHandler) return false;
    const googleTagId = getEnv('GTM_ID', process.env.GTM_ID || '');
    if (!googleTagId) return false;
    this
      .serverHandler
      .hooks
      .beforeHtmlRender
      .tapPromise(
        'AddGoogleTagManager',
        async (application: any) => {
          const { htmlProps: { head, footer } } = application;

          head.push(
            (
              <script
                key="google-tag-manager-js-include"
                dangerouslySetInnerHTML={{
                  __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagId}');`,
                }}
              />
            ),
          );
          footer.push(
            (
              <noscript
                key="google-tag-manager-js-include-no-script"
                dangerouslySetInnerHTML={{
                  __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
                }}
              />
            ),
          );
        },
      );
    return true;
  }

  addMstStoreToLoadData() {
    if (!this.serverHandler) return false;
    this.serverHandler.hooks.beforeLoadData.tapPromise(
      'AddMstStoreToLoadData',
      async (setParams, getParams, req, res) => {
        setParams(
          'mstStore',
          res.locals.mstStore,
        );
      },
    );
    return true;
  }

  initializeMSTState() {
    if (!this.serverHandler) return false;
    this.serverHandler
      .hooks
      .mstInitialState
      // @ts-ignore
      .tapPromise('AppInitalState', async ({
        getInitalState, setInitialState,
      }: any) => {
        setInitialState(getInitalState());
      });
    return true;
  }

  /**
   * Add head links like theme color, apple icon links,
   * Favicon, tile color etc.
   */
  addHeadLinks() {
    if (!this.serverHandler) return false;
    this
      .serverHandler
      .hooks
      .beforeHtmlRender
      .tapPromise(
        'HeadLinks',
        async (application: any) => {
          const { htmlProps: { head } } = application;

          // Meta theme color
          head.push(<meta key="meta-theme-color" name="theme-color" content="#000000" />);

          // Theme color
          head.push(<meta key="theme-color" name="theme-color" content="#6c41d9" />);

          // Apple touch icons
          head.push(
            (
              <link
                key="apple-touch-icon-180"
                rel="apple-touch-icon"
                sizes="180x180"
                href={PWA180Icon}
              />
            ),
          );
          head.push(
            (
              <link
                key="apple-touch-icon-114"
                rel="apple-touch-icon-precomposed"
                sizes="114x114"
                href={PWA114Icon}
              />
            ),
          );
          head.push(
            (
              <link
                key="apple-touch-icon"
                rel="apple-touch-icon-precomposed"
                href={PWA180Icon}
              />
            ),
          );

          // Favicon PNG support for various devices like Ubuntu OS etc...
          head.push(
            (
              <link
                key="favicon-32x32"
                rel="icon"
                type="image/png"
                sizes="32x32"
                href={App32Favicon}
              />
            ),
          );

          // Favicon PNG support for various devices
          head.push(
            (
              <link
                key="favicon-16x16"
                rel="icon"
                type="image/png"
                sizes="16x16"
                href={App16Favicon}
              />
            ),
          );

          // Default favicon
          head.push(<link key="favicon" rel="shortcut icon" href={App32Favicon} />);

          // Generate microsoft tile on save of page
          head.push(
            <meta key="msapplication-TileColor" name="msapplication-TileColor" content="#000000" />,
          );
        },
      );
    return true;
  }

  apply(serverHandler: ServerHandler) {
    this.serverHandler = serverHandler;
    // Add caching!
    this.serverHandler.setCache({ max: 52428800, maxAge: 1000 * 20, reCache: true });
    this.addGoogleTagManager();

    this.addCommonStructuredData();
    this.addMstStoreToLoadData();
    this.initializeMSTState();
    this.addHeadLinks();
  }
}
