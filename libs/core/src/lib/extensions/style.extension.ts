import {Injectable} from "@angular/core";
import {RxShaperExtension, RxShaperHook} from "../decorators/extension.decorator";
import {CoreExtension} from "./core.extension";
import {CoreHooks, CoreHooksPriorities} from "./hooks/core.hooks";
import {RxShaperService} from "../services/rxshaper.service";
import {RxShaperExtensionFunction} from "../models/extension";

@Injectable()
@RxShaperExtension("rxshaper:core:style")
export class StyleExtension {
  constructor(private shaper: RxShaperService, private core: CoreExtension) {
  }

  @RxShaperHook({
    name: CoreHooks.Render,
    priority: CoreHooksPriorities.Style
  })
  applyStyle: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    const head = renderer.document.head;
    if (head === null) {
      throw new Error('<head> not found within DOCUMENT.');
    }

    // default style
    if (renderer.componentType.noBlock !== true) {
      renderer.renderer.setStyle(renderer.componentRef.location.nativeElement, 'display', 'block');
    }

    // apply custom style, todo: rework with style tag and class to support :hover...
    if (renderer.component.style) {
      // large
      Object.keys(renderer.component.style.large).forEach(cssKey => {
        const cssValue = renderer.component.style.large[cssKey];
        renderer.renderer.setStyle(renderer.componentRef.location.nativeElement, cssKey, cssValue);
      });
    }

    renderer.renderer.addClass(renderer.componentRef.location.nativeElement, 'rxshaper-block'); // add rxshaper block class
    renderer.renderer.addClass(renderer.componentRef.location.nativeElement, 'rxshaper-block-' + renderer.componentType.name); // add rxshaper block class
    renderer.renderer.addClass(renderer.componentRef.location.nativeElement, renderer.component.id);

    if (renderer.component.class && renderer.component.class.length) {
      renderer.component.class.forEach(c => renderer.renderer.addClass(renderer.componentRef.location.nativeElement, c));
    }
  }
}
