import {Page, PAGES} from "./page";
import {
  AsyncItemRegistry,
  createAsyncItemToken,
  provideItemAsyncInitializer, transformAsyncItems
} from "@hatles/ngx-dynamic-router";
import {Provider} from "@angular/core";

export const ASYNC_PAGES = createAsyncItemToken<Page[]>('ASYNC_PAGES');

export function transformAsyncPagesFactory(registry: AsyncItemRegistry) {
  return transformAsyncItems(registry, ASYNC_PAGES, true, []);
}

export function provideAsyncPageInitializer(): Provider[] {
  return [
      provideItemAsyncInitializer(ASYNC_PAGES, PAGES, true),
      {provide: PAGES, useFactory: transformAsyncPagesFactory, deps: [AsyncItemRegistry], multi: true},
    ];
}

