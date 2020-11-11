import {
  Component, ElementRef, OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {TestWrapper} from "../../services/test.wrapper";
import {BlockRendererService} from "../block-renderer/block-renderer.service";

@Component({
  selector: 'wrapper-test',
  template: '<div class="wrapper-test" [class.over]="mouseOver" (click)="onClick($event)" (mouseover)="onMouseEnter($event)" (mouseleave)="onMouseOut()"><ng-container #containerRef></ng-container></div>',
  styles: [
    // ".wrapper-test.over {border: 5px dashed aqua;}"
  ]
})
export class WrapperTestComponent implements OnInit {

  @ViewChild("containerRef", {static: true, read: ViewContainerRef})
  containerRef: ViewContainerRef;

  mouseOver: boolean = false;
  wrapper: TestWrapper;

  blockRenderer: BlockRendererService;

  constructor(private container: ElementRef<any>) {
  }

  getContainer(): HTMLElement {
    return this.container.nativeElement;
  }

  getContainerRef(): ViewContainerRef {
    return this.containerRef;
  }

  onMouseEnter(event: MouseEvent) {
    event.stopPropagation();
    if (this.mouseOver) {
      return;
    }
    this.wrapper.onOver(this);
    this.mouseOver = true;
  }

  onMouseOut() {
    this.mouseOver = false;
  }

  ngOnInit(): void {
    this.wrapper.newOver.subscribe(() => this.mouseOver && this.onMouseOut());
  }

  onClick(event: MouseEvent) {
    event.stopPropagation();
    this.wrapper.onClick(this);
  }
}
