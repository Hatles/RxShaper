import {ComponentRegistryItem} from "./component";
import {InjectionToken, Type} from "@angular/core";

export const RXPAGER_OPTIONS = new InjectionToken<RxPagerOptions[]>('RXPAGER_OPTIONS');

export interface RxPagerOptions {
  components?: ComponentRegistryItem[],
  loaders?: RxPagerLoader[]
}
export interface RxPagerLoader {
  type: Type<any>,
  options?: any
}
