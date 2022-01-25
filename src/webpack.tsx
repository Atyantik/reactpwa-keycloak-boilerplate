import ResolverPlugin from './plugins/webpack-resolver';

export default class ProjectWebpack {
  constructor({ addPlugin } : any) {
    addPlugin(new ResolverPlugin());
  }
}
