import {ElementRef, Injectable, ViewContainerRef} from "@angular/core";
import {DocRenderer, DocResult} from "./doc-renderer";
import {MdDocRenderer} from "./md-doc-renderer";
import {HtmlDocRenderer} from "./html-doc-renderer";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DocRendererService {
  renderers: {[key:string]: DocRenderer} = {};

  constructor(
    mdRenderer: MdDocRenderer,
    htmlRenderer: HtmlDocRenderer,
  ) {
    this.register('md', mdRenderer);
    this.register('html', htmlRenderer);
  }

  register(name: string, renderer: DocRenderer) {
    this.renderers[name] = renderer;
  }

  render(renderer: string, containerRef: ViewContainerRef, elementRef: ElementRef, options?: any): Observable<DocResult> {
    const rendererService = this.renderers[renderer];
    return rendererService.render(containerRef, elementRef, options);
  }

}
