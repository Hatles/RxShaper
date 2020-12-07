import {Observable} from "rxjs";
import {Page} from "@hatles/rxpager";

export interface PageLoader<T = any> {
  load(options?: T): Observable<Page[]> | Promise<Page[]> | Page[];
}
