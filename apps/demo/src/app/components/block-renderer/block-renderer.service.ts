import {
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef, Inject, Injectable,
  Injector, Optional, Renderer2, SkipSelf,
  ViewContainerRef
} from '@angular/core';
import {
  AnimationStyle,
  ComponentBlock,
  ComponentBlockAnimationAction,
  ComponentBlockAnimationActionEffect,
  ComponentBlockAnimationActionEffectType, ComponentBlockAnimationActionProperties,
  ComponentBlockAnimationActions,
  ComponentBlockAnimationActionType,
  ComponentBlockAnimationTimelineActions,
  ComponentBlockSelector,
  NormalizedAnimation
} from "../builder/builder.component";
import {RxShaperService} from "../../services/rxshaper.service";
import {DOCUMENT} from "@angular/common";
import {
  animationFrameScheduler, BehaviorSubject,
  combineLatest,
  fromEvent, merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription
} from "rxjs";
import {_eval} from "../../utils/eval";
import {distinctUntilChanged, filter, map, switchMap, takeUntil, tap, throttleTime} from "rxjs/operators";
import * as rxjs from "rxjs/operators";
import {ComponentType} from "../../services/component";
import {RxShaperExtension, RxShaperExtensionFunction} from "../../extensions/extension";
import {RendererService} from "../renderer/renderer.service";
import {groupBy} from "../../utils/groupBy";
import {sort} from "../../utils/sort";
import {
  animate,
  AnimationBuilder,
  AnimationMetadata,
  AnimationStyleMetadata,
  keyframes,
  style
} from "@angular/animations";

import {anime, AnimeManager, timeline} from "../../utils/anime";
import {fromIntersectionObserver, IntersectionStatus} from "../../utils/fromIntersectionObserver";

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

  isRoot: boolean;

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
    private container: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private shaper: RxShaperService,
    private shaperManager: RendererService,
    @Optional() @SkipSelf() private parent?: BlockRendererService,
  ) {
    this.animationBuilder = this.injector.get(AnimationBuilder);
  }

  private animationBuilder: AnimationBuilder;

  onInit(component: ComponentBlock, root: boolean = false): void {
    this.component = component;
    this.isRoot = root;
    if (root) {
      this.beforeInitPage();
    }

    this.executeExtensions((e) => e.onInit);
    this.fixComponent();

    this.executeExtensions((e) => e.beforeRender);
    this.render();
    this.executeExtensions((e) => e.afterRender);

    if (root) {
      this.afterInitPage();
    }
    if (this.parent) {
      this.parent.registerChild(this);
    }
    this.shaperManager.register(this.component.id, this);
  }

  private beforeInitPage() {
    this.shaperManager.registerRoot(this);
    this.executeExtensions(e => e.beforeInitPage);
  }

  private afterInitPage() {
    this.executeExtensions(e => e.afterInitPage);
  }

  private render() {
    const componentType = this.shaper.getComponentType(this.component.type);

    if (!componentType) {
      return;
    }

    this.componentType = componentType;
    const componentFactory = this.resolver.resolveComponentFactory(componentType.class);
    const newInjector = this.createChildInjector(this.injector);

    // apply wrappers
    const containerWithWrappers = this.shaper.config.wrappers
      .reduce((c, w) => w.wrapper.wrap(c, this.shaper, this), this.container);

    const componentRef = containerWithWrappers.createComponent(componentFactory, null, newInjector);
    this.componentRef = componentRef;

    this.executeExtensions((e) => e.beforeCreateState);
    this.createState();
    this.executeExtensions((e) => e.afterCreateState);

    this.executeExtensions((e) => e.beforeStateBindings);
    this.mapOptions();
    this.mapBindings();
    this.mapActions();
    this.mapAnimationActions();
    this.applyScript();
    this.executeExtensions((e) => e.afterCreateState);

    this.executeExtensions((e) => e.beforeApplyStyle);
    this.applyClassAndAttributes();
    this.applyStyle();
    this.executeExtensions((e) => e.afterApplyStyle);

    this.executeExtensions((e) => e.beforeRenderChildren);
    this.renderChildren();
    this.executeExtensions((e) => e.afterRenderChildren);

    this.handleChanges();
  }

  private fixComponent() {
    if (!this.component.id) {
      this.component.id = generateComponentId();
    }
  }

  public executeExtensions<T = any>(fn: (extension: RxShaperExtension) => RxShaperExtensionFunction): T[] {
    return this.shaper.extensions.map(e => fn(e.extension)(this.shaper, this, this.properties));
  }

  private createChildInjector(injector: Injector) {
    return Injector.create({
      providers: [
        {
          provide: BlockRendererService, useFactory: blockRendererFactory(this), deps: [
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

  private blockScope: BlockScope;

  public getBlockScope(): BlockScope {
    if (!this.blockScope) {
      const parent = this.parent ? this.parent.getBlockScope() : undefined;
      // const children = this.childrenRenderers.map(child => child.getBlockScope());
      const children = null; // todo
      this.blockScope = {
        element: this.componentRef.location.nativeElement,
        state: this.componentState.asComponentState(),
        parent: parent,
        children: children
      };
    }
    return this.blockScope;
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
        if (scriptResult instanceof Observable) {
          scriptResult.subscribe(result => {
            // todo: do something
          });
        } else {
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
              } else {
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
                event = this.componentState.stateInit;
              } else if (actionName === 'state.changes') { // component any state changes evennt
                event = this.componentState.stateChanges;
              } else if (actionName === 'state.destroy') { // component any state changes evennt
                event = this.componentState.stateDestroy;
              } else if (actionName.startsWith('state.change.') && actionName.split('.').length === 3) { // component one state change
                const property = actionName.split('.')[2];
                event = this.componentState.getStateChange(property);
              } else {
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

  private mapAnimationActions() {
    if (this.component.animationActions) {
      // const instance = this.componentRef.instance;
      Object.keys(this.component.animationActions).forEach(eventTypeName => {
        const animations = this.component.animationActions[eventTypeName];

        const normalizedAnimations: NormalizedAnimation[] = this.normalizeAnimations(animations);

        const {events, actionType} = this.buildAnimationEvents(eventTypeName, animations, this.componentRef.location.nativeElement);

        if (normalizedAnimations && events) {
          this.buildComponentAnimation(normalizedAnimations, events, actionType);
        }
      });
    }
  }

  private _eventTypes: ComponentBlockAnimationActionType[] = [
    {
      name: 'mousePos',
      progressive: true,
      timelines: {
        x: {
          min: 0,
          max: 1
        },
        y: {
          min: 0,
          max: 1
        }
      },
      build: el => fromEvent(el, 'mousemove')
        .pipe(
          // throttleTime(1000/60), // 60 fps
          throttleTime(0, animationFrameScheduler), // sync with frames

          map((e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width; // x position within the element.
            const y = (e.clientY - rect.top) / rect.height;  // y position within the element.
            return {x: x, y: y};
          }),
          filter(v => v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1), // filter events out of element
        )
    },
    {
      name: 'mouseenter',
      progressive: false,
      build: (el) => fromEvent(el, 'mouseenter')
    },
    {
      name: 'mouseleave',
      progressive: false,
      build: (el) => fromEvent(el, 'mouseleave')
    },
    {
      name: 'enterviewport',
      progressive: false,
      // params: [name: , type: , options: , defaultValue: ] // params for visual form (formly)
      build: (el, options,  manager) => {
        const config: IntersectionObserverInit = {
          root: manager.viewport,
          rootMargin: `${options.marginTop || '0px'} ${options.marginRight || '0px'} ${options.marginBottom || '0px'} ${options.marginLeft || '0px'}`,
          threshold: options.threshold || 0
        };
        return fromIntersectionObserver(el, config)
          .pipe(
            tap(console.log),
            distinctUntilChanged(),
            filter(v => v === IntersectionStatus.Visible)
          )
          ;
      }
    }
  ];

  private buildAnimationEvents(eventTypeName: string, animations: ComponentBlockAnimationActionProperties, el: HTMLElement): { events: Observable<{source: BlockRendererService, event: Observable<any>}[]>; actionType: ComponentBlockAnimationActionType } {
    const eventType = this._eventTypes.find(e => e.name === eventTypeName);
    const targetSelector = animations.target || 'self';


    if (eventType) {
      const targets = this.getBlocksChanges(targetSelector);
      const events = targets.pipe(map(ts => {
        return ts.map(t => ({source: t, event: eventType.build(t.componentRef.location.nativeElement, animations.options, this.shaperManager, this.shaper)}));
      }));
      return {events: events, actionType: eventType};
    }

    return null;
  }

  private normalizeAnimations(dirtyAnims: ComponentBlockAnimationActionProperties): NormalizedAnimation[] {
    // group animations and oder byr keyframe
    const allKeyFrames: { property: string, keyframe: number, effect: ComponentBlockAnimationActionEffect }[] = [];
    if (dirtyAnims.timelines) {
      const allKeyFramesTimelines: { property: string, keyframe: number, effect: ComponentBlockAnimationActionEffect }[] = Object
        .keys(dirtyAnims.timelines)
        .reduce((acc, property) => ([
            ...acc,
            ...dirtyAnims.timelines[property]
              .reduce((acc, t) => ([...acc, ...t.effects
                  .reduce((acc, e) => ([
                    ...acc,
                    ({property: property, keyframe: t.key, effect: e})
                  ]), [])
                ]), []
              )]),
          []);
      allKeyFrames.push(...allKeyFramesTimelines);
    }
    if (dirtyAnims.timeline) {
      const allKeyFramesTimelines: { property: string, keyframe: number, effect: ComponentBlockAnimationActionEffect }[] =
        dirtyAnims.timeline.reduce((acc, t) => ([...acc, ...t.effects
                  .reduce((acc, e) => ([
                    ...acc,
                    ({property: null, keyframe: t.key, effect: e})
                  ]), [])
                ]), []
              );
      allKeyFrames.push(...allKeyFramesTimelines);
    }

    // const timelines = Object.keys(dirtyAnims.timelines).map(key => ({property: key, timelines: dirtyAnims.timelines[key]})).reduce((acc, t) => ([...acc, t]), [] as {property: string, timelines: ComponentBlockAnimationTimelineActions}[]);
    // const allKeyFrames = timelines.reduce((acc, a) => ([...acc, ...a.timelines.effects.map(e => ({key: a.key, effect: e}))]), [] as {key: number, effect: ComponentBlockAnimationActionEffect}[]);
    const animations = groupBy(allKeyFrames, a => a.effect.type);
    const normalizedAnimations: NormalizedAnimation[] = [];
    animations.forEach((as, asType) => {
      const keyFramesGroupByTarget = groupBy(as, a => a.effect.target);
      const finalTargetsEffects: {
        target: string,
        properties: {
          property: string,
          effects: {
            keyframe: number,
            property: string,
            effect: ComponentBlockAnimationActionEffect
          }[]
        }[]
      }[] = [];
      keyFramesGroupByTarget.forEach((effects, target) => {
        const keyframesGroupByProperty = groupBy(effects, e => e.property);
        const properties: {
          property: string,
          effects: {
            keyframe: number,
            property: string,
            effect: ComponentBlockAnimationActionEffect
          }[]
        }[] = [];
        keyframesGroupByProperty.forEach((kf, prop) => {
          const orderedKeys = sort(kf, e => e.keyframe);
          properties.push({property: prop, effects: orderedKeys});
        });
        finalTargetsEffects.push({target: target, properties: properties});
      });
      const effectType = this.getEffectType(asType);

      normalizedAnimations.push({effectTypeName: asType, effectType: effectType, targets: finalTargetsEffects});
    });

    return normalizedAnimations;
  }

  // todo: replace with collection of default effects and component type effects
  private _effectTypes: ComponentBlockAnimationActionEffectType[] = [
    {
      name: 'opacity',
      progressive: true,
      handler: (prevEffect, nextEffect, target, progress) => {
        const startOpacity: number = prevEffect.options.percent;
        const endOpacity: number = nextEffect.options.percent;
        const frameOpacity = startOpacity + (endOpacity - startOpacity) * progress;
        // this.renderer.setStyle(target, 'opacity', frameOpacity);
        const animation: AnimationMetadata | AnimationMetadata[] = [style({'opacity': frameOpacity})];
        this.playAnimation(animation, target);
      },
      buildAnimationFrame: (effect: ComponentBlockAnimationActionEffect) => {
        return {'opacity': effect.options.percent};
      },
      buildAnimeFrame: (effect: ComponentBlockAnimationActionEffect) => {
        return {'opacity': effect.options.percent};
      }
    },
    {
      name: 'move',
      progressive: true,
      handler: (prevEffect, nextEffect, target, progress) => {
        const startX: number = prevEffect.options.x;
        const startY: number = prevEffect.options.y;
        const endX: number = nextEffect.options.x;
        const endY: number = nextEffect.options.y;
        const frameX = startX + (endX - startX) * progress;
        const frameY = startY + (endY - startY) * progress;
        // this.renderer.setStyle(target, 'top', frameX);
        // this.renderer.setStyle(target, 'left', frameY);
        const animation: AnimationMetadata | AnimationMetadata[] = [style({
          'position': 'relative',
          'top': frameY + 'px',
          left: frameX + 'px'
        })];
        this.playAnimation(animation, target);
      },
      buildAnimationFrame: (effect: ComponentBlockAnimationActionEffect) => {
        const styles: AnimationStyle = {};
        if (effect.options.y) {
          styles.top = effect.options.y;
        }
        if (effect.options.x) {
          styles.left = effect.options.x;
        }
        return styles;
      },
      buildAnimeFrame: (effect: ComponentBlockAnimationActionEffect) => {
        const styles: AnimationStyle = {};
        if (effect.options.y) {
          styles.top = effect.options.y;
        }
        if (effect.options.x) {
          styles.left = effect.options.x;
        }
        return styles;
      }
    },
    {
      name: 'rotate',
      progressive: true,
      handler: (prevEffect, nextEffect, target, progress) => {

      },
      buildAnimationFrame: (effect: ComponentBlockAnimationActionEffect) => {
        const styles: AnimationStyle = {composite: 'add'};
        styles.transform = '';
        if (effect.options.y) {
          styles.transform = styles.transform + ' rotateY(' + effect.options.y + ')';
        }
        if (effect.options.x) {
          styles.transform = styles.transform + ' rotateX(' + effect.options.x + ')';
        }
        if (effect.options.z) {
          styles.transform = styles.transform + ' rotateZ(' + effect.options.z + ')';
        }
        return styles;
      },
      buildAnimeFrame: (effect: ComponentBlockAnimationActionEffect) => {
        const styles: AnimationStyle = {};
        if (effect.options.y) {
          styles.rotateY = effect.options.y;
        }
        if (effect.options.x) {
          styles.rotateX = effect.options.x;
        }
        if (effect.options.z) {
          styles.rotateZ = effect.options.z;
        }
        return styles;
      }
    }
  ];

  private playAnimation(animation: AnimationMetadata | AnimationMetadata[], element: any) {
    const factory = this.animationBuilder.build(animation);
    const player = factory.create(element, {});
    player.play();
  }

  private getEffectType(name: string): ComponentBlockAnimationActionEffectType {
    return this._effectTypes.find(e => e.name === name);
  }

  private runComponentAnimation(
    actionName: string, animation: ComponentBlockAnimationAction[], eventValue: number, handler: ComponentBlockAnimationActionType,
    animations: { effectTypeName: string, effectType: ComponentBlockAnimationActionEffectType, targets: { target: string, effects: { key: number, effect: ComponentBlockAnimationActionEffect }[] }[] }[]
  ) {
    animations.forEach(a => {
      a.targets.forEach(at => {
        const targetBlock = this.getAnimationTarget(at.target);

        if (targetBlock) {
          const nextKeyIndex = at.effects.findIndex(e => e.key > eventValue);
          let prevEffect: { key: number, effect: ComponentBlockAnimationActionEffect };
          let nextEffect: { key: number, effect: ComponentBlockAnimationActionEffect };
          if (nextKeyIndex > -1) {
            prevEffect = at.effects[nextKeyIndex - 1];
            nextEffect = at.effects[nextKeyIndex];
          } else {
            prevEffect = null;
            nextEffect = null;
          }

          const keyLength = nextEffect.key - prevEffect.key;
          const relativeValue = eventValue - prevEffect.key;
          const progress = relativeValue / keyLength;
          a.effectType.handler(prevEffect.effect, nextEffect.effect, targetBlock.componentRef.location.nativeElement, progress);
        }
      });
    });
  }

  private buildComponentAnimation(
    animations: NormalizedAnimation[], events: Observable<{ source: BlockRendererService; event: Observable<any> }[]>
    , actionType: ComponentBlockAnimationActionType) {

    const allEvents = events.pipe(switchMap(eventSources => {
      const finalEvents: Observable<any>[] =
        eventSources.reduce((acc1, eventSource) => {
        return [...acc1, ...animations.reduce((acc, a) => {
          return [...acc, ...a.targets.map(at => {

            const targetBlocks$ = eventSource.source.getBlocksChanges(at.target);

            const targetEvent = combineLatest([
              targetBlocks$.pipe(
                map(targetBlocks => {
                  return targetBlocks
                    .filter(t => !!t)
                    .map(targetBlock => {

                    const target = targetBlock.componentRef.location.nativeElement;
                    const allAnims = at.properties.map(property => {
                      let prevKeyframe: number = 0;
                      const frames = property.effects.map(e => {
                        const duration = e.keyframe - prevKeyframe;
                        prevKeyframe = e.keyframe;
                        return ({...a.effectType.buildAnimeFrame(e.effect), duration: duration});
                      });
                      return {property: property.property, frames: frames};
                    });

                    // const parent = timeline({targets: target});
                    return allAnims.map(anim => {
                      // const builtAnim = (parent as any).add({
                      const builtAnim = anime({
                        autoplay: false,
                        targets: target,
                        keyframes: anim.frames,
                        duration: 1,
                        easing: 'linear'
                        // }, 0, true);
                      });
                      return {property: anim.property, player: builtAnim};
                    });

                  });
                })
              ),
              eventSource.event
            ]).pipe(
              takeUntil(this.destroy),
              tap(([players, eventValue]) => {
                  // const allAnims = at.properties.map(property => {
                  //   const frames = property.effects.map(e => ({...a.effectType.buildAnimationFrame(e.effect), offset: e.keyframe}));
                  //   // const framesGroupByKeyframe = groupBy(frames, f => f.keyframe);
                  //   const anim: AnimationStyleMetadata[] = frames.map(f => style(f));
                  //   return {property: property.property, animation: anim};
                  // });
                  // allAnims.forEach(anim => {
                  //   const builtAnim = animate('1s', keyframes(anim.animation));
                  //   const factory = this.animationBuilder.build([builtAnim]);
                  //   const player = factory.create(target);
                  //   player.play();
                  //   player.pause();
                  //   player.setPosition(eventValue[anim.property]);
                  // });

                  if(actionType.progressive) {
                    players.forEach(player => {
                      player.forEach(p => {
                        p.player.seek(p.property ? eventValue[p.property] : eventValue);
                      });
                    });
                  }
                  else {
                    players.forEach(player => {
                      player.forEach(p => {
                        p.player.play();
                      });
                    });
                  }


                  // const nextKeyIndex = at.effects.findIndex(e => e.key > eventValue);
                  // let prevEffect: {key: number, effect: ComponentBlockAnimationActionEffect};
                  // let nextEffect: {key: number, effect: ComponentBlockAnimationActionEffect};
                  // if (nextKeyIndex > -1) {
                  //   prevEffect = at.effects[nextKeyIndex - 1];
                  //   nextEffect = at.effects[nextKeyIndex];
                  // }
                  // else {
                  //   prevEffect = null;
                  //   nextEffect = null;
                  // }
                  //
                  // const keyLength = nextEffect.key - prevEffect.key;
                  // const relativeValue = eventValue - prevEffect.key;
                  // const progress = relativeValue / keyLength;
                  //
                  // targetPlayer.setPosition(progress);
                }
              )
            );
            // targetEvent.subscribe();
            return targetEvent;
          })];
        }, [] as Observable<any>[])];
      }, []);

      return combineLatest(finalEvents);
    }));

    allEvents.pipe(takeUntil(this.destroy)).subscribe();
  }

  private getAnimationTarget(target: ComponentBlockSelector): BlockRendererService {
    switch (target) {
      case "children":
        return null;
        break;
      case "parent":
        return this.parent;
        break;
      case 'self':
        return this;
    }

    if (target.startsWith('#')) {
      const id = target.substring(1);
      return this.shaperManager.getBlock(id);
    }

    return null;
  }

  animationTargetChanges(target: ComponentBlockSelector): Observable<BlockRendererService[]> {
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
            const obsChildren = [start, ...children.map(c => c.animationTargetChanges(target))];
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

  getBlocksChanges(target: ComponentBlockSelector | string[]): Observable<BlockRendererService[]> {
    if (typeof target === 'string') {
      target = target.split(' ');
    }

    if(!target.length) {
      return of([]);
    }

    const firstTarget = target[0];
    const nextTargets = target.slice(1);

    const firstTarget$ = this.animationTargetChanges(firstTarget);
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

  private applyClassAndAttributes() {
    if (this.component.class) {
      this.component.class.forEach(className => {
        this.renderer.addClass(this.componentRef.location.nativeElement, className);
      });
    }
    if (this.component.attributes) {
      Object.keys(this.component.attributes).forEach(attrKey => {
        const attrValue = this.component.attributes[attrKey];
        this.renderer.setAttribute(this.componentRef.location.nativeElement, attrKey, attrValue);
      });
    }

    this.renderer.addClass(this.componentRef.location.nativeElement, 'rxshaper-block'); // add rxshaper block class
    this.renderer.addClass(this.componentRef.location.nativeElement, this.component.id);
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
    if (this.componentType.noBlock !== true) {
      this.renderer.setStyle(this.componentRef.location.nativeElement, 'display', 'block');
    }

    // apply custom style, todo: rework with style tag and class to support :hover...
    if (this.component.style) {
      // large
      Object.keys(this.component.style.large).forEach(cssKey => {
        const cssValue = this.component.style.large[cssKey];
        this.renderer.setStyle(this.componentRef.location.nativeElement, cssKey, cssValue);
      });
    }

    this.renderer.addClass(this.componentRef.location.nativeElement, 'rxshaper-block'); // add rxshaper block class
    this.renderer.addClass(this.componentRef.location.nativeElement, 'rxshaper-block-' + this.componentType.name); // add rxshaper block class
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

  private createChildrenRenderer(child: ComponentBlock) {
    // const childView = this.childrenContainer.element;
    const childInjector = this.createChildInjector(this.componentRef.injector);
    const childRenderer = childInjector.get(BlockRendererService);
    // const childRenderer = new BlockRendererService(this.childrenContainer, this.resolver, childInjector, this.renderer, this.document, this.shaper, this.shaperManager, this);
    childRenderer.onInit(child);
  }

  private hasChildren(): boolean {
    return this.component && this.component.children && this.component.children.length > 0;
  }

  private handleChanges() {
    this.componentRef.changeDetectorRef.detectChanges();
  }

  onDestroy(): void {
    this.childrenRenderers.value.forEach(c => c.onDestroy());
    this.shaperManager.unregister(this.component.id);

    this.componentState.onDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.componentRef.destroy();

    this.executeExtensions((e) => e.onDestroy);
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
