import {
  Component, ElementRef,
  Input, ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ComponentBuilder, Trait} from "@rxshaper/core";
import {HasContainer, HasContainerRef} from "../components/block/block.component";

@Component({
  selector: 'div[rxshaper-block-box]',
  template: '<ng-container #containerRef></ng-container><ng-content></ng-content>'
})
@ComponentBuilder({tag: 'box', name: 'Box', canHaveChildren: true, noBlock: true})
export class BoxBlock implements HasContainer, HasContainerRef {

  @ViewChild("containerRef", {static: true, read: ViewContainerRef})
  containerRef: ViewContainerRef;

  constructor(private container: ElementRef<any>) {
  }

  getContainer(): HTMLElement {
    return this.container.nativeElement;
  }

  getContainerRef(): ViewContainerRef {
    return this.containerRef;
  }
}
