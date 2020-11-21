import {BlockRendererService} from "../components/block-renderer/block-renderer.service";
import {RxShaperService} from "../services/rxshaper.service";

export type RxShaperExtensionFunction<T = any, P = any> = (shaper: RxShaperService, renderer: BlockRendererService, properties: P) => T;

export interface RxShaperExtension<T = any> {
  beforeInitPage(shaper: RxShaperService, rootRenderer: BlockRendererService, properties: T): void;
  afterInitPage(shaper: RxShaperService, rootRenderer: BlockRendererService, properties: T): void;

  onInit(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  onDestroy(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;

  beforeRender(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  afterRender(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  beforeCreateState(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  afterCreateState(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  beforeStateBindings(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  afterStateBindings(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  beforeApplyStyle(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  afterApplyStyle(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  beforeRenderChildren(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
  afterRenderChildren(shaper: RxShaperService, renderer: BlockRendererService, properties: T): void;
}

export class BaseRxShaperExtension<P = any> implements RxShaperExtension<P> {
  afterApplyStyle(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  afterCreateState(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  afterRender(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  afterStateBindings(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  beforeApplyStyle(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  beforeCreateState(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  beforeRender(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  beforeStateBindings(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  afterRenderChildren(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  beforeRenderChildren(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  onDestroy(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  onInit(shaper: RxShaperService, renderer: BlockRendererService, properties: P): void {
  }

  afterInitPage(shaper: RxShaperService, rootRenderer: BlockRendererService, properties: P): void {
  }

  beforeInitPage(shaper: RxShaperService, rootRenderer: BlockRendererService, properties: P): void {
  }
}
