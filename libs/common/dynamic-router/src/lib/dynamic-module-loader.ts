import {Injectable, NgModuleRef} from "@angular/core";
import {DYNAMIC_MODULE_INITIALIZER} from "./dynamic-module-initializer";
import {forkJoin, from, Observable, of} from "rxjs";
import {map} from "rxjs/operators";

@Injectable()
export class DynamicModuleLoader {
  load<T>(moduleRef: NgModuleRef<T>): Promise<NgModuleRef<T>> {

    const initialisers = moduleRef.injector.get(DYNAMIC_MODULE_INITIALIZER, []);

    if (initialisers && initialisers.length) {
      const allInits = initialisers.map(i => {
        const initResult = i();

        if(initResult instanceof Promise) {
          return from(initResult);
        }
        if(initResult instanceof Observable) {
          return initResult;
        }
        return of(initResult);
      });

      return forkJoin(allInits).pipe(map(() => moduleRef)).toPromise();
    }

    return new Promise(resolve => resolve(moduleRef));
  }
}
