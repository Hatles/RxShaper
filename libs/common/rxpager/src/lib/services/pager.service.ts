import {Injectable} from '@angular/core';
import {Page} from "../models/page";
import {Route} from "@angular/router";
import {PageComponent} from "../components/page/page.component";

@Injectable()
export class PagerService {

  constructor() { }

  buildPages(allPages: Page[][]): Route[] {
    const pages = this.normalizePages(this.flattenPages(allPages));
    return this.transformPages(pages);
  }

  private transformPages(pages: Page[]): Route[] {
    return pages.map(page => this.transformPage(page));
  }

  private transformPage(page: Page): Route {
    return {
      path: page.path,
      component: PageComponent,
      data: {
        ...(page.options || {}),
        page: page
      },
      children: page.children ? this.transformPages(page.children) : null
    };
  }

  private normalizePages(pages: Page[]): Page[] {
    return pages;
  }

  private flattenPages(pages: Page[][]): Page[] {
    return pages.reduce((acc, p) => [...acc, ...p], []);
  }
}
