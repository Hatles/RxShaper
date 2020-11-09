import {
  Component, ComponentFactoryResolver,
  ContentChildren, ElementRef, EventEmitter,
  Input,
  OnInit,
  Optional, Output,
  QueryList,
  SkipSelf,
  ViewChild, ViewChildren, ViewContainerRef
} from '@angular/core';
import {BuilderBlockOutput, ComponentBuilder, Trait} from "../../decorators/block.decorator";

export interface HasContainer {
  getContainer(): HTMLElement
}
export interface HasContainerRef {
  getContainerRef(): ViewContainerRef
}

@ComponentBuilder({tag: 'block', name: 'Block', canHaveChildren: true})
@Component({
  selector: 'rxshaper-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit, HasContainer, HasContainerRef {

  @ViewChild("container", {static: true})
  container: ElementRef<HTMLElement>;
  @ViewChild("containerRef", {static: true, read: ViewContainerRef})
  containerRef: ViewContainerRef;
  // @ViewChild(ChildrenHostDirective, {static: true})
  // childrenHost: ChildrenHostDirective;

  @ContentChildren(BlockComponent)
  children: QueryList<BlockComponent> = new QueryList<BlockComponent>();

  @ViewChildren(BlockComponent)
  children2: QueryList<BlockComponent> = new QueryList<BlockComponent>();

  @Trait()
  @Input()
  test: string;

  @Trait("test2input")
  @Input()
  test2: string;

  @BuilderBlockOutput()
  @Output()
  doSomething: EventEmitter<any> = new EventEmitter<any>();

  level: number;

  counter = 0;

  // @Trait()
  // @Input()
  // hasChild: boolean;

  constructor(@Optional() @SkipSelf() public parent: BlockComponent, private factory: ComponentFactoryResolver) {
    if (this.parent) {
      this.level = this.parent.level + 1;
    }
    else {
      this.level = 1;
    }
  }

  ngOnInit(): void {
    this.children.changes.subscribe(e => {
      console.log("children", e);
    });
    this.children2.changes.subscribe(e => {
      console.log("children2", e);
    });

    // const componentFactory = this.factory.resolveComponentFactory<BlockComponent>(BlockComponent);
    // const component = this.container.createComponent(componentFactory);
  }

  onDoSomething() {
    this.counter++;
    this.doSomething.emit({test: this.test, counter: this.counter});
  }

  getContainer(): HTMLElement {
    return this.container.nativeElement;
  }

  getContainerRef(): ViewContainerRef {
    return this.containerRef;
  }

}
