import {Injectable} from "@angular/core";
import {RxShaperExtension, RxShaperHook} from "../decorators/extension.decorator";
import {CoreExtension} from "./core.extension";
import {Observable} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {CoreHooks, CoreHooksPriorities} from "./hooks/core.hooks";
import {RxShaperService} from "../services/rxshaper.service";
import {BindingScope, BlockRendererService} from "../services/block-renderer.service";
import {RxShaperExtensionFunction} from "@rxshaper/core";

@Injectable()
@RxShaperExtension("rxshaper:core:binding")
export class BindingExtension {

  constructor(private shaper: RxShaperService, private core: CoreExtension) {
  }

  private getBindingScope(property: PropertyKey, renderer: BlockRendererService): BindingScope {
    const baseScope = this.core.getBaseScope(renderer);
    return {
      ...baseScope,
      property: property
    };
  }

  @RxShaperHook({
    name: CoreHooks.Render,
    priority: CoreHooksPriorities.Bindings
  })
  mapBindings: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    if (renderer.componentType.inputs && renderer.component.bindings) {
      // const instance = this.componentRef.instance;
      renderer.componentType.inputs.forEach(input => {
        const binding = renderer.component.bindings[input.name];

        if (binding) {
          if (typeof binding !== 'string') {
            console.error('Component property binding must be of type string');
          } else {
            const bindingScope: BindingScope = this.getBindingScope(input.name, renderer);

            // const bindingValue = _eval(binding, 'binding.ts', bindingScope, false);
            const bindingResult = renderer.scriptRunner.run(binding, bindingScope);
            // apply binding
            if (bindingResult) {
              if (bindingResult instanceof Observable) {
                bindingResult.pipe(takeUntil(renderer.destroy)).subscribe(result => renderer.componentState.set(input.name, result));
              } else {
                Promise.resolve(bindingResult).then(result => renderer.componentState.set(input.name, result));
              }
            }
          }
        }
      });
    }
  }

}
