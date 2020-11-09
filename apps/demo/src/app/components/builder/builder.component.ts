import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter, InjectionToken, Injector,
  Input,
  OnDestroy,
  OnInit,
  Output, Renderer2, Self,
  Type,
  ViewChild, ViewContainerRef
} from '@angular/core';
// import GrapesJS, {Editor as IEditor} from 'grapesjs';
import GrapesJS, {Editor as IEditor} from 'grapesjs/dist/grapes.js';
// import mjml from 'grapesjs-mjml';
// import newsletter from 'grapesjs-preset-newsletter';
import webpage from 'grapesjs-preset-webpage';
import grapesjsTooltip from 'grapesjs-tooltip';
import {blockPlugin} from "../../plugins/block.plugin";
import {components} from "../../decorators/block.decorator";
import {exportPlugin} from "../../plugins/export.plugin";
// export type SupportedPresetType = 'webpage' | 'newsletter' | 'mjml';

// const presets: Record<SupportedPresetType, any> = {
//   webpage,
//   newsletter,
//   mjml,
// };

export interface Builder {
  DomComponents: any;
}
export const BUILDER = new InjectionToken<Builder>('BUILDER')

// export type ComponentBlockStyle<Theme = DefaultTheme, ClassKey extends string = string> = Styles<Theme, {}, ClassKey>;

export interface ComponentBlockStyle {
  [key: string]: string|number
}

export interface ComponentBlockStyles {
  large?: ComponentBlockStyle;
  medium?: ComponentBlockStyle;
  small?: ComponentBlockStyle;
  custom?: string;
}
export type ComponentBlockContainerLayout = 'row' | 'column' | 'grid';

export interface ComponentBlockBindings {
  [key: string]: string
}
export interface ComponentBlockActions {
  [key: string]: string
}

export interface ComponentBlock {
  type: string;
  id?: string;
  class?: string[];
  options?: any
  children?: ComponentBlock[]
  childrenContainerLayout?: ComponentBlockContainerLayout
  bindings?: ComponentBlockBindings
  actions?: ComponentBlockActions
  style?: ComponentBlockStyles
  script?: string
}

export interface BuilderOptions {
  container?: any;

  fromElement?: boolean;

  // presetType?: SupportedPresetType;

  plugins?: string[];

  storageManager?: any;

  blockManager?: any;

  styleManager?: any;

  width?: string | number;

  height?: string | number;

  components?: any[];

  blocks?: any[];

  // onInit?(editor: IEditor): void;
  //
  // onDestroy?(editor: IEditor): void;
}

export function builderFactory(builder: BuilderComponent): Builder {
  return builder.editor;
}

@Component({
  selector: 'rxshaper-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss'],
  providers: [
    {provide: BUILDER, useFactory: builderFactory, deps: [BuilderComponent]}
  ]
})
export class BuilderComponent implements OnInit, OnDestroy {

  editor: IEditor;

  @ViewChild('builder', {static: true})
  builder: ElementRef<HTMLDivElement>;
  @ViewChild('builder', {static: true, read: ViewContainerRef})
  builderRef: ViewContainerRef;

  @Input()
  options: BuilderOptions = {
    fromElement: true,
    plugins: [],
    blocks: [],
    blockManager: {},
    storageManager: {},
    styleManager: {},
    width: 'auto',
    height: '100vh',
    components: [],
  };

  @Output()
  init: EventEmitter<IEditor> = new EventEmitter<IEditor>();
  @Output()
  destroy: EventEmitter<IEditor> = new EventEmitter<IEditor>();

  components: ComponentBlock[] = [];

  constructor(
    private injector: Injector,
    private factory: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {
    this.editor = GrapesJS.init({
      container: this.builder.nativeElement,
      ...this.options,
      plugins: [
        webpage,
        grapesjsTooltip,
        ...this.options.plugins,
        editor => blockPlugin(editor, {
          viewContainerRef: this.builderRef,
          factory: this.factory,
          injector: this.injector,
          renderer: this.renderer,
          components: components
        }),
        exportPlugin
      ]
    });
    // this.initComponents()
    // this.editor.addComponents({
    //   type: 'block',
    // });
    this.init.next(this.editor);
    this.init.complete();

    this.onExport();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.destroy.next(this.editor);
      this.destroy.complete();
      GrapesJS.editors = GrapesJS.editors.filter((e: any) => e !== this.editor);
      this.editor.destroy();
      if (this.builder) {
        this.builder.nativeElement.innerHTML = '';
      }
    }
  }

  private initComponents() {
    // this.editor.DomComponents.addType('my-input-type', {
    //   // Make the editor understand when to bind `my-input-type`
    //   isComponent: el => el.tagName === 'INPUT',
    //   // Model definition
    //   model: {
    //     // Default properties
    //     defaults: {
    //       tagName: 'input',
    //       draggable: 'form, form *', // Can be dropped only inside `form` elements
    //       droppable: false, // Can't drop other elements inside
    //       attributes: { // Default attributes
    //         type: 'text',
    //         name: 'default-name',
    //         placeholder: 'Insert text here',
    //       },
    //       traits: [
    //         'name',
    //         'placeholder',
    //         { type: 'checkbox', name: 'required' },
    //       ],
    //     }
    //   }
    // });
    // this.addComponentType('block', BlockComponent);
  }

  private addComponentType(typeRef: string, component: Type<any>) {
    const injector = this.injector;
    const factory = this.factory;
    const applicationRef = this.applicationRef;

    const domc = this.editor.DomComponents;
    const defaultType = domc.getType('default');
    const defaultModel = defaultType.model;
    const defaultView = defaultType.view;

    domc.addType(typeRef, {
      model: defaultModel.extend({
        defaults: {
          ...defaultModel.prototype.defaults,
          labels: {
          },
          droppable: false,
          traits: [
            // {
            //   label: 'Start',
            //   name: 'startFrom',
            //   changeProp: 1,
            //   type: 'datetime-local', // can be 'date'
            // }
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
          // this.listenTo(this.model, 'change:startFrom change:timerLabel change:displayLabels', this.handleChanges);
        },
        //
        // // Called whenever startFrom, timerLabel or displayLabels changes
        // handleChanges(e) {
        //   /// Force rerender
        //   // Make sure we start react from scratch for el
        //   ReactDOM.unmountComponentAtNode(this.el);
        //   this.render();
        // },

        onRender({el}) {
          console.log('onRender', el);
          const componentFactory = factory.resolveComponentFactory(component);
          const componentRef = componentFactory.create(injector, [], el);
          applicationRef.attachView(componentRef.hostView);
          this.componentRef = componentRef;
        },
        removed() {
          console.log('removed', this.componentRef);
          if (this.componentRef) {
            applicationRef.detachView(this.componentRef.hostView);
          }
        },
      }),
    });
  }

  onExport() {
    const components = this.getComponents();
    console.log(components);
    this.components = components.components;
  }

  getComponents() {
    const cmp = this.editor.DomComponents;
    const cm = this.editor.CodeManager;

    if (!cmp || !cm) return;

    const wrp = cmp.getComponents();
    return {
      // components: cm.getCode(wrp, 'json'),
      components: JSON.parse(JSON.stringify(this.editor.getComponents())),
      css: this.editor.getCss(),
      html: this.editor.getHtml()
    };
  }
}
