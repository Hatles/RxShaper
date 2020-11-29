import {Injectable} from "@angular/core";
import {RxShaperExtension, RxShaperHook} from "../decorators/extension.decorator";
import {CoreExtension} from "./core.extension";
import {Observable} from "rxjs";
import {CoreHooks, CoreHooksPriorities} from "./hooks/core.hooks";
import {RxShaperService} from "../services/rxshaper.service";
import {BlockRendererService, ScriptScope} from "../services/block-renderer.service";
import {RxShaperExtensionFunction} from "../models/extension";

@Injectable()
@RxShaperExtension("rxshaper:core:script")
export class ScriptExtension {
  constructor(private shaper: RxShaperService, private core: CoreExtension) {
  }

  private getScriptScope(renderer: BlockRendererService): ScriptScope {
    return this.core.getBaseScope(renderer);
  }

  @RxShaperHook({
    name: CoreHooks.Render,
    priority: CoreHooksPriorities.Scripts
  })
  applyScript: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    if (renderer.component.script) {
      if (typeof renderer.component.script !== 'string') {
        console.error('Component property script must be of type string');
        return;
      }

      const scriptScope: ScriptScope = this.getScriptScope(renderer);
      // const bindingValue = _eval(this.component.script, 'script.ts', scriptScope, false);
      const scriptResult = renderer.scriptRunner.run(renderer.component.script, scriptScope);

      // apply async script
      if (scriptResult) {
        if (scriptResult instanceof Observable) {
          scriptResult.subscribe(result => {
            // todo: do something
          });
        } else {
          Promise.resolve(scriptResult).then(result => {
            // todo: do something
          });
        }
      }
    }
  }
}
