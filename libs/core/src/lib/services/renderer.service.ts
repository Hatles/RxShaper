import {Inject, Injectable, InjectionToken} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {distinctUntilChanged, map} from "rxjs/operators";
import {BlockRendererService} from "./block-renderer.service";

export const RXSHAPER_VIEWPORT = new InjectionToken<any>('RXSHAPER_VIEWPORT');

export interface RendererState {
  [key: string]: BlockRendererService
}

export class RendererStore<S> {
  private store: BehaviorSubject<S>;

  constructor(private state: S) {
    this.store = new BehaviorSubject<S>(state);
  }

  select<R>(project: (store: S) => R): Observable<R> {
    return this.store.asObservable().pipe(map(project), distinctUntilChanged());
  }

  getValue(): S {
    return this.store.getValue();
  }

  set(state: S) {
    this.store.next(state);
  }

  update(state: Partial<S>) {
    this.store.next(Object.assign({}, this.getValue(), state));
  }
}

@Injectable()
export class RendererService {
  private store: RendererStore<RendererState>;
  private rootBlockRenderer: BlockRendererService;

  constructor(@Inject(RXSHAPER_VIEWPORT) public viewport: any) {
    this.store = new RendererStore<RendererState>({});
  }

  blocksChanges(id: keyof RendererState): Observable<BlockRendererService> {
    const control$ = this.store.select(state => state[id]);
    return control$.pipe(distinctUntilChanged());
  }

  getBlock(id: keyof RendererState) {
    return this.store.getValue()[id];
  }

  register(id: keyof RendererState, block: BlockRendererService) {
    this.store.update({[id]: block});
  }

  unregister(id: keyof RendererState) {
    const state = {...this.store.getValue()};
    delete state[id];
    this.store.set(state);
  }

  registerRoot(block: BlockRendererService) {
    this.rootBlockRenderer = block;
  }

  getRoot(): BlockRendererService {
    return this.rootBlockRenderer;
  }
}
