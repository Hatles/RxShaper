import {Observable} from "rxjs";
import {InjectionToken, StaticProvider} from "@angular/core";

export type DynamicModuleInitializer = () => Promise<void> | Observable<void> | void;
// export type DynamicModuleInitializer = () => Promise<void | StaticProvider[]> | Observable<void | StaticProvider[]> | void | StaticProvider[];

export const DYNAMIC_MODULE_INITIALIZER: InjectionToken<DynamicModuleInitializer[]> = new InjectionToken<DynamicModuleInitializer[]>('DYNAMIC_MODULE_INITIALIZER');
