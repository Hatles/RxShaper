import {ComponentType} from "./component";
import {RxShaperExtension} from "../extensions/extension";
import {InjectionToken, Type} from "@angular/core";
import {BlockWrapper} from "./block.wrapper";

export const RXSHAPER_OPTIONS = new InjectionToken<RxShaperOptions[]>('RXSHAPER_OPTIONS');

export interface RxShaperExtensionOption {
  name: string;
  priority: number;
  extension: RxShaperExtension;
}

export interface RxShaperWrapperOption {
  name: string;
  priority: number;
  wrapper: BlockWrapper;
}

export interface RxShaperOptions {
  types?: ComponentType[],
  extensions?: RxShaperExtensionOption[],
  wrappers?: RxShaperWrapperOption[],
}
