import {ComponentFactoryResolver, Injectable, Injector, Renderer2, ViewContainerRef} from "@angular/core";
import {RxShaperExtension, RxShaperHook} from "../decorators/extension.decorator";
import {RootHooks} from "./hooks/root.hooks";
import {DOCUMENT} from "@angular/common";
import {CoreHooks} from "./hooks/core.hooks";
import {RxShaperService} from "../services/rxshaper.service";
import {
  BaseScope,
  blockRendererFactory,
  BlockRendererService,
  BlockScope,
  ComponentStateManager
} from "../services/block-renderer.service";
import {ComponentBlock} from "../models/block";
import {RxShaperExtensionFunction} from "../models/extension";
import {RendererService} from "../services/renderer.service";

@Injectable()
@RxShaperExtension("rxshaper:core")
export class CoreExtension {
  private shaperManager: RendererService;
  constructor(private shaper: RxShaperService) {
  }

  @RxShaperHook(RootHooks.Init)
  onInit: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    this.shaperManager = shaperManager;
    this.render(renderer);
  }

  private render(renderer: BlockRendererService) {
    const componentType = this.shaper.getComponentType(renderer.component.type);

    if (!componentType) {
      return;
    }

    renderer.componentType = componentType;
    const componentFactory = renderer.resolver.resolveComponentFactory(componentType.class);
    const newInjector = this.createChildInjector(renderer.injector, renderer);

    // apply wrappers
    const containerWithWrappers = this.shaper.config.wrappers
      .reduce((c, w) => w.wrapper.wrap(c, this.shaper, renderer), renderer.container);

    const componentRef = containerWithWrappers.createComponent(componentFactory, null, newInjector);
    renderer.componentRef = componentRef;

    renderer.triggerHook(CoreHooks.PreInit);
    this.createState(renderer);

    renderer.triggerHook(CoreHooks.Init);
    renderer.triggerHook(CoreHooks.Render);

    renderer.triggerHook(CoreHooks.PostInit);

    // this.mapOptions(renderer);
    // this.mapBindings(renderer);
    // this.mapActions(renderer);
    // this.mapAnimationActions(renderer);
    // this.applyScript(renderer);
    //
    // this.applyClassAndAttributes(renderer);
    // this.applyStyle(renderer);

    renderer.triggerHook(CoreHooks.RenderChildren);
    this.renderChildren(renderer);

    this.handleChanges(renderer);
  }

  private createChildInjector(injector: Injector, renderer: BlockRendererService) {
    return Injector.create({
      providers: [
        {
          provide: BlockRendererService, useFactory: blockRendererFactory(renderer), deps: [
            ComponentFactoryResolver,
            Injector,
            Renderer2,
            DOCUMENT,
            RxShaperService,
            RendererService
          ]
        },
        // BlockRendererService,
      ], parent: injector
    });
  }

  private createState(renderer: BlockRendererService) {
    const componentState = new ComponentStateManager(renderer.componentType, renderer.componentRef);
    renderer.componentState = componentState;
  }



  public getBlockScope(renderer: BlockRendererService): BlockScope {
    if (!renderer.blockScope) { // todo: move blockScope to block properties
      const parent = renderer.parent ? this.getBlockScope(renderer.parent) : undefined;
      // const children = this.childrenRenderers.map(child => child.getBlockScope());
      const children = null; // todo
      renderer.blockScope = {
        element: renderer.componentRef.location.nativeElement,
        state: renderer.componentState.asComponentState(),
        parent: parent,
        children: children
      };
    }
    return renderer.blockScope;
  }

  public getBaseScope(renderer: BlockRendererService): BaseScope {
    const blockScope = this.getBlockScope(renderer);
    return {
      ...blockScope,
      block: blockScope,
      document: renderer.document,
      renderer: renderer.renderer
    };
  }

  private renderChildren(renderer: BlockRendererService) {
    if (this.hasChildren(renderer)) {
      const instance = renderer.componentRef.instance;

      if (instance.getContainerRef) {
        const childrenContainer: ViewContainerRef = instance.getContainerRef();
        renderer.childrenContainer = childrenContainer;

        renderer.component.children.forEach(child => {
          this.createChildrenRenderer(child, renderer);
        });

        // todo children container layout
        // if (this.component.childrenContainerLayout)
        // {
        //   this.renderer.setStyle(this.childrenContainer.element.nativeElement, 'display', 'flex');
        //   let flow: string;
        //   switch (this.component.childrenContainerLayout) {
        //     case "row":
        //       flow = 'row nowrap';
        //       break;
        //     case "column":
        //       flow = 'column nowrap';
        //       break;
        //     case "grid":
        //       flow = 'row wrap';
        //       break;
        //   }
        //   this.renderer.setStyle(this.childrenContainer.element.nativeElement, 'flex-flow', flow);
        // }

        // const rendererComponentFactory = this.resolver.resolveComponentFactory<RendererComponent>(RendererComponent);
        // const childInjector = this.createChildInjector(this.componentRef.injector)
        // const childrenRendererRef = childrenContainer.createComponent(rendererComponentFactory, null, childInjector);
        // const childrenRenderer = childrenRendererRef.instance;
        // childrenRenderer.components = this.component.children;
        // childrenRendererRef.changeDetectorRef.detectChanges();

        // const childrenView: EmbeddedViewRef<any> = this.childrenTemplate.createEmbeddedView({});
        // childrenContainer.insert(childrenView);
        // this.childrenView = childrenView;
        // return childrenView;

        // const childrenView: EmbeddedViewRef<any> = this.childrenContainer.createEmbeddedView(this.childrenTemplate);
        // this.childrenView = childrenView;
        // return childrenView;
      }
    }
  }

  private createChildrenRenderer(child: ComponentBlock, renderer: BlockRendererService) {
    // const childView = this.childrenContainer.element;
    const childInjector = this.createChildInjector(renderer.componentRef.injector, renderer);
    const childRenderer = childInjector.get(BlockRendererService);
    // const childRenderer = new BlockRendererService(this.childrenContainer, this.resolver, childInjector, this.renderer, this.document, this.shaper, this.shaperManager, this);
    childRenderer.onInit(child);
  }

  private hasChildren(renderer: BlockRendererService): boolean {
    return renderer.component && renderer.component.children && renderer.component.children.length > 0;
  }

  private handleChanges(renderer: BlockRendererService) {
    renderer.componentRef.changeDetectorRef.detectChanges();
  }

  @RxShaperHook(RootHooks.Destroy)
  onDestroy: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    renderer.triggerHook(CoreHooks.Destroy);
    renderer.componentState.onDestroy();
    renderer.componentRef.destroy();
  }
}
