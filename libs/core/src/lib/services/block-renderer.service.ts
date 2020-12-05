import {
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef, Inject, Injectable,
  Injector, Optional, Renderer2, SkipSelf,
  ViewContainerRef
} from '@angular/core';
import {
  ComponentBlock,
  ComponentBlockSelector,
} from "../models/block";
import {RxShaperService} from "./rxshaper.service";
import {DOCUMENT} from "@angular/common";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription
} from "rxjs";
import {_eval} from "../utils/eval";
import {filter, map, switchMap} from "rxjs/operators";
import * as rxjs from "rxjs/operators";
import {ComponentType} from "../models/component";
import {RendererService} from "./renderer.service";
import {RootHooks} from "../extensions/hooks/root.hooks";

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
  children: BlockScope[]
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

export type ExtensionProperties = { [key: string]: any }

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
    this._changes = this.componentState.stateChanges;
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
  get componentState(): State {
    return this.componentRef.instance;
  } // todo: filter with state allowed properties

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
    } else {
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

@Injectable()
export class BlockRendererService {
  destroy: Subject<void> = new Subject<void>();

  component: ComponentBlock;
  componentType: ComponentType;
  componentRef: ComponentRef<any>;
  childrenView: EmbeddedViewRef<any>;
  childrenContainer: ViewContainerRef;

  childrenRenderers: BehaviorSubject<BlockRendererService[]> = new BehaviorSubject<BlockRendererService[]>([]);

  // custom properties for extensions
  properties: ExtensionProperties = {};
  componentState: ComponentStateManager;
  // scriptRunner: ScriptRunner = new VmScriptRunner();
  scriptRunner: ScriptRunner = new FunctionScriptRunner();

  blockScope: BlockScope; // todo: move to block properties

  isRoot: boolean;

  public document: Document;

  /**
   * @param container
   * @param resolver
   * @param injector
   * @param renderer
   * @param document
   * @param shaper
   * @param shaperManager
   * @param parent
   */
  constructor(
    public container: ViewContainerRef,
    public resolver: ComponentFactoryResolver,
    public injector: Injector,
    public renderer: Renderer2,
    @Inject(DOCUMENT) document: any,
    private shaper: RxShaperService,
    private shaperManager: RendererService,
    @Optional() @SkipSelf() public parent?: BlockRendererService,
  ) {
    this.document = document as Document;
  }

  onInit(component: ComponentBlock, root: boolean = false): void {
    this.component = component;
    this.isRoot = root;
    if (root) {
      this.beforeInitPage();
    }

    this.fixComponent();
    this.triggerHook(RootHooks.Init);

    if (root) {
      this.afterInitPage();
    }
    if (this.parent) {
      this.parent.registerChild(this);
    }
    this.shaperManager.register(this.component.id, this);
  }

  private fixComponent() {
    if (!this.component.id) {
      this.component.id = generateComponentId();
    }
  }

  private beforeInitPage() {
    this.shaperManager.registerRoot(this);
    this.triggerHook(RootHooks.BeforeInitPage);
  }

  private afterInitPage() {
    this.triggerHook(RootHooks.AfterInitPage);
  }

  public triggerHook(hook: string, args?: any) {
    this.shaper.triggerHook(hook, this.shaper, this.shaperManager, this, this.properties, args);
  }

  getBlocksChanges(target: ComponentBlockSelector | string[]): Observable<BlockRendererService[]> {
    if (typeof target === 'string') {
      target = target.split(' ');
    }

    if(!target.length) {
      return of([]);
    }

    const firstTarget = target[0];
    const nextTargets = target.slice(1);

    const firstTarget$ = this.blockTargetsChanges(firstTarget);
    return firstTarget$.pipe(switchMap(blocks => {
      if (nextTargets.length) {
        return combineLatest(blocks.map(b => b.getBlocksChanges(nextTargets)))
          .pipe(map(childrenBlocks => {
            return childrenBlocks.reduce((acc, b) => [...acc, ...b], []);
          }));
      }
      else {
        return of(blocks);
      }
    }));
  }

  getBlockTarget(target: ComponentBlockSelector): BlockRendererService {
    switch (target) {
      case "children":
        return null;
      case "parent":
        return this.parent;
      case 'self':
        return this;
    }

    if (target.startsWith('#')) {
      const id = target.substring(1);
      return this.shaperManager.getBlock(id);
    }

    return null;
  }

  blockTargetsChanges(target: ComponentBlockSelector): Observable<BlockRendererService[]> {
    switch (target) {
      case "children":
        return this.childrenRenderers.asObservable();
      case "parent":
        return of([this.parent]);
      case 'self':
        return of([this]);
      case 'root':
        return of([this.shaperManager.getRoot()]);
    }

    if (target.startsWith('.')) {
      const className = target.substring(1);
      return this.childrenRenderers.asObservable()
        .pipe(
          switchMap(children => {
            const start = this.component.class && this.component.class.some(c => c === className) ? of([this]) : of([]);
            const obsChildren = [start, ...children.map(c => c.blockTargetsChanges(target))];
            return combineLatest(obsChildren)
              .pipe(map(children => {
                return children.reduce((acc, c) => [...acc, ...c], []);
              }));
          })
        );
    }

    if (target.startsWith('#')) {
      const id = target.substring(1);
      return this.shaperManager.blocksChanges(id).pipe(map(b => b ? [b] : []));
    }

    return of([]);
  }

  onDestroy(): void {
    this.childrenRenderers.value.forEach(c => c.onDestroy());
    this.shaperManager.unregister(this.component.id);

    this.destroy.next();
    this.destroy.complete();

    this.triggerHook(RootHooks.Destroy);
  }

  private registerChild(child: BlockRendererService) {
    this.childrenRenderers.next([...this.childrenRenderers.value, child]);
  }

  private unregisterChild(child: BlockRendererService) {
    this.childrenRenderers.next(this.childrenRenderers.value.filter(e => e !== child));
  }
}

export function blockRendererFactory(
  parent: BlockRendererService
): (
  // container: ViewContainerRef,
  resolver: ComponentFactoryResolver,
  injector: Injector,
  renderer: Renderer2,
  document: Document,
  builder: RxShaperService,
  manager: RendererService) => BlockRendererService {
  return (
    // container: ViewContainerRef,
    resolver: ComponentFactoryResolver,
    injector: Injector,
    renderer: Renderer2,
    document: Document,
    shaper: RxShaperService,
    manager: RendererService
  ) => {
    return new BlockRendererService(parent.childrenContainer, resolver, injector, renderer, document, shaper, manager, parent);
    // return new BlockRendererService(container, resolver, injector, renderer, document, builder, manager, parent);
  };
}
