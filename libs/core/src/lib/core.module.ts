import {ModuleWithProviders, NgModule} from '@angular/core';
import {RXSHAPER_OPTIONS, RxShaperOptions} from "./models/options";
import {RxShaperConfig} from "./services/rxshaper.config";
import {RxShaperService} from "./services/rxshaper.service";
import {RendererComponent} from "./components/renderer/renderer.component";
import {BlockRendererDirective} from "./directives/block-renderer.directive";
import {BlockRendererComponent} from "./components/block-renderer/block-renderer.component";
import {defaultExtensions} from "./extensions/extensions";

export function defaultRxShaperConfig(): RxShaperOptions {
  return {
    extensions: [
      ...defaultExtensions,
    ],
  };
}


@NgModule({
  imports: [],
  declarations: [
    RendererComponent,
    BlockRendererComponent,
    BlockRendererDirective
  ],
  exports: [
    RendererComponent
  ],
})
export class RxShaperCoreModule {
  static forRoot(config: RxShaperOptions = {}): ModuleWithProviders<RxShaperCoreModule> {
    return {
      ngModule: RxShaperCoreModule,
      providers: [
        { provide: RXSHAPER_OPTIONS, multi: true, useFactory: defaultRxShaperConfig, deps: [] },
        { provide: RXSHAPER_OPTIONS, useValue: config, multi: true },
        RxShaperConfig,
        RxShaperService,

        // extensions
        ...defaultExtensions
      ],
    };
  }

  static forChild(config: RxShaperOptions = {}): ModuleWithProviders<RxShaperCoreModule> {
    return {
      ngModule: RxShaperCoreModule,
      providers: [{ provide: RXSHAPER_OPTIONS, useValue: config, multi: true },
        RxShaperConfig,
        RxShaperService
      ],
    };
  }

  constructor() {
  }
}
