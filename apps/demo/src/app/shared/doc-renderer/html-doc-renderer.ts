import {Observable} from "rxjs";
import {TocItem} from "../table-of-contents/table-of-contents";
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ElementRef,
  Injectable, Injector, NgZone,
  SecurityContext,
  ViewContainerRef
} from "@angular/core";
import {DocRenderer, DocResult} from "./doc-renderer";
import {HeaderLink} from "../doc-viewer/header-link";
import {map, switchMap, take} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";

export interface HtmlDocRendererOptions {
  url: string
}

@Injectable({
  providedIn: 'root',
})
export class HtmlDocRenderer implements DocRenderer<HtmlDocRendererOptions> {

  constructor(
    private _appRef: ApplicationRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _http: HttpClient,
    // private _injector: Injector,
    private _ngZone: NgZone,
    private _domSanitizer: DomSanitizer
  ) {
  }

  render(containerRef: ViewContainerRef, elementRef: ElementRef, options: HtmlDocRendererOptions): Observable<DocResult> {
    return this._http.get(options.url, {responseType: 'text'})
      .pipe(switchMap(rawDocument => this.renderDocument(containerRef, elementRef, rawDocument)));
  }

  /**
   * Updates the displayed document.
   * @param rawDocument The raw document content to show.
   */
  private renderDocument(containerRef: ViewContainerRef, elementRef: ElementRef, rawDocument: string): Observable<DocResult> {
    // portalHosts: DomPortalOutlet[] = [];
    const portalHosts: any[] = [];
    // Replace all relative fragment URLs with absolute fragment URLs. e.g. "#my-section" becomes
    // "/components/button/api#my-section". This is necessary because otherwise these fragment
    // links would redirect to "/#my-section".
    rawDocument = rawDocument.replace(/href="#([^"]*)"/g, (_m: string, fragmentUrl: string) => {
      const absoluteUrl = `${location.pathname}#${fragmentUrl}`;
      return `href="${this._domSanitizer.sanitize(SecurityContext.URL, absoluteUrl)}"`;
    });

    elementRef.nativeElement.innerHTML = rawDocument;
    // this.textContent = this._elementRef.nativeElement.textContent;

    // this._loadComponents('material-docs-example', ExampleViewer);
    this._loadComponents(containerRef, elementRef, 'header-link', HeaderLink);

    // Resolving and creating components dynamically in Angular happens synchronously, but since
    // we want to emit the output if the components are actually rendered completely, we wait
    // until the Angular zone becomes stable.
    return this._ngZone.onStable
      .pipe(
        take(1),
        map(() => ({
          toc: this._extractToc(containerRef, elementRef, rawDocument),
          onDestroy: () => this._clearLiveExamples(portalHosts)
        }))
      );
  }

  /** Instantiate a ExampleViewer for each example. */
  private _loadComponents(containerRef: ViewContainerRef, elementRef: ElementRef, componentName: string, componentClass: any) {
    const exampleElements =
      elementRef.nativeElement.querySelectorAll(`[${componentName}]`);

    // Array.prototype.slice.call(exampleElements).forEach((element: Element) => {
    //   const example = element.getAttribute(componentName);
    //   const portalHost = new DomPortalOutlet(
    //     element, this._componentFactoryResolver, this._appRef, this._injector);
    //   const examplePortal = new ComponentPortal(componentClass, this._viewContainerRef);
    //   const exampleViewer = portalHost.attach(examplePortal);
    //   if (example !== null) {
    //     // (exampleViewer.instance as ExampleViewer).example = example;
    //   }
    //
    //   this._portalHosts.push(portalHost);
    // });
  }

  private _clearLiveExamples(portalHosts:/* DomPortalOutlet[]*/ any[]) {
    portalHosts.forEach(h => h.dispose());
    portalHosts = [];
  }

  /**
   * Updates the displayed document.
   * @param rawDocument The raw document content to show.
   */
  private _extractToc(containerRef: ViewContainerRef, elementRef: ElementRef, rawDocument: string): TocItem[] {
    const headers = Array.from<HTMLHeadingElement>((elementRef.nativeElement as HTMLElement).querySelectorAll('h3, h4'));
    return headers.map((header) => {
      // remove the 'link' icon name from the inner text
      const name = header.innerText.trim().replace(/^link/, '');
      return {
        name: name,
        element: header,
        id: header.id
      };
    });
  }
}
