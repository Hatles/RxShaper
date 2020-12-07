import {InjectionToken, Type} from "@angular/core";

export const PAGES = new InjectionToken<Page[][]>('PAGES');

export interface Page<T = any> {
  path: string,
  id?: string,
  component: string | Type<any>,
  options?: T,
  children?: Page[]
}
