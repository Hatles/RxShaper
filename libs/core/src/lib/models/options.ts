import {ComponentType} from "./component";
import {RxShaperExtension} from "./extension";
import {InjectionToken, Type} from "@angular/core";
import {BlockWrapper} from "../services/block.wrapper";
import {RxShaperHook} from "./hook";

export const RXSHAPER_OPTIONS = new InjectionToken<RxShaperOptions[]>('RXSHAPER_OPTIONS');

export interface RxShaperExtensionNormalized {
  name: string;
  priority?: number;
  type?: Type<any> | any;
  extension?: RxShaperExtension;
  instance?: any;
  hooks: {[key: string]: RxShaperHook[]}
}

export type RxShaperExtensionOption = RxShaperExtensionOptionType | RxShaperExtensionOptionExtension | any;

export interface RxShaperExtensionOptionBase {
  name: string;
  priority?: number;
  type?: Type<any> | any;
  extension?: RxShaperExtension;
  instance?: any;
}

export interface RxShaperExtensionOptionType extends RxShaperExtensionOptionBase {
  type: Type<any> | any;
}

export interface RxShaperExtensionOptionExtension extends RxShaperExtensionOptionBase {
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
