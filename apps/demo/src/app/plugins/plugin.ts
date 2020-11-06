import {ApplicationRef, ComponentFactoryResolver, Injector} from "@angular/core";
import {AngularComponent} from "../decorators/block.decorator";

export type Plugin<T = any> = (editor: any, options: T) => void;

