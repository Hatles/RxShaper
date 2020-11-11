import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {BlockRendererComponent} from "../block-renderer/block-renderer.component";
import {TestWrapper} from "../../services/test.wrapper";
import {WrapperTestComponent} from "../wrapper-test/wrapper-test.component";
import {fromEvent, pipe, Subject} from "rxjs";
import {debounceTime, takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'rxshaper-wrapper-block-boundings',
  templateUrl: './wrapper-block-boundings.component.html',
  styleUrls: ['./wrapper-block-boundings.component.scss']
})
export class WrapperBlockBoundingsComponent implements OnInit, OnDestroy {

  @ViewChild('blockOver')
  private blockOverEl: ElementRef<HTMLDivElement>;
  @ViewChild('blockSelected')
  private blockSelectedEl: ElementRef<HTMLDivElement>;

  @ViewChild('marginTop')
  private marginTopEl: ElementRef<HTMLDivElement>;
  @ViewChild('marginRight')
  private marginRightEl: ElementRef<HTMLDivElement>;
  @ViewChild('marginBottom')
  private marginBottomEl: ElementRef<HTMLDivElement>;
  @ViewChild('marginLeft')
  private marginLeftEl: ElementRef<HTMLDivElement>;

  @ViewChild('paddingTop')
  private paddingTopEl: ElementRef<HTMLDivElement>;
  @ViewChild('paddingRight')
  private paddingRightEl: ElementRef<HTMLDivElement>;
  @ViewChild('paddingBottom')
  private paddingBottomEl: ElementRef<HTMLDivElement>;
  @ViewChild('paddingLeft')
  private paddingLeftEl: ElementRef<HTMLDivElement>;

  @Input()
  builder: HTMLDivElement;

  destroy: Subject<void> = new Subject<void>();

  constructor(private wrapper: TestWrapper, private renderer: Renderer2) { }

  over: WrapperTestComponent;
  selected: WrapperTestComponent;

  hideOver: boolean = true;
  hideSelected: boolean = true;
  hideOverlay: boolean = false;

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
      this.updateSelected();
    });
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

    const element: HTMLElement = this.selected.blockRenderer.componentRef.location.nativeElement;
    const style = window.getComputedStyle(element);
    const bounding = element.getBoundingClientRect();

    // init block pos and size
    this.renderer.setStyle(this.blockSelectedEl.nativeElement, 'top', bounding.y + 'px');
    this.renderer.setStyle(this.blockSelectedEl.nativeElement, 'left', bounding.x + 'px');
    this.renderer.setStyle(this.blockSelectedEl.nativeElement, 'width', bounding.width + 'px');
    this.renderer.setStyle(this.blockSelectedEl.nativeElement, 'height', bounding.height + 'px');


    // init margins
    // init margin top
    const marginTop = parseInt(style.marginTop);
    this.renderer.setStyle(this.marginTopEl.nativeElement, 'top', (-marginTop) + 'px');
    this.renderer.setStyle(this.marginTopEl.nativeElement, 'height', marginTop + 'px');
    // init margin right
    const marginRight = parseInt(style.marginRight);
    this.renderer.setStyle(this.marginRightEl.nativeElement, 'right', (-marginRight) + 'px');
    this.renderer.setStyle(this.marginRightEl.nativeElement, 'width', marginRight + 'px');
    // init margin bottom
    const marginBottom = parseInt(style.marginBottom);
    this.renderer.setStyle(this.marginBottomEl.nativeElement, 'bottom', (-marginBottom) + 'px');
    this.renderer.setStyle(this.marginBottomEl.nativeElement, 'height', marginBottom + 'px');
    // init margin left
    const marginLeft = parseInt(style.marginLeft);
    this.renderer.setStyle(this.marginLeftEl.nativeElement, 'left', (-marginLeft) + 'px');
    this.renderer.setStyle(this.marginLeftEl.nativeElement, 'width', marginLeft + 'px');

    // init paddings
    // init padding top
    const paddingTop = parseInt(style.paddingTop);
    this.renderer.setStyle(this.paddingTopEl.nativeElement, 'top', 0);
    this.renderer.setStyle(this.paddingTopEl.nativeElement, 'height', paddingTop + 'px');
    // init padding right
    const paddingRight = parseInt(style.paddingRight);
    this.renderer.setStyle(this.paddingRightEl.nativeElement, 'right', 0);
    this.renderer.setStyle(this.paddingRightEl.nativeElement, 'width', paddingRight + 'px');
    // init padding bottom
    const paddingBottom = parseInt(style.paddingBottom);
    this.renderer.setStyle(this.paddingBottomEl.nativeElement, 'bottom', 0);
    this.renderer.setStyle(this.paddingBottomEl.nativeElement, 'height', paddingBottom + 'px');
    // init padding left
    const paddingLeft = parseInt(style.paddingLeft);
    this.renderer.setStyle(this.paddingLeftEl.nativeElement, 'left', 0);
    this.renderer.setStyle(this.paddingLeftEl.nativeElement, 'width', paddingLeft + 'px');
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

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
