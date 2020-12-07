import {Page} from "./page";

export interface PageType<T = any> {
  page: Page<T>;
}

export class BasePageType<T = any> implements PageType<T> {
  page: Page<T>;

  get options(): T {
    return this.page.options;
  }
}
