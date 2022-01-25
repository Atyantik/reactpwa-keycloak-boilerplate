import path from 'path';
import WebpackHandler from '@pawjs/pawjs/src/webpack/handler';

export default class ResolverWebpack {
  apply(webpackHandler: WebpackHandler) {
    webpackHandler
      .hooks
      .beforeConfig
      .tap(
        'ResolvePath',
        (_, __, config) => {
          try {
            let conf = config;
            if (!Array.isArray(config)) {
              conf = [config];
            }
            conf.forEach((c: any) => {
              if (!c.resolve) c.resolve = {};
              if (!c.resolve.alias) c.resolve.alias = {};
              c.resolve.alias = {
                ...c.resolve.alias,
                '@components': path.resolve(__dirname, '../components/'),
                '@utils': path.resolve(__dirname, '../utils/'),
                '@resources': path.resolve(__dirname, '../resources/'),
                '@routes': path.resolve(__dirname, '../routes/'),
                '@pages': path.resolve(__dirname, '../pages/'),
                '@plugins': path.resolve(__dirname, '../plugins/'),
                '@hooks': path.resolve(__dirname, '../hooks/'),
                '@models': path.resolve(__dirname, '../models/'),
              };
            });
          } catch (ex) {
            console.log(ex);
          }
        },
      );
  }
}
