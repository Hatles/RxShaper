import {PageLoader} from "./page-loader";
import {Observable} from "rxjs";
import {Page} from "@hatles/rxpager";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Injectable} from "@angular/core";

export interface HttpPageLoaderOptions {
  url: string,
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  params?: HttpParams | {
    [param: string]: string | string[];
  };
}

@Injectable()
export class HttpPageLoader implements PageLoader<HttpPageLoaderOptions> {
  constructor(private http: HttpClient) {
  }

  load(options?: HttpPageLoaderOptions): Observable<Page[]> | Promise<Page[]> | Page[] {
    return this.http
      .get(options.url, {headers: options.headers, params: options.params, responseType: "json"})
      .pipe(map(result => result as Page[]));
  }
}
