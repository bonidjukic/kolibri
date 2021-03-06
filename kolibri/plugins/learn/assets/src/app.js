import RootVue from './views/LearnIndex';
import routes from './routes';
import { setFacilitiesAndConfig, prepareLearnApp } from './modules/coreLearn/actions';
import pluginModule from './modules/pluginModule';
import KolibriApp from 'kolibri_app';

class LearnModule extends KolibriApp {
  get stateSetters() {
    return [prepareLearnApp, setFacilitiesAndConfig];
  }
  get routes() {
    return routes;
  }
  get RootVue() {
    return RootVue;
  }
  get pluginModule() {
    return pluginModule;
  }
  ready() {
    // after every navigation, block double-clicks
    return super.ready().then(() => {
      this.routerInstance.afterEach((toRoute, fromRoute) => {
        this.store.dispatch('blockDoubleClicks');
        this.store.dispatch('resetModuleState', { toRoute, fromRoute });
      });
    });
  }
}

export default new LearnModule();
