import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  Renderer2,
  Type,
  ViewContainerRef
} from "@angular/core";
import {AngularComponentType, ComponentType} from "../decorators/block.decorator";
import {Plugin} from "./plugin";

export interface BlockPluginOptions {
  injector: Injector;
  factory: ComponentFactoryResolver;
  viewContainerRef: ViewContainerRef;
  renderer: Renderer2;

  components: AngularComponentType[]
}

export const blockPlugin: Plugin<BlockPluginOptions> = (editor, options) => {
  options.components.forEach(component => addComponentType(component, editor, options.injector, options.factory, options.viewContainerRef, options.renderer));
}

function addComponentType(component: ComponentType, editor, injector: Injector, factory: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, renderer: Renderer2) {
  // const injector = this.injector;
  // const factory = this.factory;
  // const applicationRef = this.applicationRef;

  const typeRef = component.tag;
  const domc = editor.DomComponents;
  const defaultType = domc.getType('default');
  const defaultModel = defaultType.model;
  const defaultView = defaultType.view;
  const bm = editor.BlockManager;

  domc.addType(component.tag, {
    model: defaultModel.extend({
      defaults: {
        ...defaultModel.prototype.defaults,
        labels: {},
        droppable: component.canHaveChildren,
        traits: [
          ...component.inputs
        ]
      },
    }, {
      isComponent(el) {
        console.log('isComponent', el);
        if ((el.getAttribute && el.getAttribute('data-gjs-type') == typeRef)
          || (el.attributes && el.attributes['data-gjs-type'] == typeRef)) {
          return {
            type: typeRef
          };
        }
      }
    }),


    view: defaultView.extend({
      // // Listen to changes of startFrom, timerLabel or displayLabels managed by the traits
      init() {
        console.log('init');
        const events = component.inputs.map(input => 'change:attributes:' + input.name).join(' ');
        this.listenTo(this.model, events, this.handleChanges);
      },
      //
      // // Called whenever startFrom, timerLabel or displayLabels changes
      handleChanges(e, forceDetectChanges = true) {
        console.log('handleChanges', e);
        const componentRef: ComponentRef<any> = this.componentRef;
        if (component.inputs) {
          const instance = componentRef.instance;
          component.inputs.forEach(input => {
            instance[input.name] = this.model.attributes.attributes[input.name];
          });

          componentRef.changeDetectorRef.detectChanges();
        } else if (forceDetectChanges) {
          componentRef.changeDetectorRef.detectChanges();
        }
      },
      // render() {
      //   this.renderAttributes();
      //   if (this.modelOpt.temporary) return this;
      //   this.renderChildren();
      //   this.updateScript();
      //   setViewEl(this.el, this);
      //   this.postRender();
      //
      //   return this;
      // },
      preRender(opts) {
        const el = opts.el;
        console.log('preRender', opts);
        const componentFactory = factory.resolveComponentFactory(component.class);
        const componentRef = componentFactory.create(this.getInjector(), [], el);
        this.componentRef = componentRef;

        //   // const {injector, parent} = this.getInjectorAndParent();
        //   // if (parent) {
        //   //   let viewContainerRef: ViewContainerRef;
        //   //
        //   //   if (parent.instance.getContainer) {
        //   //     viewContainerRef = parent.instance.getContainer();
        //   //   }
        //   //   if (!viewContainerRef) {
        //   //     viewContainerRef = injector.get(ViewContainerRef);
        //   //   }
        //   //
        //   //   this.componentRef = viewContainerRef.createComponent(componentFactory);
        //   //   renderer.appendChild(el, this.componentRef.location.nativeElement);
        //   //   console.log(el, this.componentRef.location.nativeElement);
        //   // } else {
        //   //   const componentRef = componentFactory.create(this.getInjector(), [], el);
        //   //   this.componentRef = componentRef;
        //   //
        //   //   applicationRef.attachView(this.componentRef.hostView);
        //   // }
        //
        //   // this.handleChanges();
        //   applicationRef.attachView(componentRef.hostView);
      },
      getInjector() {
        const angularParent = this.getClosestAngularComponent();

        return angularParent ? angularParent.injector : injector;
      },
      getInjectorAndParent(): { injector: Injector, parent: ComponentRef<any> } {
        const angularParent = this.getClosestAngularComponent();

        return {injector: angularParent ? angularParent.injector : injector, parent: angularParent};
      },
      getClosestAngularComponent(): ComponentRef<any> {
        if (this.closestAngularComponent) {
          return this.closestAngularComponent;
        }

        const parent = this.findClosest((parent) => !!parent.view.componentRef)

        this.closestAngularComponent = parent ? parent.view.componentRef : null;

        return this.closestAngularComponent;
      },
      findClosest(search: (model) => boolean) {
        let parent = this.model.parent();

        while (parent && !search(parent)) {
          parent = parent.parent();
        }

        return parent;
      },
      onRender(opts) {
        // const el = opts.el;
        // console.log('onRender', opts);
        // const componentFactory = factory.resolveComponentFactory(component.class);
        // const componentRef = componentFactory.create(injector, [], el);
        // this.componentRef = componentRef;

        // const {injector, parent} = this.getInjectorAndParent();
        //
        // if (parent) {
        //   let viewContainerRef: ViewContainerRef;
        //
        //   if (parent.instance.getContainerRef) {
        //     viewContainerRef = parent.instance.getContainerRef();
        //   }
        //   if (!viewContainerRef) {
        //     viewContainerRef = injector.get(ViewContainerRef);
        //   }
        //
        //   const view = viewContainerRef.insert(this.componentRef.hostView);
        //   console.log(view);
        // } else {
        //   applicationRef.attachView(this.componentRef.hostView);
        // }

        viewContainerRef.insert(this.componentRef.hostView);
        this.handleChanges(this, true);
      },
      getChildrenContainerRef(): ViewContainerRef {
        const componentRef: ComponentRef<any> = this.componentRef;
        const instance = componentRef ? componentRef.instance : null;

        if (instance && instance.getContainerRef) {
          return instance.getContainerRef();
        }

        return null;
      },
      getChildrenContainer(): HTMLElement {
        const componentRef: ComponentRef<any> = this.componentRef;
        const instance = componentRef ? componentRef.instance : null;

        if (instance && instance.getContainer) {
          return instance.getContainer();
        }

        let container = this.el;

        if (typeof this.getChildrenSelector == 'function') {
          container = this.el.querySelector(this.getChildrenSelector());
        } else if (typeof this.getTemplate == 'function') {
          // Need to find deepest first child
        }

        return container;
      },
      renderChildren(opts) {
        const {em, model, modelOpt} = this;

        if (!modelOpt.temporary) {
          this.preRender(this._clbObj());
          em && em.trigger('component:mount', model);
        }

        console.log('renderChildren', opts);
        // this.updateContent();
        const container = this.getChildrenContainer();
        const view =
          this.childrenView ||
          new domc.ComponentsView({
            collection: this.model.get('components'),
            config: this.config,
            componentTypes: this.opts.componentTypes
          });

        view.render(container);
        this.childrenView = view;
        const childNodes = Array.prototype.slice.call(view.el.childNodes);

        for (let i = 0, len = childNodes.length; i < len; i++) {
          renderer.appendChild(container, childNodes.shift());
        }
      },
      removed() {
        console.log('removed', this.componentRef);
        if (this.componentRef) {
          this.componentRef.destroy();
        }
      },
    }),
  });

  bm.remove(typeRef);
  bm.add(typeRef, {
    label: typeRef,
    category: typeRef,
    attributes: {class: 'fa fa-clock-o'},
    // content: `
    //     <div data-gjs-type="${typeRef}"></div>
    //   `
    content: {type: typeRef}
  });
}
