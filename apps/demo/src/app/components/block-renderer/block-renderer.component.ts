import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef, Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit, Renderer2, TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ComponentBlock} from "../builder/builder.component";
import {BuilderifyService} from "../../services/builderify.service";
import {ComponentType} from "../../decorators/block.decorator";
import {RendererComponent} from "../renderer/renderer.component";
import { makeStyles } from '@material-ui/core/styles';
import {DOCUMENT} from "@angular/common";

// Utils
export function generateComponentId(prefix?: string): string {
  return (prefix ? prefix + '_' : '') + Math.random().toString(36).substr(2, 9);
}

@Component({
  selector: 'builderify-block-renderer',
  templateUrl: './block-renderer.component.html',
  styleUrls: ['./block-renderer.component.scss']
})
export class BlockRendererComponent implements OnInit, OnDestroy {

  @ViewChild('container', {static: true, read: ViewContainerRef})
  container: ViewContainerRef
  @ViewChild('children', {static: true, read: TemplateRef})
  childrenTemplate: TemplateRef<any>

  @Input()
  component: ComponentBlock;

  componentType: ComponentType;
  componentRef: ComponentRef<any>;
  childrenView: EmbeddedViewRef<any>;
  childrenContainer: ViewContainerRef;

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document,
    private builder: BuilderifyService
  ) {
  }

  ngOnInit(): void {
    this.fixComponent();
    this.render();
  }

  private render() {
    console.log('render', this.component);
    const componentType = this.builder.getComponentType(this.component.type);

    if (!componentType) {
      return;
    }

    this.componentType = componentType;
    const componentFactory = this.resolver.resolveComponentFactory(componentType.class);
    const newInjector = this.createChildInjector(this.injector);

    const componentRef = this.container.createComponent(componentFactory, null, newInjector);
    this.componentRef = componentRef;

    this.mapOptions();
    this.mapBindings();
    this.applyStyle();
    this.renderChildren();

    this.handleChanges()
  }

  private fixComponent() {
    if (!this.component.id) {
      this.component.id = generateComponentId();
    }
  }

  private createChildInjector(injector: Injector) {
    return Injector.create({providers: [], parent: injector});
  }

  private mapOptions() {
    if (this.componentType.inputs && this.component.options) {
      const instance = this.componentRef.instance;
      this.componentType.inputs.forEach(input => {
        instance[input.name] = this.component.options[input.name];
      });
    }
  }

  private mapBindings() {

  }

  private applyStyle() {
    // const componentStyles = makeStyles({
    //   [this.component.id]: {
    //     background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    //     border: 0,
    //     borderRadius: 3,
    //     boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    //     color: 'white',
    //     height: 48,
    //     padding: '0 30px',
    //   },
    // });
    //
    const head = this.document.head;
    if (head === null) {
      throw new Error('<head> not found within DOCUMENT.');
    }

    // const style = this.renderer.createElement('style')
    // style.innerHTML = ".test {\n" +
    //   "      border: 5px red solid; \n" +
    //   "    }"
    // this.renderer.appendChild(head, style)

    // default style
    this.renderer.setStyle(this.componentRef.location.nativeElement, 'display', 'block');

    // apply custom style, todo: rework with style tag and class
    if (this.component.style) {
      // large
      Object.keys(this.component.style.large).forEach(cssKey => {
        const cssValue = this.component.style.large[cssKey];
        this.renderer.setStyle(this.componentRef.location.nativeElement, cssKey, cssValue);
      })
    }

    this.renderer.addClass(this.componentRef.location.nativeElement, 'builderify-block'); // add builderify block class
    this.renderer.addClass(this.componentRef.location.nativeElement, this.component.id);

    if (this.component.class && this.component.class.length) {
      this.component.class.forEach(c => this.renderer.addClass(this.componentRef.location.nativeElement, c));
    }
  }

  private renderChildren(): EmbeddedViewRef<any> {
    if (this.hasChildren()) {
      const instance = this.componentRef.instance;

      if (instance.getContainerRef) {
        const childrenContainer: ViewContainerRef = instance.getContainerRef();
        this.childrenContainer = childrenContainer;

        const rendererComponentFactory = this.resolver.resolveComponentFactory<RendererComponent>(RendererComponent);
        const childInjector = this.createChildInjector(this.componentRef.injector)
        const childrenRendererRef = childrenContainer.createComponent(rendererComponentFactory, null, childInjector);
        const childrenRenderer = childrenRendererRef.instance;
        childrenRenderer.components = this.component.children;
        childrenRendererRef.changeDetectorRef.detectChanges();

        // const childrenView: EmbeddedViewRef<any> = this.childrenTemplate.createEmbeddedView({});
        // childrenContainer.insert(childrenView);
        // this.childrenView = childrenView;
        // return childrenView;

        // const childrenView: EmbeddedViewRef<any> = this.childrenContainer.createEmbeddedView(this.childrenTemplate);
        // this.childrenView = childrenView;
        // return childrenView;
      }
    }
    return null;
  }

  private hasChildren(): boolean {
    return this.component && this.component.children && this.component.children.length > 0;
  }

  private handleChanges() {
    this.componentRef.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.componentRef.destroy();
  }

}
