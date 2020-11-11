import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {TestWrapper} from "../../services/test.wrapper";
import {WrapperTestComponent} from "../wrapper-test/wrapper-test.component";
import {fromEvent, Subject} from "rxjs";
import {debounceTime, takeUntil, tap} from "rxjs/operators";
import {BlockResizerHelperDirective} from "../../directives/block-resizer-helper.directive";

@Component({
  selector: 'rxshaper-wrapper-block-boundings',
  templateUrl: './wrapper-block-boundings.component.html',
  styleUrls: ['./wrapper-block-boundings.component.scss']
})
export class WrapperBlockBoundingsComponent implements OnInit, OnDestroy {

  @ViewChild('blockOver', {static: true})
  private blockOverEl: ElementRef<HTMLDivElement>;
  @ViewChild('blockSelected', {static: true})
  private blockSelectedEl: ElementRef<HTMLDivElement>;

  @ViewChild('marginTop', {static: true})
  private marginTopEl: ElementRef<HTMLDivElement>;
  @ViewChild('marginRight', {static: true})
  private marginRightEl: ElementRef<HTMLDivElement>;
  @ViewChild('marginBottom', {static: true})
  private marginBottomEl: ElementRef<HTMLDivElement>;
  @ViewChild('marginLeft', {static: true})
  private marginLeftEl: ElementRef<HTMLDivElement>;

  @ViewChild('paddingTop', {static: true})
  private paddingTopEl: ElementRef<HTMLDivElement>;
  @ViewChild('paddingRight', {static: true})
  private paddingRightEl: ElementRef<HTMLDivElement>;
  @ViewChild('paddingBottom', {static: true})
  private paddingBottomEl: ElementRef<HTMLDivElement>;
  @ViewChild('paddingLeft', {static: true})
  private paddingLeftEl: ElementRef<HTMLDivElement>;

  @ViewChild('resizerMarginTop', {static: true})
  private resizerMarginTopEl: BlockResizerHelperDirective;
  @ViewChild('resizerMarginRight', {static: true})
  private resizerMarginRightEl: BlockResizerHelperDirective;
  @ViewChild('resizerMarginBottom', {static: true})
  private resizerMarginBottomEl: BlockResizerHelperDirective;
  @ViewChild('resizerMarginLeft', {static: true})
  private resizerMarginLeftEl: BlockResizerHelperDirective;

  @ViewChild('resizerPaddingTop', {static: true})
  private resizerPaddingTopEl: BlockResizerHelperDirective;
  @ViewChild('resizerPaddingRight', {static: true})
  private resizerPaddingRightEl: BlockResizerHelperDirective;
  @ViewChild('resizerPaddingBottom', {static: true})
  private resizerPaddingBottomEl: BlockResizerHelperDirective;
  @ViewChild('resizerPaddingLeft', {static: true})
  private resizerPaddingLeftEl: BlockResizerHelperDirective;

  @Input()
  builder: HTMLDivElement;

  destroy: Subject<void> = new Subject<void>();

  constructor(private wrapper: TestWrapper, private renderer: Renderer2) {
  }

  over: WrapperTestComponent;
  selected: WrapperTestComponent;
  private selectedBlockEl: HTMLElement;

  hideOver: boolean = true;
  hideSelected: boolean = true;
  hideOverlay: boolean = false;
  dragging: boolean = false;

  ngOnInit(): void {
    fromEvent(this.builder, 'scroll')
      .pipe(
        takeUntil(this.destroy),
        tap(() => this.onScrollStart()),
        debounceTime(200),
        tap(() => this.onScrollEnd())
      )
      .subscribe();

    this.wrapper.newOver.subscribe(w => {
      if (w === this.selected) {
        w = null;
      }
      this.over = w;
      this.updateOver();
    });
    this.wrapper.newClick.subscribe(w => {
      if (this.over === w) {
        this.over = null;
        this.updateOver();
      }
      this.selected = w;
      this.selectedBlockEl = this.selected.blockRenderer.componentRef.location.nativeElement;
      this.updateSelected();
    });

    // resizers
    // this.resizerMarginTop.dragY
    //   .pipe(takeUntil(this.destroy))
    //   .subscribe(y => {
    //     const element: HTMLElement = this.over.blockRenderer.componentRef.location.nativeElement;
    //     const style = window.getComputedStyle(element);
    //     const marginTop = parseInt(style.marginTop) + y;
    //     this.renderer.setStyle(element, 'margin-top', marginTop + 'px');
    //   });

    this.listenAndUpdateOnDragEvent(this.resizerMarginTopEl, 'marginTop', 'margin-top', true, true);
    this.listenAndUpdateOnDragEvent(this.resizerMarginRightEl, 'marginRight', 'margin-right', false, false);
    this.listenAndUpdateOnDragEvent(this.resizerMarginBottomEl, 'marginBottom', 'margin-bottom', true, false);
    this.listenAndUpdateOnDragEvent(this.resizerMarginLeftEl, 'marginLeft', 'margin-left', false, true);

    this.listenAndUpdateOnDragEvent(this.resizerPaddingTopEl, 'paddingTop', 'padding-top', true, false);
    this.listenAndUpdateOnDragEvent(this.resizerPaddingRightEl, 'paddingRight', 'padding-right', false, true);
    this.listenAndUpdateOnDragEvent(this.resizerPaddingBottomEl, 'paddingBottom', 'padding-bottom', true, true);
    this.listenAndUpdateOnDragEvent(this.resizerPaddingLeftEl, 'paddingLeft', 'padding-left', false, false);
  }

  updateOver() {
    if (!this.over) {
      this.hideOver = true;
      return;
    }
    this.hideOver = false;

    const element: HTMLElement = this.over.blockRenderer.componentRef.location.nativeElement;
    const style = window.getComputedStyle(element);
    const bounding = element.getBoundingClientRect();

    // init block pos and size
    this.renderer.setStyle(this.blockOverEl.nativeElement, 'top', bounding.y + 'px');
    this.renderer.setStyle(this.blockOverEl.nativeElement, 'left', bounding.x + 'px');
    this.renderer.setStyle(this.blockOverEl.nativeElement, 'width', bounding.width + 'px');
    this.renderer.setStyle(this.blockOverEl.nativeElement, 'height', bounding.height + 'px');
  }

  updateSelected() {
    if (!this.selected) {
      this.hideSelected = true;
      return;
    }
    this.hideSelected = false;

    this.updateSelectedOverlay();
  }

  private updateSelectedOverlay() {
    const element: HTMLElement = this.selected.blockRenderer.componentRef.location.nativeElement;
    const style = window.getComputedStyle(element);
    const bounding = element.getBoundingClientRect();

    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    const borderX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

    // Element width and height minus padding and border
    const elementOffsetWidth = element.offsetWidth;
    const elementWidth = elementOffsetWidth - paddingX - borderX;
    const elementOffsetHeight = element.offsetHeight;
    const elementHeight = elementOffsetHeight - paddingY - borderY;

    const marginTop = parseInt(style.marginTop);
    const marginRight = parseInt(style.marginRight);
    const marginBottom = parseInt(style.marginBottom);
    const marginLeft = parseInt(style.marginLeft);

    const paddingTop = parseInt(style.paddingTop);
    const paddingRight = parseInt(style.paddingRight);
    const paddingBottom = parseInt(style.paddingBottom);
    const paddingLeft = parseInt(style.paddingLeft);

    // init block pos and size
    this.renderer.setStyle(this.blockSelectedEl.nativeElement, 'top', bounding.y + 'px');
    this.renderer.setStyle(this.blockSelectedEl.nativeElement, 'left', bounding.x + 'px');
    this.renderer.setStyle(this.blockSelectedEl.nativeElement, 'width', bounding.width + 'px');
    this.renderer.setStyle(this.blockSelectedEl.nativeElement, 'height', bounding.height + 'px');


    // init margins
    // init margin top
    this.renderer.setStyle(this.marginTopEl.nativeElement, 'top', (-marginTop) + 'px');
    this.renderer.setStyle(this.marginTopEl.nativeElement, 'height', marginTop + 'px');
    // init margin right
    this.renderer.setStyle(this.marginRightEl.nativeElement, 'right', (-marginRight) + 'px');
    this.renderer.setStyle(this.marginRightEl.nativeElement, 'width', marginRight + 'px');
    // init margin bottom
    this.renderer.setStyle(this.marginBottomEl.nativeElement, 'bottom', (-marginBottom) + 'px');
    this.renderer.setStyle(this.marginBottomEl.nativeElement, 'height', marginBottom + 'px');
    // init margin left
    this.renderer.setStyle(this.marginLeftEl.nativeElement, 'left', (-marginLeft) + 'px');
    this.renderer.setStyle(this.marginLeftEl.nativeElement, 'width', marginLeft + 'px');

    // init paddings
    // init padding top
    this.renderer.setStyle(this.paddingTopEl.nativeElement, 'top', 0);
    this.renderer.setStyle(this.paddingTopEl.nativeElement, 'height', paddingTop + 'px');
    // init padding right
    this.renderer.setStyle(this.paddingRightEl.nativeElement, 'right', 0);
    this.renderer.setStyle(this.paddingRightEl.nativeElement, 'width', paddingRight + 'px');
    // init padding bottom
    this.renderer.setStyle(this.paddingBottomEl.nativeElement, 'bottom', 0);
    this.renderer.setStyle(this.paddingBottomEl.nativeElement, 'height', paddingBottom + 'px');
    // init padding left
    this.renderer.setStyle(this.paddingLeftEl.nativeElement, 'left', 0);
    this.renderer.setStyle(this.paddingLeftEl.nativeElement, 'width', paddingLeft + 'px');


    const resizerOffset = 20;
    // init margin resizers
    // init margin top
    this.renderer.setStyle(this.resizerMarginTopEl.element.nativeElement, 'top', (-Math.max(marginTop, resizerOffset)) + 'px');
    this.renderer.setStyle(this.resizerMarginTopEl.element.nativeElement, 'left', bounding.width/2 + 'px');
    // init margin right
    this.renderer.setStyle(this.resizerMarginRightEl.element.nativeElement, 'right', (-Math.max(marginRight, resizerOffset)) + 'px');
    this.renderer.setStyle(this.resizerMarginRightEl.element.nativeElement, 'top', bounding.height/2 + 'px');
    // init margin bottom
    this.renderer.setStyle(this.resizerMarginBottomEl.element.nativeElement, 'bottom', (-Math.max(marginBottom, resizerOffset)) + 'px');
    this.renderer.setStyle(this.resizerMarginBottomEl.element.nativeElement, 'left', bounding.width/2 + 'px');
    // init margin left
    this.renderer.setStyle(this.resizerMarginLeftEl.element.nativeElement, 'left', (-Math.max(marginLeft, resizerOffset)) + 'px');
    this.renderer.setStyle(this.resizerMarginLeftEl.element.nativeElement, 'top', bounding.height/2 + 'px');

    // init padding resizers
    // init padding top
    this.renderer.setStyle(this.resizerPaddingTopEl.element.nativeElement, 'top', Math.max(paddingTop, resizerOffset) + 'px');
    this.renderer.setStyle(this.resizerPaddingTopEl.element.nativeElement, 'left', elementOffsetWidth/2 + 'px');
    // init padding right
    this.renderer.setStyle(this.resizerPaddingRightEl.element.nativeElement, 'right', Math.max(paddingRight, resizerOffset) + 'px');
    this.renderer.setStyle(this.resizerPaddingRightEl.element.nativeElement, 'top', elementOffsetHeight/2 + 'px');
    // init padding bottom
    this.renderer.setStyle(this.resizerPaddingBottomEl.element.nativeElement, 'bottom', Math.max(paddingBottom, resizerOffset) + 'px');
    this.renderer.setStyle(this.resizerPaddingBottomEl.element.nativeElement, 'left', elementOffsetWidth/2 + 'px');
    // init padding left
    this.renderer.setStyle(this.resizerPaddingLeftEl.element.nativeElement, 'left', Math.max(paddingLeft, resizerOffset) + 'px');
    this.renderer.setStyle(this.resizerPaddingLeftEl.element.nativeElement, 'top', elementOffsetHeight/2 + 'px');
  }

  private setOverlayHidden(hide: boolean) {
    this.hideOverlay = hide;
  }

  private onScrollStart() {
    this.setOverlayHidden(true);
  }

  private onScrollEnd() {
    this.setOverlayHidden(false);
    this.updateOver();
    this.updateSelected();
  }

  listenAndUpdateOnDragEvent(resizer: BlockResizerHelperDirective, styleProperty: string, cssProperty: string, vertical: boolean, inversed: boolean) {
    this.listenDragEvent<number>(
      resizer,
      e => {
        return parseInt(window.getComputedStyle(this.selectedBlockEl)[styleProperty]);
      },
      (e, startPropValue) => { // update on drag margin top
        const propertyValue = startPropValue + ((inversed ? -1 : 1) * (vertical ? e.y : e.x));
        this.renderer.setStyle(this.selectedBlockEl, cssProperty, propertyValue + 'px');
      },
      (e, startPropValue) => {
        const propertyValue = startPropValue + ((inversed ? -1 : 1) * (vertical ? e.y : e.x));
        // todo: update data in conf
      }
    );
  }

  listenDragEvent<T = any>(resizer: BlockResizerHelperDirective, startClb: (start: DragEvent) => T, dragClb: (drag: DragEvent, startValue: T) => void, endClb: (end: DragEvent, startValue: T) => void) {
    let startValue: T;
    // merge([
    resizer.dragStart.pipe(tap(e => {
      this.dragging = true;
      return startValue = startClb(e);
    }))
      .pipe(takeUntil(this.destroy))
      .subscribe();
    resizer.drag.pipe(tap(e => {
      dragClb(e, startValue);
      this.updateSelectedOverlay();
    }))
      .pipe(takeUntil(this.destroy))
      .subscribe();
    resizer.dragEnd.pipe(tap(e => {
      this.dragging = false;
      endClb(e, startValue);
    }))
      .pipe(takeUntil(this.destroy))
      .subscribe();
    // ])
    //   .pipe(takeUntil(this.destroy))
    //   .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
