import {Observable} from "rxjs";
import {InjectionToken} from "@angular/core";

export type DynamicModuleInitializer = () => Promise<void> | Observable<void> | void;

export const DYNAMIC_MODULE_INITIALIZER: InjectionToken<DynamicModuleInitializer[]> = new InjectionToken<DynamicModuleInitializer[]>('DYNAMIC_MODULE_INITIALIZER');
