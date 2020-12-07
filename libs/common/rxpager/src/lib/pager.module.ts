import {Injector, ModuleWithProviders, NgModule, StaticProvider, Type} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageComponent } from './components/page/page.component';
import { PagerComponent } from './components/pager/pager.component';
import {Route, RouterModule, ROUTES} from "@angular/router";
import {ComponentRegistry} from "./services/component-registry";
import {PagerService} from "./services/pager.service";
import {RXPAGER_OPTIONS, RxPagerLoader, RxPagerOptions} from "./models/options";
import {Page, PAGES} from "./models/page";
import {EmptyPageComponent} from "./components/empty-page/empty-page.component";
import {ASYNC_PAGES, provideAsyncPageInitializer} from "./models/async-page";
import {HttpPageLoader} from "./loaders/http-page-loader";
import {forkJoin, Observable} from "rxjs";
import {PageLoader} from "./loaders/page-loader";
import {map} from "rxjs/operators";
import {flattenItems, normalizeItems} from "@hatles/ngx-dynamic-router";

export function pagerLoaderInitializeFactory(configs: RxPagerOptions[] = [], injector: Injector): () => Observable<Page[]> {
  return () => {
    const loaders = configs.reduce((acc, c) => [...acc, ...(c.loaders || [])], [] as RxPagerLoader[]);
    const asyncLoaders$ = loaders.map(l => injector.get<PageLoader>(l.type).load(l.options));
    const loaders$ = asyncLoaders$.map(l => normalizeItems(l));
    return forkJoin(loaders$).pipe(map(res => {
      return flattenItems(res);
    }));
  };
}

export function pagerInitializerFactory(pagerService: PagerService, pages: Page[][]): Route[] {
  const routes = pagerService.buildPages(pages);
  return routes;
}

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [PageComponent, PagerComponent, EmptyPageComponent],
  entryComponents: [EmptyPageComponent]
})
export class RxPagerModule {
  static forRoot(pages: Page[] = [], config: RxPagerOptions = {}): ModuleWithProviders<RxPagerModule> {
    return {
      ngModule: RxPagerModule,
      providers: [
        { provide: PAGES, useValue: pages, multi: true },
        { provide: RXPAGER_OPTIONS, useValue: config, multi: true },
        { provide: ROUTES, useFactory: pagerInitializerFactory, multi: true, deps: [PagerService, PAGES] },
        ComponentRegistry,
        PagerService,

        provideAsyncPageInitializer(),

        // loaders
        HttpPageLoader,
        {provide: ASYNC_PAGES, useFactory: pagerLoaderInitializeFactory, deps: [RXPAGER_OPTIONS, Injector]} // do not work at root level
      ],
    };
  }

  static forChild(pages: Page[] = [], config: RxPagerOptions = {}): ModuleWithProviders<RxPagerModule> {
    return {
      ngModule: RxPagerModule,
      providers: [
        { provide: PAGES, useValue: pages, multi: true },
        { provide: RXPAGER_OPTIONS, useValue: config, multi: true },
        { provide: ROUTES, useFactory: pagerInitializerFactory, multi: true, deps: [PagerService, PAGES] },
        ComponentRegistry,

        provideAsyncPageInitializer(),

        // loaders
        {provide: ASYNC_PAGES, useFactory: pagerLoaderInitializeFactory, deps: [RXPAGER_OPTIONS, Injector], multi: true}
      ],
    };
  }
}
