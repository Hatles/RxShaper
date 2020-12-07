import {Injectable, InjectionToken, Provider} from "@angular/core";
import {DYNAMIC_MODULE_INITIALIZER} from "./dynamic-module-initializer";
import {forkJoin, from, Observable, of} from "rxjs";
import {Route, ROUTES} from "@angular/router";
import {map, tap} from "rxjs/operators";

export type AsyncRoutes = () => Promise<Route[]> | Observable<Route[]> | Route[];
export type NormalizedAsyncRoutes = Observable<Route[]>;
export type AsyncRoutesFactory = (...deps: any) => () => Promise<Route[]> | Observable<Route[]> | Route[];

export const ASYNC_ROUTES: InjectionToken<AsyncRoutes[]> = new InjectionToken<AsyncRoutes[]>('ASYNC_ROUTES');

export function asyncRoutesInitializerFactory(registry: AsyncRoutesRegistry, asyncRoutes: AsyncRoutes[]): () => Observable<Route[]> {
  return () => registry.register(asyncRoutes);
}

export function asyncRoutesToRoutesFactory(registry: AsyncRoutesRegistry): Route[] {
  return registry.routes;
}

@Injectable()
export class AsyncRoutesRegistry {
  routes: Route[] = [];

  register(asyncRoutes: AsyncRoutes[]): Observable<Route[]> {
    const asyncRoutes$ = asyncRoutes.map(r => this.normalizeAsyncRoutes(r));
    const routes$ = forkJoin(asyncRoutes$)
      .pipe(
        map((routes) => this.flattenRoutes(routes)),
        tap(routes => this.routes.push(...routes))
      );
    return routes$;
  }

  private normalizeAsyncRoutes(asyncRoutes: AsyncRoutes): NormalizedAsyncRoutes {
    const routes$ = asyncRoutes();

    if (routes$ instanceof Promise) {
      return from(routes$);
    }
    if (routes$ instanceof Observable) {
      return routes$;
    }

    return of(routes$);
  }

  private flattenRoutes(routes: Route[][]): Route[] {
    return routes.reduce((acc, p) => [...acc, ...p], []);
  }
}

export function provideAsyncRoutesInitializer(): Provider[] {
  return [
      AsyncRoutesRegistry,
      {provide: DYNAMIC_MODULE_INITIALIZER, useFactory: asyncRoutesInitializerFactory, deps: [AsyncRoutesRegistry, ASYNC_ROUTES], multi: true},
      {provide: ROUTES, useFactory: asyncRoutesToRoutesFactory, deps: [AsyncRoutesRegistry], multi: true},
    ];
}
