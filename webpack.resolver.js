const path = require('path');

module.exports = {
  resolve: {
    root: path.resolve(__dirname),
    extensions: [
      '.mjs',
      '.mjsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],
    alias: {
      '@components': path.resolve(__dirname, './src/components/'),
      '@utils': path.resolve(__dirname, './src/utils/'),
      '@resources': path.resolve(__dirname, './src/resources/'),
      '@hooks': path.resolve(__dirname, './src/hooks/'),
      '@pages': path.resolve(__dirname, './src/pages/'),
      '@plugins': path.resolve(__dirname, './src/plugins/'),
      '@routes': path.resolve(__dirname, './src/routes/'),
      '@models': path.resolve(__dirname, './src/models/'),
    },
  },
};
