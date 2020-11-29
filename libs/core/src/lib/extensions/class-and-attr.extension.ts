import {Injectable} from "@angular/core";
import {RxShaperExtension, RxShaperHook} from "../decorators/extension.decorator";
import {CoreExtension} from "./core.extension";
import {CoreHooks, CoreHooksPriorities} from "./hooks/core.hooks";
import {RxShaperService} from "../services/rxshaper.service";
import {RxShaperExtensionFunction} from "../models/extension";

@Injectable()
@RxShaperExtension("rxshaper:core:class-and-attr")
export class ClassAndAttrExtension {
  constructor(private shaper: RxShaperService, private core: CoreExtension) {
  }

  @RxShaperHook({
    name: CoreHooks.Render,
    priority: CoreHooksPriorities.ClassAndAttr
  })
  applyClassAndAttributes: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    if (renderer.component.class) {
      renderer.component.class.forEach(className => {
        renderer.renderer.addClass(renderer.componentRef.location.nativeElement, className);
      });
    }
    if (renderer.component.attributes) {
      Object.keys(renderer.component.attributes).forEach(attrKey => {
        const attrValue = renderer.component.attributes[attrKey];
        renderer.renderer.setAttribute(renderer.componentRef.location.nativeElement, attrKey, attrValue);
      });
    }

    renderer.renderer.addClass(renderer.componentRef.location.nativeElement, 'rxshaper-block'); // add rxshaper block class
    renderer.renderer.addClass(renderer.componentRef.location.nativeElement, renderer.component.id);
  }
}
