import {
  Component, ComponentFactoryResolver,
  ContentChildren, ElementRef,
  Input,
  OnInit,
  Optional,
  QueryList,
  SkipSelf, TemplateRef,
  ViewChild, ViewChildren, ViewContainerRef
} from '@angular/core';
import {Builder, Trait} from "../../decorators/block.decorator";

export interface HasContainer {
  getContainer(): HTMLElement
}
export interface HasContainerRef {
  getContainerRef(): ViewContainerRef
}

@Builder({tag: 'block', name: 'Block', canHaveChildren: true})
@Component({
  selector: 'builderify-block',
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

  // @Trait()
  // @Input()
  // hasChild: boolean;

  constructor(@Optional() @SkipSelf() public parent: BlockComponent, private factory: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.children.changes.subscribe(e => {
      console.log("children", e);
    })
    this.children2.changes.subscribe(e => {
      console.log("children2", e);
    })

    // const componentFactory = this.factory.resolveComponentFactory<BlockComponent>(BlockComponent);
    // const component = this.container.createComponent(componentFactory);
  }

  doSomething() {
    console.log(this.test, this.test2);
  }

  getContainer(): HTMLElement {
    return this.container.nativeElement;
  }

  getContainerRef(): ViewContainerRef {
    return this.containerRef;
  }
}