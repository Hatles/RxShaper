import {RXSHAPER_OPTIONS, RxShaperOptions} from "../services/rxshaper.options";
import {ModuleWithProviders, NgModule} from "@angular/core";
import {RxShaperConfig} from "../services/rxshaper.config";
import {RxShaperService} from "../services/rxshaper.service";

export function defaultRxShaperConfig(): RxShaperOptions {
  return {
    types: [
      ...RxShaperService.Components
    ],
    extensions: [
    ],
  };
}

@NgModule({
  declarations: [],
  exports: [],
  imports: [],
})
export class RxShaperModule {
  static forRoot(config: RxShaperOptions = {}): ModuleWithProviders<RxShaperModule> {
    return {
      ngModule: RxShaperModule,
      providers: [
        { provide: RXSHAPER_OPTIONS, multi: true, useFactory: defaultRxShaperConfig, deps: [] },
        { provide: RXSHAPER_OPTIONS, useValue: config, multi: true },
        RxShaperConfig,
        RxShaperService,
      ],
    };
  }

  static forChild(config: RxShaperOptions = {}): ModuleWithProviders<RxShaperModule> {
    return {
      ngModule: RxShaperModule,
      providers: [{ provide: RXSHAPER_OPTIONS, useValue: config, multi: true },
        RxShaperConfig,
        RxShaperService
      ],
    };
  }

  constructor() {
  }
}
