import {ModuleWithProviders, NgModule, Provider} from "@angular/core";
import {Router, RouterModule, RouterPreloader} from "@angular/router";
import {DynamicRouterConfigLoader, NgRouterConfigLoader, RouterConfigLoader} from "./dynamic-router-config-loader";
import {DynamicModuleLoader} from "./dynamic-module-loader";
import {EmptyOutletComponent} from "./components/empty-outlet.component";
import {AsyncItemRegistry, provideAsyncInitializer} from "./async-initializer";
import {provideAsyncPageInitializer} from "@hatles/rxpager";

export function fixRouterConfigLoader(loader: NgRouterConfigLoader, dynamicLoader: DynamicModuleLoader): RouterConfigLoader {
  return new DynamicRouterConfigLoader(loader, dynamicLoader);
}

export function fixRouterFactory(router: Router | any, dynamicLoader: DynamicModuleLoader): Router {
  router.configLoader = fixRouterConfigLoader(router.configLoader, dynamicLoader);
  return router;
}
export function fixRouterPreLoaderFactory(preloader: RouterPreloader | any, dynamicLoader: DynamicModuleLoader): RouterPreloader {
  preloader.loader = fixRouterConfigLoader(preloader.loader, dynamicLoader);
  return preloader;
}

@NgModule({
  imports: [RouterModule],
  declarations: [
    EmptyOutletComponent
  ],
  entryComponents: [
    EmptyOutletComponent
  ],
})
export class NgxDynamicRouterModule {
  static forRoot(): ModuleWithProviders<NgxDynamicRouterModule> {
    return {
      ngModule: NgxDynamicRouterModule,
      providers: [
        DynamicModuleLoader,

        AsyncItemRegistry,
        provideAsyncInitializer(),
      ],
    };
  }

  static forChild(): ModuleWithProviders<NgxDynamicRouterModule> {
    return {
      ngModule: NgxDynamicRouterModule,
      providers: [
        AsyncItemRegistry,
        provideAsyncInitializer(),
      ],
    };
  }

  constructor(router: Router, preloader: RouterPreloader, dynamicLoader: DynamicModuleLoader) {
    fixRouterFactory(router, dynamicLoader);
    fixRouterPreLoaderFactory(preloader, dynamicLoader);
  }
}
