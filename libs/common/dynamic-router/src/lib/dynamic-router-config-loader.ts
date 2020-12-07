import {Compiler, Injector, NgModuleFactory, NgModuleFactoryLoader, NgModuleRef} from "@angular/core";
import {LoadChildren, PRIMARY_OUTLET, Route, ROUTES} from "@angular/router";
import {from, Observable} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {flatten} from "@angular/compiler";
import {DynamicModuleLoader} from "./dynamic-module-loader";
import {standardizeConfig} from "./utils";

export class LoadedRouterConfig {
  constructor(public routes: Route[], public module: NgModuleRef<any>) {}
}
export interface RouterConfigLoader {
  load(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig>
}
export interface NgRouterConfigLoader extends RouterConfigLoader {
  load(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig>

  // internal api
  loader: NgModuleFactoryLoader,
  compiler: Compiler,
  onLoadStartListener?: (r: Route) => void,
  onLoadEndListener?: (r: Route) => void,
  loadModuleFactory(loadChildren: LoadChildren): Observable<NgModuleFactory<any>>
}


export class DynamicRouterConfigLoader implements RouterConfigLoader {

  constructor(private parent: NgRouterConfigLoader, private dynamicLoader: DynamicModuleLoader) {
  }

  load(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig> {
    if (this.parent.onLoadStartListener) {
      this.parent.onLoadStartListener(route);
    }

    const moduleFactory$ = this.loadModuleFactory(route.loadChildren!);

    return moduleFactory$.pipe(switchMap((factory: NgModuleFactory<any>) => {
      if (this.parent.onLoadEndListener) {
        this.parent.onLoadEndListener(route);
      }

      const module = factory.create(parentInjector);

      return from(this.dynamicLoader.load(module)).pipe(map((m) => {
        if (!m) {
          m = module; // fix undefined module if no Module initializer
        }
        return new LoadedRouterConfig(flatten(m.injector.get(ROUTES)).map(standardizeConfig), m);
      }));
    }));
  }

  private loadModuleFactory(loadChildren: LoadChildren): Observable<NgModuleFactory<any>> {
    return this.parent.loadModuleFactory(loadChildren);
  }
}
