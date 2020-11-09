import {
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef, Inject,
  Injector, Optional, Renderer2, SkipSelf,
  ViewContainerRef
} from '@angular/core';
import {ComponentBlock} from "../builder/builder.component";
import {RxShaperService} from "../../services/rxshaper.service";
import {ComponentType} from "../../decorators/block.decorator";
import {DOCUMENT} from "@angular/common";
import {fromEvent, Observable, ReplaySubject, Subject, Subscription} from "rxjs";
import {_eval} from "../../utils/eval";
import {filter, map, takeUntil, tap} from "rxjs/operators";
import * as rxjs from "rxjs/operators";

// Utils
export function generateComponentId(prefix = 'rxshaper'): string {
  return (prefix ? prefix + '-' : '') + Math.random().toString(36).substr(2, 9);
}

export interface ScriptRunner<TOptions = any> {
  run<T = any>(script: string, context: any, options?: TOptions): T;
}

export class VmScriptRunner implements ScriptRunner {
  run<T = any>(script: string, context: any, options) {
    return _eval(script, 'script.ts', {...context, rxjs: rxjs}, false).default;
  }
}
export class FunctionScriptRunner implements ScriptRunner {
  run<T = any>(script: string, context: any, options) {
    context = {...context, rxjs: rxjs};
    const parametersNames: string[] = [];
    const parametersValues: any[] = [];
    Object.keys(context).forEach(p => {
      parametersNames.push(p);
      parametersValues.push(context[p]);
    });
    const wrappedScript = '"use strict"; let result; function returnValue(value){result = value}; function runScript(){' + script + ';} runScript(); return result;';
    const result = new Function(...parametersNames, wrappedScript);
    return result(...parametersValues);
  }
}

export interface BlockScope<State extends object = object> {
  state: ComponentState<State>;
  element: any;
  parent?: BlockScope;
}

export interface BaseScope<State extends object = object> extends BlockScope<State> {
  block: BlockScope<State>;
  document: Document;
  renderer: Renderer2;
}

export interface BindingScope<State extends object = object> extends BaseScope<State> {
  property: PropertyKey;
}

export interface ActionEvent<T = any> {
  name: string;
  value: T
}

export interface ActionScope<State extends object = object> extends BaseScope<State> {
  event: ActionEvent;
}

export type ScriptScope<State extends object = object> = BaseScope<State>

export type StateChanges = StateChange[];

export interface StateChange<T = any> {
  property: PropertyKey;
  previousValue: T;
  nextValue: T;
}

export interface ComponentState<State extends object = object> {
  onInit(): Promise<State>;
  subscribeOnInit<T = any>(callBack: (state: State) => T): Promise<T>;
  onChanges(): Observable<StateChanges>;
  subscribeOnChanges<T = any>(callBack: (state: StateChanges) => T): Subscription;
  onChange(property: PropertyKey): Observable<StateChange>;
  subscribeOnChange<T = any>(property: PropertyKey, callBack: (state: StateChange) => T): Subscription;
  onDestroy(): Promise<void>;
  subscribeOnDestroy<T = any>(callBack: () => T): Promise<T>;
}

export class ComponentStateHandler<State extends object = object> implements ProxyHandler<ComponentState<State>>, ComponentState<State> {

  private _init: Promise<State>;
  private _changes: Observable<StateChanges>;
  private _destroy: Promise<void>;
  private static readonly _allowedMethods = [
    'onInit', 'subscribeOnInit',
    'onChanges', 'subscribeOnChanges',
    'onChange', 'subscribeOnChange',
    'onDestroy', 'subscribeOnDestroy'
  ];

  constructor(private componentState: ComponentStateManager<State>) {
    this.initLifecycle();
  }

  // Proxy definitions

  // has? (target: State, p: PropertyKey): boolean {
  //   // return target.has(p);
  // }

  get?(target: ComponentState<State>, p: PropertyKey, receiver: any): any {
    // handle functions
    if (ComponentStateHandler._allowedMethods.some(m => m === p)) {
      return (...args: any[]) => {
        return this[p](...args);
      };
    }

    // handle real component state properties
    return this.componentState.get(p);
  }

  set?(target: ComponentState<State>, p: PropertyKey, value: any, receiver: any): boolean {
    return this.componentState.set(p, value);
  }

  private initLifecycle() {
    this._init = this.componentState.stateInit.toPromise();
    this._changes = this.componentState.stateChanges.pipe(tap(r => {
      console.log('bbbbb', r);
    }));
    this._destroy = this.componentState.stateDestroy.toPromise();
  }

  onInit(): Promise<State> {
    return this._init;
  }
  subscribeOnInit<T = any>(callBack: (state: State) => T): Promise<T> {
    return this.onInit().then(callBack);
  }

  onChanges(): Observable<StateChanges> {
    return this._changes;
  }
  subscribeOnChanges<T = any>(callBack: (state: StateChanges) => T): Subscription {
    return this.onChanges().subscribe(changes => callBack(changes));
  }
  onChange(property: PropertyKey): Observable<StateChange> {
    return this.componentState.getStateChange(property);
  }
  subscribeOnChange<T = any>(property: PropertyKey, callBack: (state: StateChange) => T): Subscription {
    return this.onChange(property).subscribe(change => callBack(change));
  }

  onDestroy(): Promise<void> {
    return this._destroy;
  }
  subscribeOnDestroy<T = any>(callBack: () => T): Promise<T> {
    return this.onDestroy().then(callBack);
  }
}

export class ComponentStateManager<State extends object = object> {
  get componentState(): State {return this.componentRef.instance;} // todo: filter with state allowed properties

  private _stateValue: State;
  private _state: ReplaySubject<State> = new ReplaySubject<State>();
  state: Observable<State> = this._state.asObservable();

  private _stateInit: Subject<State> = new Subject<State>();
  stateInit: Observable<State> = this._stateInit.asObservable();
  private _stateChanges: Subject<StateChanges> = new Subject<StateChanges>();
  stateChanges: Observable<StateChanges> = this._stateChanges.asObservable();
  private _stateDestroy: Subject<void> = new Subject<void>();
  stateDestroy: Observable<void> = this._stateDestroy.asObservable();

  constructor(private componentType: ComponentType, private componentRef: ComponentRef<any>) {
  }

  asComponentState(): ComponentState<State> {
    const handler: ComponentStateHandler<State> = new ComponentStateHandler<State>(this);
    return new Proxy<ComponentState<State>>({} as ComponentState<State>, handler);
  }

  getStateChange(property: PropertyKey): Observable<StateChange> {
    return this.stateChanges
      .pipe(
        map(changes => changes.find(c => c.property === property)),
        filter(change => !!change)
      );
  }

  setState(state: Partial<State>): StateChanges {
    return this._setState(state);
  }

  private _setState(state: Partial<State>, isInit: boolean = false): StateChanges {
    const currentState = this.componentState;
    const changes: StateChanges = Object.keys(state).map(property => {
      // todo: filter with state allowed properties
      const next = state[property];
      const change: StateChange = {
        property: property,
        previousValue: currentState[property],
        nextValue: next
      };
      currentState[property] = next;
      return change;
    });
    if (isInit) {
      const initState = JSON.parse(JSON.stringify(currentState));
      this._stateValue = initState;
      this._state.next(initState);
      this._stateInit.next(initState);
    }
    else {
      const nextState = {...this._stateValue, ...state};
      this._stateValue = nextState;
      this._state.next(nextState);
    }
    this._stateChanges.next(changes);
    return changes;
  }

  getState(): State {
    return {...this.componentState};
  }

  set<T = any>(property: PropertyKey, value: T): boolean {
    // todo: filter with state allowed properties
    const change: StateChange = {
      property: property,
      previousValue: this.componentState[property],
      nextValue: value
    };
    this.componentState[property] = value;
    this._stateChanges.next([change]);

    return true;
  }

  get<T = any>(property: PropertyKey) {
    // todo: filter with state allowed properties
    return this.componentState[property];
  }

  onInit(state: State) {
    this._setState(state, true);

    this._stateInit.complete();
    this._stateInit.unsubscribe();
  }
  onDestroy() {
    this._stateChanges.complete();
    this._stateChanges.unsubscribe();

    this._stateDestroy.next();
    this._stateDestroy.complete();
    this._stateDestroy.unsubscribe();
  }
}

export class BlockRendererService {
  destroy: Subject<void> = new Subject<void>();

  component: ComponentBlock;

  componentType: ComponentType;
  componentRef: ComponentRef<any>;
  childrenView: EmbeddedViewRef<any>;
  childrenContainer: ViewContainerRef;

  childrenRenderers: BlockRendererService[] = [];
  componentState: ComponentStateManager;

  // scriptRunner: ScriptRunner = new VmScriptRunner();
  scriptRunner: ScriptRunner = new FunctionScriptRunner();

  /**
   * @param container
   * @param resolver
   * @param injector
   * @param renderer
   * @param document
   * @param builder
   * @param parent
   */
  constructor(
    private container: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private builder: RxShaperService,
    @Optional() @SkipSelf() private parent?: BlockRendererService
  ) {
    if (parent) {
      parent.registerChild(this);
    }
  }

  onInit(component: ComponentBlock): void {
    this.component = component;
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

    this.createState();
    this.mapOptions();
    this.mapBindings();
    this.mapActions();
    this.applyScript();
    this.applyStyle();

    this.renderChildren();

    this.handleChanges();
  }

  private fixComponent() {
    if (!this.component.id) {
      this.component.id = generateComponentId();
    }
  }

  private createChildInjector(injector: Injector) {
    return Injector.create({providers: [], parent: injector});
  }

  private createState() {
    const componentState = new ComponentStateManager(this.componentType, this.componentRef);
    this.componentState = componentState;
  }

  private mapOptions() {
    if (this.componentType.inputs && this.component.options) {
      this.componentState.setState(this.component.options);
      // const instance = this.componentRef.instance;
      // this.componentType.inputs.forEach(input => {
      //   instance[input.name] = this.component.options[input.name];
      // });
    }
  }

  public getBlockScope(): BlockScope {
    const parent = this.parent ? this.parent.getBlockScope() : undefined;
    return {
      element: this.componentRef.location.nativeElement,
      state: this.componentState.asComponentState(),
      parent: parent
    };
  }

  public getBaseScope(): BaseScope {
    const blockScope = this.getBlockScope();
    return {
      ...blockScope,
      block: blockScope,
      document: this.document,
      renderer: this.renderer
    };
  }

  private getScriptScope(): ScriptScope {
    return this.getBaseScope();
  }

  private getBindingScope(property: PropertyKey): BindingScope {
    const baseScope = this.getBaseScope();
    return {
      ...baseScope,
      property: property
    };
  }

  private getActionScope(name: string, eventValue: any): ActionScope {
    const baseScope = this.getBaseScope();
    return {
      ...baseScope,
      event: {name: name, value: eventValue}
    };
  }

  private applyScript() {
    if (this.component.script) {
      if (typeof this.component.script !== 'string') {
        console.error('Component property script must be of type string');
        return;
      }

      const scriptScope: ScriptScope = this.getScriptScope();
      // const bindingValue = _eval(this.component.script, 'script.ts', scriptScope, false);
      const scriptResult = this.scriptRunner.run(this.component.script, scriptScope);

      // apply async script
      if (scriptResult) {
        if(scriptResult instanceof Observable) {
          scriptResult.subscribe(result => {
            // todo: do something
          });
        }
        else {
          Promise.resolve(scriptResult).then(result => {
            // todo: do something
          });
        }
      }
    }
  }

  private mapBindings() {
    if (this.componentType.inputs && this.component.bindings) {
      // const instance = this.componentRef.instance;
      this.componentType.inputs.forEach(input => {
        const binding = this.component.bindings[input.name];

        if (binding) {
          if (typeof binding !== 'string') {
            console.error('Component property binding must be of type string');
          } else {
            const bindingScope: BindingScope = this.getBindingScope(input.name);

            // const bindingValue = _eval(binding, 'binding.ts', bindingScope, false);
            const bindingResult = this.scriptRunner.run(binding, bindingScope);
            // apply binding
            if (bindingResult) {
              if (bindingResult instanceof Observable) {
                bindingResult.pipe(takeUntil(this.destroy)).subscribe(result => this.componentState.set(input.name, result));
              }
              else {
                Promise.resolve(bindingResult).then(result => this.componentState.set(input.name, result));
              }
            }
          }
        }
      });
    }
  }

  private mapActions() {
    if (this.component.actions) {
      // const instance = this.componentRef.instance;
      Object.keys(this.component.actions).forEach(actionName => {
          const actionScript = this.component.actions[actionName];

          if (actionScript) {
            if (typeof actionScript !== 'string') {
              console.error('Component property binding must be of type string');
            } else {
              let event: Observable<any>;

              if (actionName === 'state.init') { // component any state changes evennt
                event = this.componentState.stateChanges;
              }
              else if (actionName === 'state.changes') { // component any state changes evennt
                event = this.componentState.stateChanges;
              }
              else if (actionName === 'state.destroy') { // component any state changes evennt
                event = this.componentState.stateChanges;
              }
              else if (actionName.startsWith('state.change.') && actionName.split('.').length === 3) { // component one state change
                const property = actionName.split('.')[2];
                event = this.componentState.getStateChange(property);
              }
              else {
                const componentOutput = this.componentType.outputs ? this.componentType.outputs.find(o => o.name === actionName) : null;

                if (componentOutput) { // angular native output
                  const outputEmitter = this.componentRef.instance[actionName];
                  if (outputEmitter instanceof Observable) {
                    event = outputEmitter;
                  } else {
                    console.error('Component output must be an observable');
                  }
                } else { // vanilla js event
                  event = fromEvent(this.componentRef.location.nativeElement, actionName);
                }
              }

              event
                .pipe(takeUntil(this.destroy))
                .subscribe((eventValue) => this.runComponentAction(actionName, actionScript, eventValue));
            }
          }
        }
      );
    }
  }

  private runComponentAction(actionName: string, actionScript: string, eventValue: any) {
    const actionScope: ActionScope = this.getActionScope(actionName, eventValue);
    // const actionResult = _eval(actionScript, 'action.ts', actionScope, false);
    const actionResult = this.scriptRunner.run(actionScript, actionScope);

    // apply async script
    if (actionResult) {
      Promise.resolve(actionResult).then(result => {
        // todo: do something
      });
    }
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
      });
    }

    this.renderer.addClass(this.componentRef.location.nativeElement, 'rxshaper-block'); // add rxshaper block class
    this.renderer.addClass(this.componentRef.location.nativeElement, this.component.id);

    if (this.component.class && this.component.class.length) {
      this.component.class.forEach(c => this.renderer.addClass(this.componentRef.location.nativeElement, c));
    }
  }

  private renderChildren() {
    if (this.hasChildren()) {
      const instance = this.componentRef.instance;

      if (instance.getContainerRef) {
        const childrenContainer: ViewContainerRef = instance.getContainerRef();
        this.childrenContainer = childrenContainer;

        this.component.children.forEach(child => {
          this.createChildrenRenderer(child);
        });

        // todo children container layout
        // if (this.component.childrenContainerLayout)
        // {
        //   console.log(this.childrenContainer.element.nativeElement.parent());
        //   this.renderer.setStyle(this.childrenContainer.element.nativeElement, 'display', 'flex');
        //   let flow: string;
        //   switch (this.component.childrenContainerLayout) {
        //     case "row":
        //       flow = 'row nowrap'
        //       break;
        //     case "column":
        //       flow = 'column nowrap'
        //       break;
        //     case "grid":
        //       flow = 'row wrap'
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

  private createChildrenRenderer(child: ComponentBlock) {
    // const childView = this.childrenContainer.element;
    const childInjector = this.createChildInjector(this.componentRef.injector);
    const renderer = new BlockRendererService(this.childrenContainer, this.resolver, childInjector, this.renderer, this.document, this.builder, this);
    renderer.onInit(child);
  }

  private hasChildren(): boolean {
    return this.component && this.component.children && this.component.children.length > 0;
  }

  private handleChanges() {
    this.componentRef.changeDetectorRef.detectChanges();
  }

  onDestroy(): void {
    this.childrenRenderers.forEach(c => c.onDestroy());

    this.componentState.onDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.componentRef.destroy();
  }

  private registerChild(child: BlockRendererService) {
    this.childrenRenderers.push(child);
  }
}
