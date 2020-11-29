
import {ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef} from "@angular/core";
import {WrapperTestComponent} from "../components/wrapper-test/wrapper-test.component";
import {Subject} from "rxjs";
import {BlockRendererService, BlockWrapper, RxShaperService} from "@rxshaper/core";

@Injectable()
export class TestWrapper implements BlockWrapper {
  constructor(private resolver: ComponentFactoryResolver) {
  }

  wrap(container: ViewContainerRef, shaper: RxShaperService, renderer: BlockRendererService): ViewContainerRef {
    const factory = this.resolver.resolveComponentFactory<WrapperTestComponent>(WrapperTestComponent);
    const comp = container.createComponent(factory);
    comp.instance.wrapper = this;
    comp.instance.blockRenderer = renderer;
    const cont = comp.instance.containerRef;
    renderer.properties.wrapper = { component: comp };
    return cont;
  }

  unwrap(container: ViewContainerRef, shaper: RxShaperService, renderer: BlockRendererService): void {
    const comp: ComponentRef<any> = renderer.properties.wrapper.component;
    comp.destroy();
  }

  newOver: Subject<WrapperTestComponent> = new Subject<WrapperTestComponent>()
  onOver(wrapper: WrapperTestComponent) {
    this.newOver.next(wrapper);
  }
  newClick: Subject<WrapperTestComponent> = new Subject<WrapperTestComponent>()
  onClick(wrapper: WrapperTestComponent) {
    this.newClick.next(wrapper);
  }
}
