import {Injectable} from "@angular/core";
import {RxShaperExtension, RxShaperHook} from "../decorators/extension.decorator";
import {fromEvent, Observable} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {CoreExtension} from "./core.extension";
import {CoreHooks, CoreHooksPriorities} from "./hooks/core.hooks";
import {RxShaperService} from "../services/rxshaper.service";
import {ActionScope, BlockRendererService} from "../services/block-renderer.service";
import {RxShaperExtensionFunction} from "@rxshaper/core";

@Injectable()
@RxShaperExtension("rxshaper:core:action")
export class ActionExtension {

  constructor(private shaper: RxShaperService, private core: CoreExtension) {
  }

  private getActionScope(name: string, eventValue: any, renderer: BlockRendererService): ActionScope {
    const baseScope = this.core.getBaseScope(renderer);
    return {
      ...baseScope,
      event: {name: name, value: eventValue}
    };
  }

  @RxShaperHook({
    name: CoreHooks.Render,
    priority: CoreHooksPriorities.Actions
  })
  mapActions: RxShaperExtensionFunction = (shaper, shaperManager, renderer, properties, args) => {
    if (renderer.component.actions) {
      // const instance = renderer.componentRef.instance;
      Object.keys(renderer.component.actions).forEach(actionName => {
          const actionScript = renderer.component.actions[actionName];

          if (actionScript) {
            if (typeof actionScript !== 'string') {
              console.error('Component property binding must be of type string');
            } else {
              let event: Observable<any>;

              if (actionName === 'state.init') { // component any state changes evennt
                event = renderer.componentState.stateInit;
              } else if (actionName === 'state.changes') { // component any state changes evennt
                event = renderer.componentState.stateChanges;
              } else if (actionName === 'state.destroy') { // component any state changes evennt
                event = renderer.componentState.stateDestroy;
              } else if (actionName.startsWith('state.change.') && actionName.split('.').length === 3) { // component one state change
                const property = actionName.split('.')[2];
                event = renderer.componentState.getStateChange(property);
              } else {
                const componentOutput = renderer.componentType.outputs ? renderer.componentType.outputs.find(o => o.name === actionName) : null;

                if (componentOutput) { // angular native output
                  const outputEmitter = renderer.componentRef.instance[actionName];
                  if (outputEmitter instanceof Observable) {
                    event = outputEmitter;
                  } else {
                    console.error('Component output must be an observable');
                  }
                } else { // vanilla js event
                  event = fromEvent(renderer.componentRef.location.nativeElement, actionName);
                }
              }

              event
                .pipe(takeUntil(renderer.destroy))
                .subscribe((eventValue) => this.runComponentAction(actionName, actionScript, eventValue, renderer));
            }
          }
        }
      );
    }
  }

  private runComponentAction(actionName: string, actionScript: string, eventValue: any, renderer: BlockRendererService) {
    const actionScope: ActionScope = this.getActionScope(actionName, eventValue, renderer);
    // const actionResult = _eval(actionScript, 'action.ts', actionScope, false);
    const actionResult = renderer.scriptRunner.run(actionScript, actionScope);

    // apply async script
    if (actionResult) {
      Promise.resolve(actionResult).then(result => {
        // todo: do something
      });
    }
  }

}
