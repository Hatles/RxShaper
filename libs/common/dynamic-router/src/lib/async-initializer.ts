import {Injectable, InjectionToken, Injector, Optional, Provider} from "@angular/core";
import {DYNAMIC_MODULE_INITIALIZER} from "./dynamic-module-initializer";
import {forkJoin, from, Observable, of} from "rxjs";
import {tap} from "rxjs/operators";

export function createAsyncItemToken<T = any>(token: string): InjectionToken<FlatAsyncItem<T>> {
  return new InjectionToken<FlatAsyncItem<T>>(token);
}

export type FlatAsyncItem<T = any> = () => Promise<T> | Observable<T> | T;
export type AsyncItem<T = any> = () => Promise<AsyncItemDef<T>> | Observable<AsyncItemDef<T>> | AsyncItemDef<T>;
export interface AsyncItemDef<T = any> {
  token: any,
  item: T,
  multi?: boolean
}
export interface AsyncItemParam {
  token: any,
  multi?: boolean
}

export type NormalizedAsyncItem<T = any> = Observable<AsyncItemDef<T>>;
export type AsyncItemFactory<T = any> = (...deps: any) => () => Promise<T> | Observable<T> | T;

export const ASYNC_ITEMS: InjectionToken<AsyncItem[]> = new InjectionToken<AsyncItem[]>('ASYNC_ITEMS');
export const ASYNC_ITEMS_PARAMS: InjectionToken<AsyncItemParam[]> = new InjectionToken<AsyncItemParam[]>('ASYNC_ITEMS_PARAMS');

export function asyncItemsInitializerFactory(registry: AsyncItemRegistry, asyncItems: AsyncItem[]): () => Observable<AsyncItemDef[]> {
  return () => registry.register(asyncItems || []);
}

export function asyncItemsInitializersFactory(registry: AsyncItemRegistry, params: AsyncItemParam[] = []): () => Observable<AsyncItemDef[]> {
  return () => registry.registerParams(params || []);
}

export function flattenItems<T>(items: T[][]): T[] {
  return items.reduce((acc, p) => [...acc, ...p], []);
}

export function transformAsyncItem<T>(registry: AsyncItemRegistry, token: any, defaultValue: T = undefined): T | T[] {
  const items =  registry.get<T>(token);

  return items || defaultValue;
}

export function transformAsyncItems<T>(registry: AsyncItemRegistry, token: any, flatten: boolean = false, defaultValue: T[] | T[][] = undefined): T[] | T[][] {
  const items = registry.get<T[]>(token) as T[][];

  if (items && flatten) {
    return flattenItems<T>(items);
  }

  return items || defaultValue;
}

@Injectable()
export class AsyncItemRegistry {
  items: Map<any, any | any[]> = new Map<any, any | any[]>();

  constructor(private injector: Injector) {
  }

  register(asyncItems: AsyncItem[]): Observable<AsyncItemDef[]> {
    const asyncItems$ = asyncItems.map(r => normalizeAsyncItems(r));
    const items$ = forkJoin(asyncItems$)
      .pipe(
        tap(items => {
          items.forEach(item => this.syncRegisterItem(item));
        })
      );
    return items$;
  }

  registerParams(params: AsyncItemParam[]): Observable<any[]> {
    const params$ = params.map(p => {
      const items: FlatAsyncItem[] = [];
      if (!p.multi) {
        const item = this.injector.get<FlatAsyncItem>(p.token, null);
        if (item) {
          items.push(item);
        }
      }
      else {
        const injItems = this.injector.get<FlatAsyncItem[]>(p.token, []);
        if (injItems.length) {
          items.push(...injItems);
        }
      }

      const asyncItems$ = items.map(r => normalizeAsyncItems(r));
      const items$ = forkJoin(asyncItems$)
        .pipe(
          tap(items => {
            items.forEach(i => this.syncRegister(i, p.token, p.multi));
          })
        );
      return items$;
    });

    return forkJoin(params$);
  }

  get<T>(token: any): T | T[] {
    return this.items.get(token);
  }

  private syncRegisterItem<T>(itemDef: AsyncItemDef) {
    this.syncRegister(itemDef.item, itemDef.token, itemDef.multi);
  }

  private syncRegister<T>(item: T, token: any, multi: boolean) {
    if (multi) {
      const existing = this.items.get(token) || [];

      this.items.set(token, [...existing, item]);
    } else {
      this.items.set(token, item);
    }
  }
}

export function normalizeAsyncItems<T>(asyncItems: FlatAsyncItem<T>): Observable<T> {
  const items$ = asyncItems();

  return normalizeItems(items$);
}

export function normalizeItems<T>(items: Promise<T> | Observable<T> | T): Observable<T> {
  if (items instanceof Promise) {
    return from(items);
  }
  if (items instanceof Observable) {
    return items;
  }

  return of(items);
}

export function returnAsyncItem<T>(token: any, item: T, multi: boolean = false): AsyncItemDef<T> {
  return {
    token: token,
    item: item,
    multi: multi
  };
}

export function provideAsyncInitializer(token: any = null, multi: boolean = false): Provider[] {
  return [
    // AsyncItemRegistry,
    {provide: DYNAMIC_MODULE_INITIALIZER, useFactory: asyncItemsInitializerFactory, deps: [AsyncItemRegistry, [new Optional(), ASYNC_ITEMS]], multi: true},
    // {provide: token, useFactory: (registry: AsyncItemRegistry) => transformAsyncItem(registry, token), deps: [AsyncItemRegistry], multi: multi},
  ];
}

export function provideItemAsyncInitializer(itemToken: any, token: any = null, multi: boolean = false): Provider[] {
  return [
      // AsyncItemRegistry,
      {provide: DYNAMIC_MODULE_INITIALIZER, useFactory: asyncItemsInitializersFactory, deps: [AsyncItemRegistry, [new Optional(), ASYNC_ITEMS_PARAMS]], multi: true},
      {provide: ASYNC_ITEMS_PARAMS, useValue: {token: itemToken, multi: multi}, multi: true},
      // {provide: token, useFactory: (registry: AsyncItemRegistry) => transformAsyncItem(registry, token), deps: [AsyncItemRegistry], multi: multi},
    ];
}
