import {Observable} from "rxjs";
import {TocItem} from "../table-of-contents/table-of-contents";
import {ElementRef, ViewContainerRef} from "@angular/core";

export interface DocResult {
  toc: TocItem[],
  onDestroy: () => void
}

export interface DocRenderer<T = any> {
  render(containerRef: ViewContainerRef, elementRef: ElementRef, options?: T): Observable<DocResult>
}
