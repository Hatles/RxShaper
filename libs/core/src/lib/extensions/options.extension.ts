import {Injectable} from "@angular/core";
import {RxShaperExtension, RxShaperHook} from "../decorators/extension.decorator";
import {CoreExtension} from "./core.extension";
import {CoreHooks, CoreHooksPriorities} from "./hooks/core.hooks";
import {RxShaperService} from "../services/rxshaper.service";
import {RxShaperExtensionFunction} from "../models/extension";

@Injectable()
@RxShaperExtension("rxshaper:core:option")
export class OptionsExtension {
  constructor(private shaper: RxShaperService, private core: CoreExtension) {
  }

  @RxShaperHook({
    name: CoreHooks.Render,
    priority: CoreHooksPriorities.Options
  })
  mapOptions: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    if (renderer.componentType.inputs && renderer.component.options) {
      renderer.componentState.setState(renderer.component.options);
      // const instance = this.componentRef.instance;
      // this.componentType.inputs.forEach(input => {
      //   instance[input.name] = this.component.options[input.name];
      // });
    }
  }
}
