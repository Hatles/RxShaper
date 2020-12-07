// import {DomPortalOutlet} from '@angular/cdk/portal';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgZone, OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';
import {DocRendererService} from "../doc-renderer/doc-renderer.service";
import {TocItem} from "../table-of-contents/table-of-contents";
import {DocResult} from "../doc-renderer/doc-renderer";

@Component({
  selector: 'doc-viewer',
  template: 'Loading document...',
})
export class DocViewer implements OnChanges, OnDestroy {
  private _documentFetchSubscription: Subscription;
  private _docResult: DocResult;

  @Input() renderer: string;
  @Input() options?: any;

  @Output() contentRendered = new EventEmitter<HTMLElement>();
  @Output() tocChanges = new EventEmitter<TocItem[]>();

  /** The document text. It should not be HTML encoded. */
  textContent = '';

  constructor(private _appRef: ApplicationRef,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _elementRef: ElementRef,
              private _http: HttpClient,
              private _injector: Injector,
              private _viewContainerRef: ViewContainerRef,
              private _ngZone: NgZone,
              private _domSanitizer: DomSanitizer,
              private _docRenderer: DocRendererService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {

    this._fetchDocument();
  }

  /** Fetch a document by URL. */
  private _fetchDocument() {
    // Cancel previous pending request
    if (this._documentFetchSubscription) {
      this._documentFetchSubscription.unsubscribe();
    }

    this._documentFetchSubscription = this._docRenderer.render(this.renderer, this._viewContainerRef, this._elementRef, this.options).subscribe(
      result => this.updateDocResult(result),
      error => this.showError(error)
    );
  }

  private updateDocResult(result: DocResult) {
    this._docResult = result;
    this.updateToc(result.toc);
  }

  /**
   * Updates the displayed toc.
   */
  private updateToc(toc: TocItem[]) {
    // Resolving and creating components dynamically in Angular happens synchronously, but since
    // we want to emit the output if the components are actually rendered completely, we wait
    // until the Angular zone becomes stable.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => {
        this.contentRendered.next(this._elementRef.nativeElement);
        this.tocChanges.next(toc);
      });
  }

  /** Show an error that occurred when fetching a document. */
  private showError(error: HttpErrorResponse) {
    console.log(error);
    this._elementRef.nativeElement.innerText =
      `Failed to load document. Error: ${error.statusText}`;
  }

  ngOnDestroy() {
    if (this._docResult) {
      this._docResult.onDestroy();
    }

    if (this._documentFetchSubscription) {
      this._documentFetchSubscription.unsubscribe();
    }
  }
}
