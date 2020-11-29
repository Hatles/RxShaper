import {BlockRendererService} from "../services/block-renderer.service";
import {RxShaperService} from "../services/rxshaper.service";
import {RxShaperHook} from "./hook";
import {RendererService} from "../..";

export type RxShaperExtensionFunction<T = any> = (shaper: RxShaperService, shaperManager: RendererService, renderer: BlockRendererService, properties: T, args?: any) => void;

export interface RxShaperExtension {
  name: string;
  class?: any;
  priority?: number;
  type?: 'angular' | null;
  hooks?: RxShaperHook[];
}
